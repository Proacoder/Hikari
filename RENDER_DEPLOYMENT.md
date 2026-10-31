# 🚀 Kaiser AI — Render Deployment Guide

This guide explains how to deploy **Kaiser AI** to [Render](https://render.com) for production.

---

## ⚡ Method 1: 1-Click Render Blueprint (Recommended)

Because Kaiser AI includes a production multi-stage `Dockerfile` and a `render.yaml` Blueprint, you can deploy the complete full-stack platform (React 19 Frontend + FastAPI Backend + SQLite + AI Vision Engine) in a single unified web service.

### Step-by-Step:
1. **Sign in to Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com) and log in with your GitHub account.
2. **Create New Blueprint Instance**:
   - Click the **"New +"** button in the top right.
   - Select **"Blueprint"**.
3. **Connect Your GitHub Repository**:
   - Select your repository: `Proacoder/Hikari`.
   - Branch: `main`.
4. **Review Blueprint Configuration**:
   - Render will automatically detect `render.yaml`.
   - Service Name: `kaiser-ai`
   - Runtime: `Docker`
   - Plan: `Free`
5. **Click "Apply"**:
   - Render will build the React frontend, package the Python backend, and deploy your live URL (e.g. `https://kaiser-ai.onrender.com`).
   - Done! Both the frontend UI and backend APIs (`/api/*`) are live on that single domain.

---

## 🛠️ Method 2: Manual Web Service Deployment (Docker)

If you prefer to configure the Web Service manually from the Render dashboard:

1. In the Render Dashboard, click **"New +"** → **"Web Service"**.
2. Select your repository `Proacoder/Hikari` (Branch: `main`).
3. Set the configuration:
   - **Name**: `kaiser-ai`
   - **Region**: Choose the closest region (e.g., `Singapore` or `Oregon`).
   - **Environment**: **Docker**
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `.`
   - **Instance Type**: **Free**
4. Under **Advanced** → **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `PORT` | `5000` | Application listening port |
   | `JWT_SECRET` | *(Generate a 32+ character random string)* | Auth session signing key |
   | `CLIP_DEVICE` | `cpu` | Uses CPU for AI vision inference |
   | `DATABASE_URL` | `sqlite:///./kaiser_civic.db` | Local persistent SQLite database |
   | `PYTHONUNBUFFERED` | `1` | Real-time console logs |
5. Click **"Create Web Service"**.

---

## 🌐 Method 3: Two Separate Services (Static Site + Python Web Service)

If you prefer having separate URLs for the frontend and backend:

### A. Deploy Backend (Web Service)
1. Click **"New +"** → **"Web Service"**.
2. Connect `Proacoder/Hikari`.
3. Configuration:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
4. Copy the resulting backend URL (e.g., `https://kaiser-api.onrender.com`).

### B. Deploy Frontend (Static Site)
1. Click **"New +"** → **"Static Site"**.
2. Connect `Proacoder/Hikari`.
3. Configuration:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://kaiser-api.onrender.com/api`
   - `VITE_ML_SERVICE_URL`: `https://kaiser-api.onrender.com/api/ml`
5. Under **Redirects/Rewrites**:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

---

## 🔑 Optional External AI API Keys

To enable live LLM chatbot responses, add any of these keys in your Render **Environment Variables**:

| Variable | Provider | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio | Powers Kaiser Sahayak AI assistant |
| `GROQ_API_KEY` | GroqCloud | Ultra-fast Llama-3 civic inference |
| `NVIDIA_API_KEY` | NVIDIA NIM | Llama-3.1-Nemotron urban reasoning |
| `NEWS_API_KEY` | NewsAPI.org | Real-time Mumbai civic journalism feed |

---

## 💡 Render Free Tier Notes
* **Cold Starts**: Render free services spin down after 15 minutes of inactivity. The first request after sleep may take ~30-50 seconds to wake up.
* **Health Check**: Render monitors `/api/health`. Once the service starts, it returns `{"status": "healthy"}`.
