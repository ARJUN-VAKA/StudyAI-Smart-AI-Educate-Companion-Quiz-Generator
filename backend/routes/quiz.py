from flask import Blueprint, request, jsonify
from services.ai_service import extract_text_from_url, generate_quiz
from utils.firebase_helpers import get_material_data

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/generate', methods=['POST'])
def generate():
    data = request.json
    material_id = data.get('material_id')
    question_count = data.get('question_count', 10)
    quiz_type = data.get('quiz_type', 'mcq')
    difficulty = data.get('difficulty', 'medium')
    
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
            
        quiz = generate_quiz(text, question_count, quiz_type, difficulty)
        
        return jsonify({"questions": quiz}), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to generate quiz: {str(e)}"}), 500
