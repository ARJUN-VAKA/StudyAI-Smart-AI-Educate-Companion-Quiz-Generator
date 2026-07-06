import os
import requests
import json
import io
import PyPDF2
from docx import Document
from groq import Groq
from config import Config

# Initialize Groq client
groq_client = Groq(api_key=Config.GROQ_API_KEY) if Config.GROQ_API_KEY else None

MODEL = "llama-3.1-8b-instant"

def extract_text_from_url(url, file_type):
    """Downloads a file from a URL and extracts its text based on file_type."""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        content = response.content
        text = ""
        
        if file_type == "pdf":
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in reader.pages:
                text += page.extract_text() + "\n"
        elif file_type == "docx":
            doc = Document(io.BytesIO(content))
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            # Assume txt or raw text
            text = content.decode('utf-8', errors='ignore')
            
        return text.strip()
    except Exception as e:
        print(f"Error extracting text: {e}")
        raise ValueError(f"Failed to read file from URL: {str(e)}")

def generate_summary(text):
    """Generates a structured summary using Groq Llama 3."""
    if not groq_client:
        raise ValueError("Groq API key not configured")
        
    prompt = f"""
You are an expert academic tutor. Provide a highly structured, beautiful, and easy-to-understand summary of the following study material.
Use extensive markdown formatting to make it readable.
Structure the summary STRICTLY as follows:
# [Main Title]

## 🎯 Core Concept
A brief, easy-to-understand 2-3 sentence overview.

## 🔑 Key Takeaways
- Bullet points with **bold** keywords.
- Clear, concise points.

## 📝 Detailed Breakdown
Break down the main topics into subheadings (###) and explain them simply. Use analogies if helpful.

## 💡 Important Definitions
- **Term 1**: Simple definition.

MATERIAL:
{text[:20000]}
"""
    try:
        completion = groq_client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=2048
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Groq error: {e}")
        raise ValueError(f"Failed to generate summary: {str(e)}")

def generate_flashcards(text):
    """Generates flashcards in JSON format."""
    if not groq_client:
        raise ValueError("Groq API key not configured")
        
    prompt = f"""
You are an expert academic tutor. Generate 10-15 high-quality flashcards based on the following material.
Output STRICTLY in JSON format as an array of objects with the following schema:
[
  {{
    "id": 1,
    "question": "Clear, concise question",
    "answer": "Direct, accurate answer",
    "topic": "Main topic/category",
    "difficulty": "easy" | "medium" | "hard"
  }}
]
DO NOT output any markdown blocks (like ```json), just raw valid JSON.

MATERIAL:
{text[:20000]}
"""
    try:
        completion = groq_client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"} # Use json mode if supported, or ensure prompt handles it
        )
        
        # Fallback parsing in case model adds ```json
        result = completion.choices[0].message.content
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0]
        elif "```" in result:
            result = result.split("```")[1].split("```")[0]
            
        try:
            # Handle if the model wrapped it in an object like {"flashcards": [...]}
            parsed = json.loads(result.strip())
            if isinstance(parsed, dict) and 'flashcards' in parsed:
                return parsed['flashcards']
            if isinstance(parsed, dict) and 'data' in parsed:
                return parsed['data']
            if isinstance(parsed, dict) and next(iter(parsed.values()), None):
                return next(iter(parsed.values()))
            return parsed
        except json.JSONDecodeError:
            print(f"Raw output failed to parse: {result}")
            # Try to force parse array
            start = result.find('[')
            end = result.rfind(']') + 1
            if start != -1 and end != 0:
                return json.loads(result[start:end])
            return []
            
    except Exception as e:
        print(f"Groq error: {e}")
        raise ValueError(f"Failed to generate flashcards: {str(e)}")

def generate_quiz(text, count=10, type="mcq", difficulty="medium"):
    """Generates a quiz in JSON format."""
    if not groq_client:
        raise ValueError("Groq API key not configured")
        
    prompt = f"""
You are an expert academic tutor. Generate a {count}-question {type.replace('_', ' ')} quiz based on the material below.
Difficulty: {difficulty}.

Output STRICTLY in JSON format as an array of objects with the following schema:
For mcq:
{{ "id": 1, "type": "mcq", "question": "...", "options": ["A", "B", "C", "D"], "correct_answer": "Exact string from options", "explanation": "..." }}

For true_false:
{{ "id": 1, "type": "true_false", "question": "...", "options": ["True", "False"], "correct_answer": "True" or "False", "explanation": "..." }}

For short_answer:
{{ "id": 1, "type": "short_answer", "question": "...", "correct_answer": "...", "explanation": "..." }}

DO NOT output any markdown blocks (like ```json), just raw valid JSON.

MATERIAL:
{text[:20000]}
"""
    try:
        completion = groq_client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        result = completion.choices[0].message.content
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0]
        elif "```" in result:
            result = result.split("```")[1].split("```")[0]
            
        try:
            parsed = json.loads(result.strip())
            if isinstance(parsed, dict):
                # Search for the array inside the dict
                for k, v in parsed.items():
                    if isinstance(v, list):
                        return v
            return parsed
        except json.JSONDecodeError:
            start = result.find('[')
            end = result.rfind(']') + 1
            if start != -1 and end != 0:
                return json.loads(result[start:end])
            return []
            
    except Exception as e:
        print(f"Groq error: {e}")
        raise ValueError(f"Failed to generate quiz: {str(e)}")

def generate_schedule(text):
    """Generates a 7-day study schedule in JSON format."""
    if not groq_client:
        raise ValueError("Groq API key not configured")
        
    prompt = f"""
You are an expert academic tutor. Generate a 7-day study schedule based on the material below.
Output STRICTLY in JSON format as an array of day objects:
[
  {{
    "day": "Day 1",
    "date": "Focus Area",
    "tasks": [
      {{
        "time": "e.g., Morning",
        "topic": "Topic description",
        "duration": "e.g., 45 mins",
        "priority": "high" | "medium" | "low",
        "tip": "Short study tip"
      }}
    ]
  }}
]
Create 7 days.
DO NOT output any markdown blocks (like ```json), just raw valid JSON.

MATERIAL:
{text[:20000]}
"""
    try:
        completion = groq_client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        result = completion.choices[0].message.content
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0]
        elif "```" in result:
            result = result.split("```")[1].split("```")[0]
            
        try:
            parsed = json.loads(result.strip())
            if isinstance(parsed, dict):
                for k, v in parsed.items():
                    if isinstance(v, list):
                        return v
            return parsed
        except json.JSONDecodeError:
            start = result.find('[')
            end = result.rfind(']') + 1
            if start != -1 and end != 0:
                return json.loads(result[start:end])
            return []
            
    except Exception as e:
        print(f"Groq error: {e}")
        raise ValueError(f"Failed to generate schedule: {str(e)}")
