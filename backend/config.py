import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
    
    # Firebase Service Account details
    FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID")
    FIREBASE_PRIVATE_KEY_ID = os.environ.get("FIREBASE_PRIVATE_KEY_ID")
    # Handle literal \n in the .env string if it exists
    private_key = os.environ.get("FIREBASE_PRIVATE_KEY", "")
    FIREBASE_PRIVATE_KEY = private_key.replace("\\n", "\n") if "\\n" in private_key else private_key
    
    FIREBASE_CLIENT_EMAIL = os.environ.get("FIREBASE_CLIENT_EMAIL")
    FIREBASE_CLIENT_ID = os.environ.get("FIREBASE_CLIENT_ID")
    FIREBASE_CLIENT_X509_CERT_URL = os.environ.get("FIREBASE_CLIENT_X509_CERT_URL")
    FIREBASE_STORAGE_BUCKET = os.environ.get("FIREBASE_STORAGE_BUCKET")
    
    DEBUG = os.environ.get("FLASK_DEBUG", "1") == "1"
    PORT = int(os.environ.get("PORT", 5000))
