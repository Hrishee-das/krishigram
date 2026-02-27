import os
import uuid
from langchain_community.embeddings import HuggingFaceEmbeddings

DB_DIR = r"c:\Users\krish\OneDrive\Desktop\New folder\AgroAid_AI_Pro\faiss_index"

# Global initialization
vectorstore = None
is_pinecone = False

def init_rag():
    global vectorstore, is_pinecone
    
    print("DEBUG: Starting RAG initialization...")
    print("DEBUG: Loading HuggingFace embeddings (all-MiniLM-L6-v2)...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    print("DEBUG: Embeddings loaded.")
    
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    index_name = os.getenv("PINECONE_INDEX_NAME", "agroaid-db")
    
    if pinecone_api_key:
        try:
            from langchain_pinecone import PineconeVectorStore
            print(f"Connecting to Pinecone Index: {index_name}...")
            vectorstore = PineconeVectorStore(
                index_name=index_name,
                embedding=embeddings,
                pinecone_api_key=pinecone_api_key
            )
            is_pinecone = True
            print("Pinecone DB Connected Successfully.")
            return
        except Exception as e:
            print(f"Failed to connect to Pinecone: {e}. Falling back to FAISS.")
            
    # Fallback to local FAISS Data
    if os.path.exists(os.path.join(DB_DIR, "index.faiss")):
        try:
            from langchain_community.vectorstores import FAISS
            print("Loading local FAISS DB...")
            vectorstore = FAISS.load_local(DB_DIR, embeddings, allow_dangerous_deserialization=True)
            print("FAISS DB Loaded Successfully.")
        except Exception as e:
            print(f"Failed to load FAISS: {e}")
    else:
        print(f"No Pinecone Key & FAISS index not found at {DB_DIR}. Use mock or run ingestion script.")

def retrieve_context(query_or_disease: str) -> str:
    """
    Retrieves information from Vector DB based on local Krishigram documents.
    """
    if vectorstore is None:
        init_rag()
        
    if vectorstore is None:
        return "Ensure proper soil drainage and consider safe organic treatments like Neem Oil as a general preventative measure. (No Document Context Retrieved)"
        
    try:
        # Retrieve top 3 relevant chunks
        docs = vectorstore.similarity_search(query_or_disease, k=3)
        contexts = [doc.page_content for doc in docs]
        return "\n\n".join(contexts)
    except Exception as e:
        print(f"RAG Retrieval Error: {e}")
        return ""

def log_interaction(query: str, disease: str, ai_response: str):
    """
    Self-Learning: Embeds the user's interaction and upserts it 
    to the Pinecone `logs` namespace for future RAG context.
    """
    global vectorstore, is_pinecone
    
    if vectorstore is None:
        init_rag()
        
    if not is_pinecone or not vectorstore:
        print("Self-learning skipped: Pinecone is not currently active.")
        return
        
    try:
        from langchain_core.documents import Document
        
        # Build the knowledge chunk
        log_content = (f"Historical Krishigram Log | User Query Context: '{disease}' | "
                       f"Text Query: '{query}' | "
                       f"Successful AI Resolution: '{ai_response[:300]}...'") # Store truncated response to save vector space
                       
        doc = Document(page_content=log_content, metadata={
            "source": "self_learning_logs",
            "type": "historical_interaction"
        })
        
        # Upsert into Pinecone
        # Langchain Pinecone wrapper handles the embedding generation natively
        vectorstore.add_documents([doc])
        print("Self-Learning Sync: Successfully logged interaction vector to Pinecone.")
        
    except Exception as e:
        print(f"Failed to log interaction to Pinecone: {e}")
