import os
import time
import uuid
from flask import Blueprint, request, jsonify, url_for
from firebase_admin import firestore
from werkzeug.utils import secure_filename

upload_bp = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('', methods=['POST'])
def upload_file():
    try:
        user_id = request.form.get('userId')
        if not user_id:
            return jsonify({"error": "userId is required"}), 400

        # Handle raw text upload
        pasted_text = request.form.get('text')
        if pasted_text:
            filename = 'pasted-text.txt'
            file_type = 'txt'
            file_data = pasted_text.encode('utf-8')
        else:
            # Handle file upload
            if 'file' not in request.files:
                return jsonify({"error": "No file part"}), 400
            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "No selected file"}), 400
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_type = filename.rsplit('.', 1)[1].lower()
                file_data = file.read()
            else:
                return jsonify({"error": "Invalid file type"}), 400

        # Save locally to bypass Firebase Storage completely (since bucket isn't initialized)
        unique_filename = f"{int(time.time())}_{uuid.uuid4().hex[:8]}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        with open(file_path, 'wb') as f:
            f.write(file_data)
            
        # Build the download URL dynamically so it works locally AND in production
        base_url = request.host_url.rstrip('/')
        download_url = f"{base_url}/api/upload/files/{unique_filename}"

        # Save to Firestore
        db = firestore.client()
        doc_ref = db.collection('materials').document()
        
        material_data = {
            'userId': user_id,
            'title': filename.rsplit('.', 1)[0],
            'type': file_type,
            'url': download_url, # Store the local URL
            'createdAt': firestore.SERVER_TIMESTAMP,
        }
        
        doc_ref.set(material_data)

        return jsonify({
            "message": "Upload successful",
            "material_id": doc_ref.id,
            "title": material_data['title'],
            "url": download_url
        }), 200

    except Exception as e:
        print(f"Error during upload: {e}")
        return jsonify({"error": str(e)}), 500

from flask import send_from_directory
@upload_bp.route('/files/<filename>', methods=['GET'])
def get_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@upload_bp.route('/materials', methods=['GET'])
def get_materials():
    """Fetch all materials for a user (bypasses client-side security rules)"""
    try:
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({"error": "userId is required"}), 400

        db = firestore.client()
        # Use admin SDK - no orderBy to avoid composite index requirement
        col_ref = db.collection('materials')
        docs_query = col_ref.where('userId', '==', user_id).limit(50)
        docs = docs_query.stream()

        materials = []
        for doc in docs:
            d = doc.to_dict()
            # Convert Firestore timestamp to string
            created = d.get('createdAt')
            created_str = ''
            if created:
                try:
                    created_str = created.isoformat()
                except:
                    created_str = str(created)
            materials.append({
                'id': doc.id,
                'title': d.get('title', 'Untitled'),
                'type': d.get('type', ''),
                'url': d.get('url', ''),
                'createdAt': created_str
            })

        # Sort in Python by createdAt descending (newest first)
        materials.sort(key=lambda x: x['createdAt'], reverse=True)
        materials = materials[:20]  # Return top 20

        return jsonify({'materials': materials}), 200
    except Exception as e:
        print(f"Error fetching materials: {e}")
        return jsonify({'materials': [], 'error': str(e)}), 200
