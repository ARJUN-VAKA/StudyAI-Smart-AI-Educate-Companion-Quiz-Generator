import os
from flask import Flask
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, storage

def create_app():
    app = Flask(__name__)
    # Load configuration from environment variables
    app.config['FIREBASE_CERT'] = os.getenv('FIREBASE_CERT')
    app.config['FIREBASE_STORAGE_BUCKET'] = os.getenv('FIREBASE_STORAGE_BUCKET')
    app.config['GROQ_API_KEY'] = os.getenv('GROQ_API_KEY')

    # Initialize Firebase Admin SDK
    if not firebase_admin._apps:
        cred_path = app.config['FIREBASE_CERT']
        if cred_path and os.path.isfile(cred_path):
            cred = credentials.Certificate(cred_path)
        else:
            # Use default credentials (for local development you can set GOOGLE_APPLICATION_CREDENTIALS)
            cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred, {
            'storageBucket': app.config['FIREBASE_STORAGE_BUCKET']
        })

    # Enable CORS for all origins (adjust in production)
    CORS(app)

    # Register blueprints (routes)
    from .routes.auth import auth_bp
    from .routes.upload import upload_bp
    from .routes.summary import summary_bp
    from .routes.flashcards import flashcards_bp
    from .routes.quiz import quiz_bp
    from .routes.schedule import schedule_bp
    from .routes.analytics import analytics_bp
    from .routes.settings import settings_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(summary_bp, url_prefix='/api/summary')
    app.register_blueprint(flashcards_bp, url_prefix='/api/flashcards')
    app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
    app.register_blueprint(schedule_bp, url_prefix='/api/schedule')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(settings_bp, url_prefix='/api/settings')

    return app
