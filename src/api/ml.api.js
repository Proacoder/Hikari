/**
 * Kaiser AI Unified ML Service Client (FastAPI on http://localhost:5000)
 * Integrates YOLOv8 defect detection, DBSCAN spatial deduplication, and monsoon risk forecasting.
 */

const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:5001/api/ml';


/**
 * Sends image to local YOLOv8 engine for civic defect detection and bounding box segmentation.
 * Supports File object or Base64 string.
 */
export const detectDefectWithYOLO = async (fileOrBase64, hintTitle = '') => {
  try {
    const formData = new FormData();
    if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
      formData.append('file', fileOrBase64);
    } else if (typeof fileOrBase64 === 'string') {
      formData.append('image_base64', fileOrBase64);
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
 * Dedicated client for NVIDIA's OpenAI-compatible Chat Completions API.
 * Connects to https://integrate.api.nvidia.com/v1 via secure backend proxy.
 */
export const queryNvidiaChat = async (query, language = 'en', userWard = 8, model = null) => {
  try {
    const payload = {
      query,
      language,
      user_ward: userWard,
    };
    if (model) payload.model = model;

    const res = await fetch(`${ML_SERVICE_URL}/nvidia/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.info('NVIDIA chat service connection failed:', err);
  }
  return null;
};


/**
 * Automated Quality Audit (AQA) Resolution Verification Engine.
 * Sends before and after image Base64 to compute remediation score and anti-fraud checks.
 */
export const verifyResolutionWithML = async ({ complaintId, category, beforeBase64, afterBase64 }) => {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/verify-resolution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complaint_id: complaintId,
        category: category || 'Pothole',
        before_image_base64: beforeBase64,
        after_image_base64: afterBase64,
      }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.info('Resolution verification ML engine offline:', err);
  }
  return null;
};
