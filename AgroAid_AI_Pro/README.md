# AgroAid AI Pro - Backend Architecture

AgroAid AI Pro is a comprehensive, AI-driven agricultural backend that unifies custom Machine Learning disease detection, Conversational Memory, Retrieval-Augmented Generation (RAG), and natively supports Multilingual and Voice workflows.

## 🚀 Tech Stack

*   **Core Framework**: FastAPI (Python 3.11)
*   **Machine Learning**: TensorFlow & Keras (MobileNetV2 Transfer Learning)
*   **LLM Orchestration**: Google GenAI (`gemini-2.5-flash`), `langchain`
*   **Vector Database (RAG)**: Pinecone (Cloud Serverless) & FAISS (Local Fallback)
*   **Audio/Voice**: `SpeechRecognition`, `pydub`, Web Media Streams
*   **Multilingual**: Simulated Bhashini API mapping (9 Indian Languages)
*   **Environment**: Python `venv`

---

## 🧠 System Data Flows

### 1. Conversational Memory
The backend now supports **shared session context**. If a user uploads an image of a leaf:
1.  The ML Model identifies the disease.
2.  The RAG pipelines gather info on that disease.
3.  The outcome is stored in a fast temporary memory (`user_sessions` dict in `main.py`).
4.  If the user subsequently sends a text or audio query (e.g., "How do I fix *that*?"), the LLM automatically receives the previous image context and responds accurately!

### 2. Image Diagnosis Flow (`/diagnose_image`)
1.  **Image Upload**: Image bytes are scaled to 224x224.
2.  **Local Keras Model**: `services/ml_models.py` loads `fine_tuned_model.keras` (trained on PlantVillage/PlantDoc) and outputs a prediction and confidence score.
3.  **Gemini Fallback**: If Keras confidence is `< 0.70`, the image is routed to Gemini Vision for a secondary opinion.
4.  **RAG Context Extraction**: The identified disease name is passed to `rag_service.py` to extract trusted knowledge from Pinecone.
5.  **LLM Assembly**: `llm_service.py` forces Gemini to combine the Diagnosis and RAG context into a strict, 12-point structured JSON report.

### 3. Voice & Audio Context Query (`/audio_query`)
1.  **Audio Ingestion**: Accepts `.webm`/`.wav` blobs recorded from the browser's microphone.
2.  **Speech-to-Text (STT)**: `audio_service.py` converts WebM to WAV natively via `pydub` and feeds it to Google's open Web Speech API via the `SpeechRecognition` library.
3.  **Context Integration**: The decoded text is mathematically merged with any prior Image session memory.
4.  **LLM Execution**: The query fetches relevant Pinecone PDFs, generating grounded JSON advisory.
5.  **Language Translation**: The backend simulates translation (via Bhashini logic) to output the response in the user's native tongue (Hindi, Marathi, Tamil, etc.).

### 4. Pinecone RAG Architecture
1.  **Ingestion**: `scripts/rag_ingest.py` parses unstructured agricultural PDFs (`data/agriculture_docs`).
2.  **Embedding**: Text chunks are embedded into high-dimensional vectors via HuggingFace's local `all-MiniLM-L6-v2`.
3.  **Storage**: Vectors are pushed to a Pinecone serverless cloud index (`agroaid-db`).
4.  **Retrieval**: During active chats, queries pull the top `k=3` matching documents from Pinecone to anchor the LLM, neutralizing hallucinations.

---

## 🛠️ How to Run

1.  **Activate Virtual Environment**:
    ```bash
    .\venv\Scripts\activate
    ```
2.  **Install Requirements** (Ensure fresh installs):
    ```bash
    pip install -r requirements.txt pypdf faiss-cpu langchain langchain-community sentence-transformers pinecone-client[grpc] SpeechRecognition pydub
    ```
3.  **Set Environment Variables** (`.env`):
    ```env
    GEMINI_API_KEY="your_google_key"
    PINECONE_API_KEY="your_pinecone_key"
    PINECONE_INDEX_NAME="agroaid-db"
    ```
4.  **Start the Server**:
    ```bash
    uvicorn main:app --reload
    ```
5.  **Test the UI**: Open your browser and navigate to `http://localhost:8000`.
