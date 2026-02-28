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
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def _generate_openrouter(prompt: str, system_prompt: str, model_name: str = None, json_mode: bool = True) -> str:
    try:
        api_key = os.getenv("OPENROUTER_API_KEY")
        # Default to free model if not provided
        model = model_name or os.getenv("OPENROUTER_MODEL", "arcee-ai/trinity-large-preview:free")
        if not api_key: 
            print("ERROR: OPENROUTER_API_KEY missing.")
            return None
        
        from openai import OpenAI
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        
        print(f"DEBUG: Calling OpenRouter with model: {model}")
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt + (" Output valid JSON." if json_mode else "")},
                {"role": "user", "content": prompt}
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenRouter Error ({model if 'model' in locals() else 'unknown'}): {e}")
        return None

# System instruction simulating the fine-tuned Krishigram model
krishigram_system_prompt = """
You are "Krishigram AI Pro", an advanced multimodal AI Agricultural Assistant.
Your mission: Help farmers diagnose plant diseases, answer crop-related questions, and provide treatment plans.
Be accurate, structured, farmer-friendly, and scientifically accurate. No hallucinated pesticide names.
"""

def _generate_ai_response(prompt: str, system_prompt: str = krishigram_system_prompt, model_name: str = None, json_mode: bool = True) -> str:
    """
    Engine that exclusively uses OpenRouter.
    """
    return _generate_openrouter(prompt, system_prompt, model_name=model_name, json_mode=json_mode)

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
        if not response_text:
             return {"error": "All AI engines failed."}
        return json.loads(_clean_json_response(response_text))
    except Exception as e:
        return {"error": f"Error generating report: {e}"}

def generate_disease_report_advanced(disease_name: str, confidence: float, rag_context: str = "", language: str = "English") -> dict:
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
    
    Local RAG Knowledge:
    {rag_context}
    
    Live Web Search Context:
    {web_context}
    
    Synthesize all the above info, and return a JSON object with EXACTLY the following keys:
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
    
    CRITICAL INSTRUCTIONS:
    1. Rely PRIMARILY on the 'Local RAG Knowledge' and 'Live Web Search Context'.
    2. Write the whole report in '{language}'.
    3. Return ONLY valid JSON.
    """
    try:
        response_text = _generate_ai_response(prompt)
        if not response_text:
            return {"error": "Advanced report generation failed."}
        return json.loads(_clean_json_response(response_text))
    except Exception as e:
        return {"error": f"Error generating advanced report: {e}"}

def generate_general_advisory(query: str, rag_context: str = "", language: str = "English") -> dict:
    prompt = f"""
    A farmer asks: "{query}"
    
    Here is some retrieved knowledge from the agricultural database:
    {rag_context}
    
    CRITICAL INSTRUCTIONS:
    1. You MUST return a JSON object with EXACTLY one key: `response` (string, the clear, farmer-friendly answer).
    2. You MUST write the response in '{language}'.
    3. Rely ONLY on the retrieved knowledge provided.
    """
    try:
        response_text = _generate_ai_response(prompt)
        if not response_text:
            return {"error": "General advisory failed."}
        return json.loads(_clean_json_response(response_text))
    except Exception as e:
        return {"error": f"Error generating response: {e}"}
def generate_library_content(language: str = "English") -> list:
    """
    Generates a list of advanced, real-world agricultural topics using Tavily and Groq.
    """
    # Map short codes if necessary
    lang_map = {"en": "English", "hi": "Hindi", "mr": "Marathi"}
    full_language = lang_map.get(language.lower(), language)
    
    print(f"[DEBUG] Generating library content for: {full_language}")
    topics = [
        f"Smart farming technologies and IoT in India {full_language} 2026",
        f"Biological pest control and organic fertilizers {full_language}",
        f"Climate-resilient crops for Konkan region {full_language}"
    ]
    
    results = []
    # Fallback content in case AI generation fails or is too slow
    fallback_content = [
        {
            "title": f"Smart Irrigation 2026 ({full_language})",
            "color": "#1565C0",
            "icon": "water-pump",
            "content": f"New smart sensors in 2026 allow precision watering, saving up to 40% more water. [Generated for {full_language}]"
        },
        {
            "title": f"Konkan Resilience ({full_language})",
            "color": "#2E7D32",
            "icon": "terrain",
            "content": f"New local varieties of Mango and Cashew are showing 30% more resistance to unseasonal rains. [Generated for {full_language}]"
        }
    ]

    try:
        from tavily import TavilyClient
        tavily_api_key = os.getenv("TAVILY_API_KEY")
        tavily_client = TavilyClient(api_key=tavily_api_key) if tavily_api_key else None
        
        for topic in topics:
            try:
                web_context = ""
                if tavily_client:
                    search = tavily_client.search(query=topic, search_depth="basic", max_results=1)
                    web_context = "\n".join([r['content'] for r in search.get('results', [])])
                
                prompt = f"""
                Research Topic: {topic}
                Context: {web_context}
                
                Based on the latest data 2026, create an advanced library entry.
                Return ONLY a JSON object with:
                - title (string, concise)
                - color (string, hex)
                - icon (string, MaterialCommunityIcons name)
                - content (string, detailed but readable)
                
                Language: {full_language}
                """
                print(f"[DEBUG] Calling AI for topic: {topic}")
                response_text = _generate_ai_response(prompt, json_mode=True)
                if response_text:
                    cleaned = _clean_json_response(response_text)
                    print(f"[DEBUG] AI Response received for {topic}")
                    results.append(json.loads(cleaned))
                else:
                    print(f"[WARNING] No AI response for topic: {topic}")
            except Exception as e:
                print(f"Error for topic '{topic}': {e}")
                continue
        
        # If no results generated, use fallback
        return results if results else fallback_content
    except Exception as e:
        print(f"Error generating library content: {e}")
        return fallback_content
