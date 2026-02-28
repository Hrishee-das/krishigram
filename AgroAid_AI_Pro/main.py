import os
from dotenv import load_dotenv
load_dotenv(override=True)

from fastapi import FastAPI, File, UploadFile, Form, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import uvicorn
import json

# Import custom services
from services.ml_models import ml_model
import services.llm_service as llm_service
import services.rag_service as rag_service
import services.language_service as lang_service
import services.audio_service as audio_service
import services.weather_service as weather_service
from services.image_validation import validate_image_quality

# Global session context for demo purposes (In prod: use Redis or DB with session IDs)
global_session = {
    "last_disease_name": None,
    "last_confidence": None,
    "last_report": None
}

app = FastAPI(title="Krishigram AI Pro Backend", version="1.0.0")

# Rate Limiting Setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Robust CORS middleware for Production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In prod, restrict this e.g. ["https://krishigram.com"]
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Set up templates
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})



@app.post("/diagnose_image")
async def diagnose_image(file: UploadFile = File(...), language: str = Form("English")):
    try:
        image_bytes = await file.read()
        
        # Step 1: Strict Image Validation
        val_result = validate_image_quality(image_bytes)
        if val_result.get("valid") is False:
             print(f"DEBUG: Validation failed: {val_result.get('error')}")
             return JSONResponse(status_code=400, content={"status": "error", "report": {"error": val_result.get("error")}})
        
        # Step 1: Base Model Prediction (TensorFlow)
        disease_name, confidence = ml_model.predict(image_bytes)
        print(f"DEBUG: TF Prediction: {disease_name} ({confidence:.2f})")
        
        # Step 2: Fallback to Gemini if low confidence
        if confidence < 0.70:
            disease_name = ml_model.fallback_predict(image_bytes)
            # If Gemini answers 'Invalid Image' or 'Healthy', pass it through natively
            confidence = 0.99
            
            if disease_name.lower().strip() == 'not a plant' or 'unable' in disease_name.lower():
                return JSONResponse(status_code=400, content={"status": "error", "report": {"error": "The uploaded image does not appear to be a plant. Please upload a clear image of a plant leaf."}})
            
            if disease_name.lower().strip() == 'unknown disease':
                return JSONResponse(status_code=400, content={"status": "error", "report": {"error": "Sorry, this type of disease is work in progress. Please provide a little more image or description about your plant problem."}})
            
        # Step 3: Retrieval Augmented Generation (RAG)
        rag_context = rag_service.retrieve_context(disease_name)
        
        # Step 4: LLM Structured Output (Directly in target language)
        report = llm_service.generate_disease_report_advanced(disease_name, confidence, rag_context, language=language)
        
        # Save to global session
        global_session["last_disease_name"] = disease_name
        global_session["last_confidence"] = confidence
        global_session["last_report"] = report
        
        return JSONResponse(status_code=200, content={"status": "success", "report": report})
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.post("/chat_query")
async def chat_query(query: str = Form(...), language: str = Form("English")):
    try:
        contextual_query = query
        # Include session context if it exists
        if global_session.get("last_disease_name"):
            contextual_query = f"Regarding the previously diagnosed '{global_session['last_disease_name']}': {query}"
            
        # Step 1: RAG context retrieval
        rag_context = rag_service.retrieve_context(contextual_query)
        
        if global_session["last_report"]:
            rag_context += f"\n\n[PREVIOUS DIAGNOSIS REPORT]: {json.dumps(global_session['last_report'])}"
        
        # Step 2: Get Answer from LLM (Directly in target language)
        response_text = llm_service.generate_general_advisory(contextual_query, rag_context, language=language)
            
        return JSONResponse(status_code=200, content={"status": "success", "response": response_text})
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.post("/audio_query")
async def audio_query(file: UploadFile = File(...), language: str = Form("English")):
    try:
        audio_bytes = await file.read()
        
        # Step 1: Real Speech-to-Text inference
        text_query = audio_service.process_audio_to_text(audio_bytes, language)
        
        processing_query = text_query
        
        # Include session context if it exists
        if global_session.get("last_disease_name"):
            processing_query = f"Regarding the previously diagnosed '{global_session['last_disease_name']}': {text_query}"
            
        # Step 3: Retrieve Context & LLM Answer (Directly in target language)
        rag_context = rag_service.retrieve_context(processing_query)
        
        if global_session["last_report"]:
            rag_context += f"\n\n[PREVIOUS DIAGNOSIS REPORT]: {json.dumps(global_session['last_report'])}"
            
        response_text = llm_service.generate_general_advisory(processing_query, rag_context, language=language)
            
        # Step 5: Format for text-to-speech
        tts_friendly = ""
        if isinstance(response_text, dict) and "response" in response_text:
            tts_friendly = audio_service.format_for_tts(response_text["response"])
        
        return JSONResponse(status_code=200, content={
            "status": "success", 
            "detected_query": text_query,
            "detected_language": language,
            "response": response_text,
            "tts_friendly": tts_friendly
        })
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.get("/api/library")
async def get_library(language: str = "English"):
    try:
        content = llm_service.generate_library_content(language=language)
        return JSONResponse(status_code=200, content=content)
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

