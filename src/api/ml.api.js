/**
 * Kaiser AI Unified ML Service Client (FastAPI on http://localhost:5000)
 * Integrates OpenAI CLIP defect classification, ViT synthetic image authenticity detection,
 * Sentence-BERT & DBSCAN spatial deduplication, and monsoon risk forecasting.
 */

const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:5000/api/ml';


/**
 * Sends image to local OpenAI CLIP + ViT engine for zero-shot civic defect classification,
 * spam rejection, and holographic HUD reticle generation.
 * Supports File object or Base64 string.
 */
export const detectDefectWithCLIP = async (fileOrBase64, hintTitle = '') => {
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
 * Validates complaint photo with backend CLIP model across 15 categories.
 */
export const validateImageWithCLIP = async (fileOrBase64, textHint = '') => {
  try {
    const formData = new FormData();
    if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
      formData.append('file', fileOrBase64);
    } else if (typeof fileOrBase64 === 'string') {
      formData.append('image_base64', fileOrBase64);
    }
    if (textHint) formData.append('text_hint', textHint);

    const res = await fetch(`${ML_SERVICE_URL}/clip-validate`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('CLIP validation request failed:', err);
  }
  return null;
};

/**
 * Checks image authenticity and generative AI risk.
 */
export const checkImageAuthenticity = async (fileOrBase64) => {
  try {
    const formData = new FormData();
    if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
      formData.append('file', fileOrBase64);
    } else if (typeof fileOrBase64 === 'string') {
      formData.append('image_base64', fileOrBase64);
    }
    const res = await fetch(`${ML_SERVICE_URL}/image-authenticity`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Image authenticity request failed:', err);
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
