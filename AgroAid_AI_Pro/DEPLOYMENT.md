# AgroAid AI Pro - Deployment Guide

This document outlines how to deploy the unified Multimodal FastAPI backend (`/api/analyze`) to various cloud providers.

## Pre-requisites
1. A GitHub repository containing the `AgroAid_AI_Pro` directory.
2. Ensure you have your `.env` variables ready (`GEMINI_API_KEY`, `PINECONE_API_KEY`).

---

## 🚀 1. Deploying to Render (Recommended for Web Services)
Render offers native Docker support and is great for FastAPI applications.

1. Create a new **Web Service** on Render.
2. Connect your GitHub repository.
3. Configure settings:
   - **Environment**: Docker
   - **Build Command**: (Leave blank, Render uses the `Dockerfile`)
   - **Start Command**: (Leave blank, the `Dockerfile` CMD handles this via `uvicorn`)
4. Add Environment Variables:
   - Copy in your `GEMINI_API_KEY` and Pinecone keys.
5. Click **Deploy**. Render will build the container and provide you a live `https://your-custom-name.onrender.com` URL.

---

## 🚀 2. Deploying to Railway
Railway provides extremely fast serverless Docker builds.

1. Login to Railway using GitHub.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Railway will automatically detect the `Dockerfile`.
4. Navigate to the **Variables** tab for the service and add your API keys.
5. Railway will give you an active domain under **Settings -> Domains**.

---

## 🚀 3. Deploying to AWS ECS / Fargate (For scale)
If you require high availability and extreme scale, package the Dockerfile for AWS.

**Local Steps**:
1. Download and authenticate the AWS CLI.
2. Build the Docker image:
   ```bash
   docker build -t agroaid-backend .
   ```
3. Create an AWS ECR (Elastic Container Registry) repository.
4. Tag and push the image:
   ```bash
   docker tag agroaid-backend:latest <aws_account_id>.dkr.ecr.<region>.amazonaws.com/agroaid-backend:latest
   docker push <aws_account_id>.dkr.ecr.<region>.amazonaws.com/agroaid-backend:latest
   ```
5. Deploy using the **AWS ECS Console** as a Fargate task. Ensure the Security Group maps Port `8000` to the internet.

---

## 🚀 4. Can I use Vercel Serverless?
Vercel is incredible for Next.js, but **not recommended** for this exact backend as-is.
*Why?* Vercel Serverless functions have a strict 50MB limit. This project utilizes TensorFlow, OpenCV, Langchain, and HuggingFace Transformers, which consume over 1GB of memory. Use Render or Railway instead for robust ML deployment.
