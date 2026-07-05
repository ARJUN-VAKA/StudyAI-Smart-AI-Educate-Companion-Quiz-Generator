from flask import Blueprint, request, jsonify
from services.ai_service import extract_text_from_url, generate_schedule
from utils.firebase_helpers import get_material_data

schedule_bp = Blueprint('schedule', __name__)

@schedule_bp.route('/generate', methods=['POST'])
def generate():
    data = request.json
    material_id = data.get('material_id')
    
    if not material_id:
        return jsonify({"error": "material_id is required"}), 400
        
    try:
        material = get_material_data(material_id)
        url = material.get('url')
        file_type = material.get('type', 'txt')
        
        if not url:
            return jsonify({"error": "Material URL not found"}), 400
            
        text = extract_text_from_url(url, file_type)
        
        if not text:
            return jsonify({"error": "No text could be extracted from the material"}), 400
            
        schedule = generate_schedule(text)
        
        return jsonify({"schedule": schedule}), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to generate schedule: {str(e)}"}), 500