@app.post("/api/analyze")
@limiter.limit("15/minute")
async def analyze_multimodal(
    request: Request,
    image: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    voice: Optional[UploadFile] = File(None),
    language: str = Form("English")
):
    try:
        context_parts = []
        disease_name = None
        confidence = 0.0
        
        # 1. PROCESS IMAGE
        if image and image.filename:
            image_bytes = await image.read()
            
            # Step 1a: Strict Validation
            val_result = validate_image_quality(image_bytes)
            if val_result.get("valid") is False:
                # We must instantly return and stop the pipeline if validation failed
                return JSONResponse(status_code=400, content={"status": "error", "report": {"error": val_result.get("error", "Image rejected.")}})
                
            # Step 1b: Base Model Prediction (TensorFlow)
            disease_name, confidence = ml_model.predict(image_bytes)
            
            # Step 1c: Fallback to Gemini if low confidence
            if confidence < 0.70:
                disease_name = ml_model.fallback_predict(image_bytes)
                confidence = 0.99
                
                if disease_name == 'Not a Plant':
                    return JSONResponse(status_code=400, content={"status": "error", "report": {"error": "The uploaded image does not appear to be a plant. Please upload a clear image of a plant leaf."}})
                
                if disease_name == 'Unknown Disease':
                    return JSONResponse(status_code=400, content={"status": "error", "report": {"error": "Sorry, this type of disease is work in progress. Please provide a little more image or description about your plant problem."}})
                
            context_parts.append(f"Image Analysis: Diagnosed with '{disease_name}' at {confidence:.2f} confidence.")
            
        # 2. PROCESS VOICE
        if voice and voice.filename:
            audio_bytes = await voice.read()
            decoded_text = audio_service.process_audio_to_text(audio_bytes, language)
            context_parts.append(f"User Spoken Query: {decoded_text}")
            
        # 3. PROCESS TEXT
        if text:
            context_parts.append(f"User Text Query: {text}")

        # Combine inputs
        if not context_parts:
            return JSONResponse(status_code=400, content={"success": False, "error": "No input provided. Please provide image, text, or voice."})
            
        combined_query = " | ".join(context_parts)

        # 4. FETCH RAG CONTEXT (Pinecone / FAISS)
        search_term = disease_name if disease_name else combined_query
        rag_context = rag_service.retrieve_context(search_term)
        
        # 4.5 FETCH WEATHER CONTEXT
        # If the user provides a location in the text (e.g. "in Mumbai"), we would extract it here.
        # For this implementation, we simulate fetching the local telemetry.
        weather_context = weather_service.get_live_weather("New Delhi, IN")
        
        # 5. GENERATE UNIFIED AI RESPONSE (Directly in target language)
        final_context_block = f"{rag_context}\n\n[WEATHER TELEMETRY]\n{weather_context}\n\nUser Text/Voice Context: {combined_query}"
        
        if (image and image.filename):
            llm_response = llm_service.generate_disease_report_advanced(disease_name, confidence, final_context_block, language=language)
        else:
            llm_response = llm_service.generate_general_advisory(combined_query, final_context_block, language=language)
        
        translated_response = llm_response
            
        # 6.5 PINECONE LOGGING (Self-Learning)
        # We passively embed this interaction back into the vector database
        ai_reply_string = str(translated_response)
        rag_service.log_interaction(
            query=combined_query, 
            disease=disease_name if disease_name else "N/A", 
            ai_response=ai_reply_string
        )
            
        # 7. FORMAT JSON RETURN
        response_data = {
            "status": "success",
            "report": translated_response,
            "confidence": confidence if (image and image.filename) else None
        }
        
        # Add TTS if a voice note was processed
        if voice and voice.filename:
            tts_source = ""
            if isinstance(translated_response, dict):
                if "response" in translated_response:
                    tts_source = translated_response["response"]
                elif "disease_name" in translated_response:
                    tts_source = f"I have detected {translated_response['disease_name']}. {translated_response.get('organic_treatment', 'Please refer to the treatment plan.')}"
            
            response_data["tts_friendly"] = audio_service.format_for_tts(tts_source)
        
        return JSONResponse(status_code=200, content=response_data)

    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
