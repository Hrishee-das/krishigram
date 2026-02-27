import os
import json
from dotenv import load_dotenv

load_dotenv(override=True)

def _clean_json_response(text: str) -> str:
    if not text:
        return ""
    # Strip markdown code blocks if present
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def _generate_openrouter(prompt: str, system_prompt: str, json_mode: bool = True) -> str:
    try:
        api_key = os.getenv("OPENROUTER_API_KEY")
        model = os.getenv("OPENROUTER_MODEL", "arcee-ai/trinity-large-preview")
        if not api_key: return None
        
        from openai import OpenAI
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt + (" Output valid JSON." if json_mode else "")},
                {"role": "user", "content": prompt}
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenRouter Error: {e}")
        return None

# System instruction simulating the fine-tuned Krishigram model for Konkan
krishigram_system_prompt = """
You are a Regional Expert AI Agricultural Assistant specializing exclusively in the Konkan Region of Maharashtra (India).
Your mission: Help Konkan farmers with their specific problems regarding crops like Alphonso Mangoes, Cashews, Rice, Coconut, Arecanut, and Kokum.
You must speak like a local expert and provide answers contextualized to the lateritic soils, heavy coastal monsoons, and local agricultural practices of Konkan.
If a question is completely unrelated to Konkan region agriculture, explicitly state that you are a Konkan specialist and cannot assist with that.
Be accurate, structured, farmer-friendly, and scientifically accurate.
"""

def _generate_ai_response(prompt: str, system_prompt: str = krishigram_system_prompt, model_name: str = None, json_mode: bool = True) -> str:
    """
    Engine that exclusively uses OpenRouter.
    """
    return _generate_openrouter(prompt, system_prompt, json_mode=json_mode)

def generate_disease_report(disease_name: str, confidence: float, rag_context: str = "", language: str = "English") -> dict:
    prompt = f"""
    The model has identified '{disease_name}' with a confidence of {confidence:.2f}. 
    Use the following RAG knowledge to build the report:
    {rag_context}
    
    CRITICAL: You MUST return a JSON object with EXACTLY the following keys:
    - disease_name (string)
    - confidence_level (number, 0 to 1)
    - what_is_this_disease (string)
    - causes (string)
    - symptoms (string)
    - organic_treatment (string)
    - chemical_treatment (string with safe dosage)
    - prevention_methods (string)
    - expected_yield_impact (string)
    - similar_disease_examples (string)
    - seasonal_advisory (string)
    - safety_warning (string warning about pesticides)
    
    CRITICAL: You MUST write the content for all string values in '{language}'.
    """
    try:
        response_text = _generate_ai_response(prompt)
        if not response_text: return {"error": "All models failed"}
        return json.loads(_clean_json_response(response_text))
    except Exception as e:
        return {"error": f"Error generating report: {e}"}

def generate_disease_report_advanced(disease_name: str, confidence: float, rag_context: str = "", language: str = "English") -> dict:
    # ... existing tavily code ...
    try:
        from tavily import TavilyClient
        tavily_api_key = os.getenv("TAVILY_API_KEY")
        if tavily_api_key:
            tavily_client = TavilyClient(api_key=tavily_api_key)
            search_results = tavily_client.search(
                query=f"{disease_name} plant disease symptoms and organic chemical treatments", 
                search_depth="advanced",
                max_results=3
            )
            web_context = "\n".join([r['content'] for r in search_results.get('results', [])])
        else:
            web_context = ""
    except Exception as e:
        web_context = ""
        
    prompt = f"""
    The computer vision model has identified '{disease_name}' with a confidence of {confidence:.2f}. 
    Local RAG: {rag_context}
    Web Context: {web_context}
    Synthesize all info into JSON...
    Write in '{language}'.
    """
    try:
        response_text = _generate_ai_response(prompt)
        if not response_text: return {"error": "Advanced report failed"}
        return json.loads(_clean_json_response(response_text))
    except Exception as e:
        return {"error": f"Error: {e}"}

def generate_general_advisory(query: str, rag_context: str = "", language: str = "English") -> dict:
    prompt = f"""
    A farmer from the Konkan region asks: "{query}"
    Retrieved knowledge: {rag_context}
    CRITICAL: Return JSON with key `response`. Write in '{language}'.
    """
    try:
        response_text = _generate_ai_response(prompt)
        if not response_text: return {"error": "Advisory failed"}
        return json.loads(_clean_json_response(response_text))
    except Exception as e:
        return {"error": f"Error generating advisory: {e}"}
