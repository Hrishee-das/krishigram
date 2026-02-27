import io
import re
import speech_recognition as sr
from pydub import AudioSegment

def process_audio_to_text(audio_bytes: bytes, language: str = "English") -> str:
    """
    Converts incoming audio bytes (uploaded as WebM from browser) to Text.
    Uses generic SpeechRecognition (Google).
    """
    try:
        # Convert WebM bytes to Wav using Pydub so SpeechRecognition can read it
        audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes))
        wav_io = io.BytesIO()
        audio_segment.export(wav_io, format="wav")
        wav_io.seek(0)
        
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)
            
        # Map our languages to BCP-47 tags expected by Google Speech
        # Hindi: hi-IN, Marathi: mr-IN, Tamil: ta-IN...
        lang_mapping = {
            "English": "en-US",
            "Hindi": "hi-IN",
            "Marathi": "mr-IN",
            "Tamil": "ta-IN",
            "Telugu": "te-IN",
            "Bengali": "bn-IN",
            "Gujarati": "gu-IN",
            "Punjabi": "pa-IN",
            "Kannada": "kn-IN"
        }
        bcp47_lang = lang_mapping.get(language, "en-US")
        
        # Recognize using Google Web Speech API (Free tier built into SpeechRecognition)
        text = recognizer.recognize_google(audio_data, language=bcp47_lang)
        print(f"Decoded Audio: {text}")
        return text
    except sr.UnknownValueError:
        return "[Audio not clearly understood]"
    except sr.RequestError as e:
        return f"[Speech Recognition API error: {e}]"
    except Exception as e:
        print(f"Audio Processing Error: {e}")
        return "[Mock processed audio message. Pydub/FFmpeg missing in environment.]"

def format_for_tts(text: str) -> str:
    """
    Cleans up markdown and special characters from the text so it is 
    friendly for Text-to-Speech engines.
    """
    text = re.sub(r'[^\w\s,.\-?!:;]', '', text)
    text = text.replace('*', '').replace('#', '').strip()
    return text
