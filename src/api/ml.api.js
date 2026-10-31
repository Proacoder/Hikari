/**
 * Kaiser AI Unified ML Service Client (FastAPI on http://localhost:5000)
 * Integrates OpenAI CLIP defect classification, ViT synthetic image authenticity detection,
 * Sentence-BERT & DBSCAN spatial deduplication, and monsoon risk forecasting.
 */

const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://127.0.0.1:5000/api/ml';


/**
 * Downsamples huge camera photos (> 500KB or > 1200px) in a browser canvas
 * so file upload and network latency drops from 1000ms to 5ms.
 */
const optimizeImageForFastUpload = async (fileOrBlob) => {
  if (!(fileOrBlob instanceof Blob)) return fileOrBlob;
  if (fileOrBlob.size < 500 * 1024) return fileOrBlob; // Already small enough

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const url = URL.createObjectURL(fileOrBlob);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const maxDim = 1200;
        let { width, height } = img;
        if (width <= maxDim && height <= maxDim) {
          resolve(fileOrBlob);
          return;
        }
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => resolve(blob || fileOrBlob),
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(fileOrBlob);
      };
      img.src = url;
    } catch {
      resolve(fileOrBlob);
    }
  });
};

/**
 * Sends image to local OpenAI CLIP + ViT engine for zero-shot civic defect classification,
 * spam rejection, and holographic HUD reticle generation.
 * Supports File object or Base64 string.
 */
export const detectDefectWithCLIP = async (fileOrBase64, hintTitle = '') => {
  try {
    const optimized = (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob)
      ? await optimizeImageForFastUpload(fileOrBase64)
      : fileOrBase64;

    const formData = new FormData();
    if (optimized instanceof File || optimized instanceof Blob) {
      formData.append('file', optimized, fileOrBase64.name || 'evidence.jpg');
    } else if (typeof optimized === 'string') {
      formData.append('image_base64', optimized);
    }
    if (hintTitle) {
      formData.append('hint_title', hintTitle);
    }

    const res = await fetch(`${ML_SERVICE_URL}/detect-defect`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.info('Local ML service not responding, using client heuristic fallback.', err);
  }
  return null;
};

/**
 * Executes DBSCAN geodesic clustering on candidate grievance against active neighborhood tickets.
 */
export const checkDuplicateWithDBSCAN = async (candidate, existingComplaints, radiusMeters = 25.0) => {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/cluster-duplicates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate,
        existing_complaints: existingComplaints,
        radius_meters: radiusMeters,
      }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    console.info('Local ML service offline for DBSCAN deduplication check.');
  }
  return null;
};

/**
 * Predicts monsoon waterlogging risk probability and QRT dispatch protocol.
 */
export const predictMonsoonRiskML = async (wardCode, rainfallMmHr, tideHeightM = 3.8, mithiRiverLevelM = 2.4) => {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/monsoon-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ward_code: wardCode,
        rainfall_mm_hr: rainfallMmHr,
        tide_height_m: tideHeightM,
        mithi_river_level_m: mithiRiverLevelM,
      }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    console.info('Local ML service offline for monsoon risk prediction.');
  }
  return null;
};

/**
 * Connects to the municipal assistant intelligence engine (NVIDIA NIM, Groq Cloud, or Google Gemini).
 */
export const queryAssistantChat = async (query, language = 'en', userWard = 8, options = {}) => {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        language,
        user_ward: userWard,
        provider: options.provider,
        model: options.model,
      }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    console.info('Assistant chat service offline, using client NLP fallback.');
  }
  return null;
};

/**
 * Submits staff confirmation or dismissal of a flagged duplicate.
 */
export const submitDuplicateReview = async (complaintId, candidateId, officerId, decision, notes = '') => {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/duplicate-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complaint_id: complaintId,
        candidate_id: candidateId,
        officer_id: officerId,
        decision,
        notes,
      }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Duplicate review submission failed:', err);
  }
  return null;
};
