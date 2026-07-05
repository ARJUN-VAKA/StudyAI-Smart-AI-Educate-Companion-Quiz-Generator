from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
import firebase_admin
from firebase_admin import credentials

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max upload
    
    # Enable CORS for frontend requests
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize Firebase Admin using env variables
    try:
        if not firebase_admin._apps:
            if Config.FIREBASE_PROJECT_ID and Config.FIREBASE_PRIVATE_KEY:
                cred_dict = {
                    "type": "service_account",
                    "project_id": Config.FIREBASE_PROJECT_ID,
                    "private_key_id": Config.FIREBASE_PRIVATE_KEY_ID,
                    "private_key": Config.FIREBASE_PRIVATE_KEY,
                    "client_email": Config.FIREBASE_CLIENT_EMAIL,
                    "client_id": Config.FIREBASE_CLIENT_ID,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": Config.FIREBASE_CLIENT_X509_CERT_URL or f"https://www.googleapis.com/robot/v1/metadata/x509/{Config.FIREBASE_CLIENT_EMAIL}"
                }
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred, {
                    'storageBucket': Config.FIREBASE_STORAGE_BUCKET
                })
            else:
                print("Warning: Firebase credentials not found in environment variables.")
    except Exception as e:
        print(f"Warning: Firebase admin not initialized correctly. Error: {e}")

    # Register Blueprints
    from routes.summary import summary_bp
    from routes.flashcards import flashcards_bp
    from routes.quiz import quiz_bp
    from routes.schedule import schedule_bp
    from routes.upload import upload_bp
    
    app.register_blueprint(summary_bp, url_prefix='/api/summary')
    app.register_blueprint(flashcards_bp, url_prefix='/api/flashcards')
    app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
    app.register_blueprint(schedule_bp, url_prefix='/api/schedule')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "service": "StudyAI Backend"}), 200
        
    # Global error handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        return jsonify({"error": str(e)}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.DEBUG)
