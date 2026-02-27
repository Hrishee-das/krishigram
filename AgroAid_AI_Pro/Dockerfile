# Use official Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for OpenCV, PyDub (ffmpeg), and FAISS
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    ffmpeg \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
# We also explicitly install the packages added in later phases
RUN pip install --no-cache-dir -r requirements.txt \
    pypdf faiss-cpu langchain langchain-community \
    sentence-transformers pinecone-client[grpc] \
    SpeechRecognition pydub opencv-python slowapi python-multipart

# Copy the rest of the application code
COPY . .

# Expose port 8000 for FastAPI
EXPOSE 8000

# Start Uvicorn server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
