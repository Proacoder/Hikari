# Kaiser AI · Free Civic APIs & Integration Requirements Guide

This reference document outlines all **100% free external APIs** ($0 cost, no credit card required) integrated into Kaiser AI, along with optional free-tier AI accelerators and setup instructions.

---

## 1. Zero-Key Free APIs (Integrated & Ready Out-of-the-Box)

These APIs require **no API key**, **no account registration**, and **zero credit card**. They are already active in your backend with automatic offline fallbacks.

### A. Open-Meteo Global Weather & Air Quality API
- **Official Documentation**: [open-meteo.com/en/docs](https://open-meteo.com/en/docs)
- **Cost / Tier**: 100% Free for non-commercial & municipal usage (up to 10,000 requests/day).
- **Authentication**: None required.
- **Integrated Backend Endpoint**: `GET /api/weather/{lat}/{lng}` (in [`backend/app.py`](backend/app.py))
- **Live Upstream Endpoints**:
  1. **Weather Forecast & Rain Telemetry**:
     ```http
     GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=auto
     ```
  2. **Atmospheric Air Quality (AQI / PM2.5 / PM10)**:
     ```http
     GET https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lng}&current=pm10,pm2_5,us_aqi
     ```
- **What It Powers in Kaiser AI**:
  - Live temperature, wind speed, and humidity widgets across Mumbai wards.
  - Monsoon rain telemetry (precipitation in mm/hr) triggering automated **Monsoon Flood Alerts**.
  - High-tide correlation against municipal storm water drainage pumping stations.

---

### B. OpenStreetMap Nominatim Reverse Geocoding API
- **Official Documentation**: [nominatim.org/release-docs/latest/api/Reverse](https://nominatim.org/release-docs/latest/api/Reverse/)
- **Cost / Tier**: 100% Free under Open Database License (ODbL).
- **Authentication**: None required (requires polite `User-Agent` header, e.g., `KaiserCivicGov/1.0`).
- **Integrated Backend Endpoint**: `GET /api/geo/reverse?lat={lat}&lng={lng}` (in [`backend/app.py`](backend/app.py))
- **Live Upstream Endpoint**:
  ```http
  GET https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json&zoom=18&addressdetails=1
  ```
- **What It Powers in Kaiser AI**:
  - Converts dropped map pins or GPS coordinates into exact Mumbai street addresses (e.g., *"Savita Chaya, 28th Road, Khar, H/W Ward, Mumbai 400050"*).
  - Automatically resolves which of the 24 BMC administrative wards handles the incident.
  - In-memory backend caching prevents redundant queries.

---

### C. OpenStreetMap Overpass Civic Infrastructure API
- **Official Documentation**: [wiki.openstreetmap.org/wiki/Overpass_API](https://wiki.openstreetmap.org/wiki/Overpass_API)
- **Cost / Tier**: 100% Free public query service.
- **Authentication**: None required.
- **Endpoint**: `https://overpass-api.de/api/interpreter`
- **What It Powers (Optional Extension)**:
  - Spatial queries for public infrastructure within a radius: fire stations, government hospitals, stormwater pumping stations, and ward chowkies.

---

## 2. Key-Required Free-Tier APIs (No Credit Card Required)

These providers offer **generous 100% free tiers** with zero billing information required.

### A. Groq Cloud API (Recommended for Ultra-Fast LLM)
- **Sign-Up**: [console.groq.com](https://console.groq.com) (Log in with GitHub or Google)
- **Cost**: **$0.00** — Free tier requires **no credit card**.
- **Free Quota**:
  - Up to **14,400 requests/day** (30 requests/minute).
  - High-speed LPU inference (~300 tokens/sec).
- **Recommended Model**: `llama-3.3-70b-versatile`
- **How to Activate**:
  1. Generate a free API key at [console.groq.com/keys](https://console.groq.com/keys).
  2. Add to your `.env` file:
     ```ini
     GROQ_API_KEY=gsk_your_groq_api_key_here
     ```
- **Integrated Endpoint**: `POST /api/ml/assistant/chat` (in [`backend/ml_router.py`](backend/ml_router.py))
- **What It Powers**: Instant multi-turn municipal guidance in **Marathi, Hindi, and English**.

---

### B. Google Gemini 1.5 Flash API
- **Sign-Up**: [aistudio.google.com](https://aistudio.google.com) (Log in with any Google account)
- **Cost**: **$0.00** — Free tier requires **no credit card**.
- **Free Quota**:
  - **15 requests/minute** (RPM)
  - **1,500 requests/day** (RPD)
  - 1 million tokens/minute
- **Recommended Model**: `gemini-1.5-flash`
- **How to Activate**:
  1. Click **"Get API key"** at [aistudio.google.com](https://aistudio.google.com).
  2. Add to your `.env` file:
     ```ini
     GEMINI_API_KEY=AIzaSy_your_gemini_api_key_here
     ```
- **What It Powers**: Multimodal civic complaint reasoning, image description analysis, and municipal bylaw queries.

---

### C. Hugging Face Serverless Inference API
- **Sign-Up**: [huggingface.co](https://huggingface.co)
- **Cost**: **$0.00** — Free user access token.
- **Endpoint**: `https://api-inference.huggingface.co/models/{model_id}`
- **Recommended Use Cases**:
  - Citizen grievance sentiment analysis (`cardiffnlp/twitter-roberta-base-sentiment-latest`).
  - Civic issue classification fallback.
- **Activation**:
  ```ini
  HUGGINGFACE_API_KEY=hf_your_token_here
  ```

---

### D. Mapbox Geocoding & Tiles (Optional)
- **Sign-Up**: [mapbox.com](https://www.mapbox.com/)
- **Cost**: **$0.00** for first 100,000 monthly geocodes and 50,000 map loads.
- **Activation**:
  ```ini
  VITE_MAPBOX_TOKEN=pk.your_token_here
  ```

---

## 3. Quick Reference: Environment Configuration (`.env`)

To activate any of the optional free keys, update your root `.env` file:

```ini
# Core Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ML_SERVICE_URL=http://localhost:5000/api/ml
VITE_MOCK_MODE=false

# Default Map Center (Mumbai Coordinates)
VITE_MAP_DEFAULT_LAT=19.0760
VITE_MAP_DEFAULT_LNG=72.8777

# 100% Free AI Keys (No credit card needed)
# 1. Groq Cloud (Free LLaMA 3.3 70B - get at console.groq.com)
GROQ_API_KEY=

# 2. Google Gemini (Free Gemini 1.5 Flash - get at aistudio.google.com)
GEMINI_API_KEY=

# 3. NVIDIA NIM (Optional free developer key at build.nvidia.com)
NVIDIA_API_KEY=
```

---

## 4. Internal Platform Endpoints Utilizing These APIs

| Internal Endpoint | Upstream / Technology | Purpose |
| :--- | :--- | :--- |
| `GET /api/weather/{lat}/{lng}` | Open-Meteo Satellite API | Live temperature, precipitation, AQI, and flood alerts with local physics fallback. |
| `GET /api/geo/reverse?lat=...&lng=...` | OpenStreetMap Nominatim | Translates coordinates to Mumbai street, PIN code, and 24-ward code. |
| `POST /api/ml/detect-defect` | YOLOv8 + Multi-Hazard Escalator | Visual defect detection + life-safety hazard triage (exposed wires, open manholes). |
| `POST /api/ml/verify-resolution` | Automated Quality Audit (AQA) | Before-and-after photo verification to prevent fraudulent contractor ticket closures. |
| `POST /api/ml/assistant/chat` | Groq / Gemini / Local NLP | 24-ward municipal assistant in Marathi, Hindi, and English. |
| `PATCH /api/complaints/{id}` | Field GPS Geofencing | Verifies officer is within 300m of incident before stamping resolution. |
