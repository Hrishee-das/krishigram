import os
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

DATA_DIR = r"C:\Users\krish\OneDrive\Desktop\New folder\data\agriculture_docs"
DB_DIR = r"c:\Users\krish\OneDrive\Desktop\New folder\AgroAid_AI_Pro\faiss_index"

def ingest_docs():
    print(f"Loading PDFs from {DATA_DIR}...")
    loader = PyPDFDirectoryLoader(DATA_DIR)
    documents = loader.load()
    print(f"Loaded {len(documents)} document pages.")

    if not documents:
        print("No documents found to ingest!")
        return

    print("Splitting text into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    docs = text_splitter.split_documents(documents)
    print(f"Created {len(docs)} text chunks.")

    print("Initializing HuggingFace Embeddings (all-MiniLM-L6-v2)...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    index_name = os.getenv("PINECONE_INDEX_NAME", "agroaid-db")
    
    if not pinecone_api_key:
        print("PINECONE_API_KEY missing from .env, falling back to FAISS.")
        from langchain_community.vectorstores import FAISS
        vectorstore = FAISS.from_documents(docs, embeddings)
        os.makedirs(DB_DIR, exist_ok=True)
        vectorstore.save_local(DB_DIR)
        print(f"Successfully saved FAISS index to {DB_DIR}")
    else:
        from pinecone import Pinecone, ServerlessSpec
        from langchain_pinecone import PineconeVectorStore
        
        print("Connecting to Pinecone...")
        pc = Pinecone(api_key=pinecone_api_key)
        
        # Create index if it doesn't exist
        if index_name not in pc.list_indexes().names():
            print(f"Creating Pinecone index '{index_name}'...")
            pc.create_index(
                name=index_name,
                dimension=384, # all-MiniLM-L6-v2 dimension
                metric='cosine',
                spec=ServerlessSpec(cloud='aws', region='us-east-1')
            )
            
        print("Uploading document chunks to Pinecone...")
        vectorstore = PineconeVectorStore.from_documents(docs, embeddings, index_name=index_name)
        print("Successfully ingested documents into Pinecone!")

if __name__ == "__main__":
    ingest_docs()
