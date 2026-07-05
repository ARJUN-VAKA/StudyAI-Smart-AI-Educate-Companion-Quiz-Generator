// backend/app/auth.py
import os
from flask import Blueprint, request, jsonify
from firebase_admin import auth as firebase_auth

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    token = data.get('token')
    if not token:
        return jsonify({'error': 'Missing token'}), 400
    try:
        decoded = firebase_auth.verify_id_token(token)
        uid = decoded['uid']
        return jsonify({'uid': uid}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    try:
        user = firebase_auth.create_user(email=email, password=password)
        return jsonify({'uid': user.uid}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
    try:
        link = firebase_auth.generate_password_reset_link(email)
        return jsonify({'resetLink': link}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
