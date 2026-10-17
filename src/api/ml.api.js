/**
 * Kaiser AI Local ML Service Client (FastAPI on http://localhost:5001)
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
 * Connects to the local assistant intelligence engine or Gemini 1.5 Flash.
 */
export const queryAssistantChat = async (query, language = 'en', userWard = 8) => {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        language,
        user_ward: userWard,
      }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    console.info('Local assistant chat service offline, using client NLP fallback.');
  }
  return null;
};
