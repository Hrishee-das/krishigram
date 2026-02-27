import re
import os
from dotenv import load_dotenv
from services.llm_service import _generate_ai_response

load_dotenv(override=True)

# Mocking Bhashini API behavior
SUPPORTED_LANGUAGES = {
    "Hindi": "hi", "English": "en", "Marathi": "mr", 
    "Tamil": "ta", "Telugu": "te", "Bengali": "bn", 
    "Gujarati": "gu", "Punjabi": "pa", "Kannada": "kn"
}

def detect_language(text: str) -> str:
    """
    Detects language of the input text.
    In a real app, this would call Bhashini or Google Cloud Translation API.
    """
    # Simple mock: if it contains Devanagari, assume Hindi for now, otherwise English
    if re.search(r'[\u0900-\u097F]', text):
        return "Hindi"
    return "English"

def translate_text(text: str, target_language: str) -> str:
    """
    Translates text to the target language using OpenRouter/Groq.
    """
    if target_language == "English":
        return text
        
    try:
        prompt = f"Translate the following agricultural text to {target_language}. Maintain the technical meaning. Respond ONLY with the translated text, no other conversational filler. Text: {text}"
        # Use our smart engine which prioritizes Trinity/OpenRouter
        response_text = _generate_ai_response(prompt, json_mode=False)
        if response_text:
            return response_text.strip()
        return text
    except Exception as e:
        print(f"Translation Error: {e}")
        # Return english fallback if API fails
        return text

