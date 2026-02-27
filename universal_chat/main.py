import os
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uvicorn
import json

# Load variables
load_dotenv(override=True)

# Import our copied AI services
import services.llm_service as llm_service
import services.rag_service as rag_service
import services.language_service as lang_service
import services.audio_service as audio_service

# Initialize Universal Chat System
app = FastAPI(title="Universal Chat AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "Universal Chat Engine is running!"}

@app.post("/api/universal_chat")
async def process_universal_chat(
    text: Optional[str] = Form(None),
    voice: Optional[UploadFile] = File(None),
    language: str = Form("English")
):
    try:
        combined_queries = []
        
        # 1. Process Voice input directly to Text using Groq Whisper model
        if voice and voice.filename:
            audio_bytes = await voice.read()
            spoken_text = audio_service.process_audio_to_text(audio_bytes, language)
            combined_queries.append(spoken_text)
            
        # 2. Add raw text query
        if text:
            combined_queries.append(text)
            
        if not combined_queries:
            return JSONResponse(status_code=400, content={"error": "Must provide text or voice query"})
            
        final_query = " | ".join(combined_queries)
        
        # 3. Retrieve context from Pinecone (Vector DB)
        rag_context = rag_service.retrieve_context(final_query)
        
        # 4. Generate AI Text generation using Gemini/Groq
        # Pass the requested language directly to the AI for native response generation
        llm_response = llm_service.generate_general_advisory(final_query, rag_context, language)
        
        translated_response = llm_response
                
        # 6. Extract raw text for Text-to-speech friendliness
        tts_text = ""
        if isinstance(translated_response, dict) and "response" in translated_response:
            tts_text = audio_service.format_for_tts(translated_response["response"])
            
        # 7. Generate Audio via gTTS
        import base64
        from io import BytesIO
        from gtts import gTTS
        
        audio_base64 = None
        if tts_text:
            try:
                # Map language to gTTS shortcodes (mr, hi, en)
                lang_code = "en"
                lower_lang = language.lower()
                if "marathi" in lower_lang: lang_code = "mr"
                elif "hindi" in lower_lang: lang_code = "hi"
                
                tts = gTTS(text=tts_text, lang=lang_code, slow=False)
                audio_fp = BytesIO()
                tts.write_to_fp(audio_fp)
                audio_fp.seek(0)
                audio_base64 = base64.b64encode(audio_fp.read()).decode("utf-8")
            except Exception as tts_err:
                print(f"TTS Error: {tts_err}")
                
        # 8. Log Interaction to Pinecone for Memory
        rag_service.log_interaction(query=final_query, disease="Konkan Gen-AI", ai_response=str(translated_response))
            
        return JSONResponse(status_code=200, content={
            "success": True,
            "query": final_query,
            "response": translated_response,
            "tts_friendly": tts_text,
            "audio_base64": audio_base64
        })
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
