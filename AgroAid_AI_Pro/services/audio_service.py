import io
import re
import speech_recognition as sr
from pydub import AudioSegment

def process_audio_to_text(audio_bytes: bytes, language: str = "English") -> str:
    """
    Converts incoming audio bytes to Text using Groq Whisper.
    """
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        # Convert WebM bytes to Wav/Mp3 using Pydub so Whisper can read it
        audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes))
        audio_io = io.BytesIO()
        audio_segment.export(audio_io, format="mp3")
        audio_io.seek(0)
        
        # Groq expects a file-like object with a name
        audio_io.name = "audio.mp3"

        # Map our languages to ISO tags expected by Groq
        lang_mapping = {
            "English": "en",
            "en": "en",
            "Hindi": "hi",
            "hi": "hi",
            "Marathi": "mr",
            "mr": "mr",
            "Tamil": "ta",
            "ta": "ta"
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
