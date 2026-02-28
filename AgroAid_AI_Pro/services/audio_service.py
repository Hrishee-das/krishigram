import io
import re
import os
import speech_recognition as sr
from pydub import AudioSegment

def process_audio_to_text(audio_bytes: bytes, language: str = "English") -> str:
    """
    Converts incoming audio bytes to Text using Groq Whisper.
    """
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        audio_io = io.BytesIO(audio_bytes)
        
        # Try to use Pydub for normalization if ffmpeg is available
        try:
            audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes))
            audio_io = io.BytesIO()
            audio_segment.export(audio_io, format="mp3")
            audio_io.seek(0)
            audio_io.name = "audio.mp3"
            print("DEBUG: Audio converted using Pydub.")
        except Exception as pydub_err:
            print(f"DEBUG: Pydub/FFmpeg fallback: {pydub_err}. Sending raw bytes.")
            audio_io.seek(0)
            # Default to m4a if conversion fails, as that's what the mobile app sends
            audio_io.name = "audio.m4a" 

        # Map our languages to ISO tags expected by Groq
        lang_mapping = {
            "English": "en", "en": "en",
            "Hindi": "hi", "hi": "hi",
            "Marathi": "mr", "mr": "mr",
            "Tamil": "ta", "ta": "ta"
        }
        lang_code = lang_mapping.get(language, "en")

        transcription = client.audio.transcriptions.create(
            file=audio_io,
            model="whisper-large-v3",
            language=lang_code,
            response_format="json"
        )
        
        text = transcription.text
        print(f"Decoded Audio (Groq): {text}")
        return text
    except Exception as e:
        print(f"Audio Processing Error (Groq): {e}")
        # Fallback or returning error
        return f"[Audio error: {str(e)}]"

def format_for_tts(text: str) -> str:
    """
    Cleans up markdown and special characters from the text so it is 
    friendly for Text-to-Speech engines.
    """
    text = re.sub(r'[^\w\s,.\-?!:;]', '', text)
    text = text.replace('*', '').replace('#', '').strip()
    return text
