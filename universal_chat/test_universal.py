import os
import sys
import json

# Add project root to sys.path
PROJECT_ROOT = r"C:\Users\krish\OneDrive\Desktop\New folder\universal_chat"
sys.path.append(PROJECT_ROOT)

from services import llm_service
from services import rag_service

def test_universal_flow():
    print("\n[TEST] Universal Chat Advisory Flow")
    query = "How to grow Mangoes in Konkan?"
    language = "Marathi"
    
    print(f"Query: {query} (Language: {language})")
    
    # 1. RAG Context
    context = rag_service.retrieve_context(query)
    print(f"Context Found: {len(context)} chars")
    
    # 2. LLM Advisory (OpenRouter Exclusively)
    try:
        response = llm_service.generate_general_advisory(query, context, language)
        print(f"Response: {json.dumps(response, indent=2, ensure_ascii=False)}")
        
        if "response" in response and response["response"]:
            print("PASS: Successfully generated advisory.")
        else:
            print("FAIL: Response missing or empty.")
    except Exception as e:
        print(f"FAIL: Universal Chat test error: {e}")

if __name__ == "__main__":
    test_universal_flow()
