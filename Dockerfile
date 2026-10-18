# ==============================================================================
# Stage 1: Build React 19 Frontend Static Assets
# ==============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy package manifests and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy frontend source code and compile production bundle
COPY index.html vite.config.js ./
COPY public/ public/
COPY src/ src/
RUN npm run build

# ==============================================================================
# Stage 2: Production Python Backend & AI Vision Runtime
# ==============================================================================
FROM python:3.11-slim AS runner
WORKDIR /app

# Install system utilities & OpenCV dependencies required by YOLOv8
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application and database layer (ML router is inside backend)
COPY backend/ ./backend/

# Copy compiled React static bundle from Stage 1
COPY --from=frontend-builder /app/dist ./dist

# Create persistent storage folder for grievance uploads
RUN mkdir -p /app/backend/uploads

WORKDIR /app/backend

ENV PORT=5000
EXPOSE 5000

# Start Unified FastAPI platform
CMD ["python", "app.py"]
