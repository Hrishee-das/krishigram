# 🚀 Render Deployment Guide: Universal_Chat (Konkan Regional Voice Bot)

Follow these exact steps to deploy your **Universal Voice & Konkan Agent** to Render.com.

## 1. Push Code to GitHub
Ensure the entire `universal_chat` folder is pushed to a GitHub repository. You can either push it as part of a monorepo or as its own dedicated repository. Ensure the `.gitignore` we created is respected so you don't push massive datasets or `__pycache__`.

## 2. Create a Web Service on Render
1. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New+** -> **Web Service**.
2. Connect your GitHub account and select your repository.

## 3. Configure the Web Service
- **Name**: `krishigram-universal-chat` (or similar)
- **Region**: `Singapore` or `US East`
- **Branch**: `main`
- **Root Directory**: `universal_chat` (⚠️ **CRITICAL: You must set this so Render knows where to start.**)
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`

## 4. Environment Variables
Scroll down to **Advanced** and add the following Environment Variables exactly as they appear in your local `universal_chat/.env` file:
- `GEMINI_API_KEY`: `AIzaSyDo3h-...`
- `PINECONE_API_KEY`: `pcsk_3MvY...` (Note: This is your unique Konkan Pinecone key)
- `PINECONE_INDEX_NAME`: `konkan-agri-db`
- `GROQ_API_KEY`: `gsk_lFAr...`
- `TAVILY_API_KEY`: `tvly-dev...`
- `HF_TOKEN`: `hf_MAFM...`

## 5. Deploy & Verify
Click **Create Web Service**. 
Once the deployment finishes and shows "Live", copy the generated URL (e.g., `https://krishigram-universal-chat.onrender.com`).

Replace `PYTHON_UNIVERSAL_URL` in your Node.js `.env` with this new URL!
