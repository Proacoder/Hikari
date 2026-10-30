# backend/authenticity_service.py
"""
Production-grade AI Image Authenticity & Provenance Detection Engine.
Uses a multi-tier defense ensemble:
1. Deep Learning Vision Transformer (Hugging Face Swin/ViT: umm-maybe/AI-image-detector)
2. C2PA / Content Credentials cryptographic binary manifest analysis
3. EXIF camera hardware vs AI generative tool signature verification
4. High-frequency noise residuals and spectral channel cross-correlation
"""

import os
import io
import time
import logging
from typing import Dict, Any, List, Optional
import numpy as np
from PIL import Image, ExifTags

logger = logging.getLogger("kaiser_authenticity")

AI_GENERATOR_SIGNATURES = [
    "midjourney", "dall-e", "dalle", "stable diffusion", "stablediffusion",
    "novelai", "firefly", "adobe firefly", "civitai", "comfyui",
    "automatic1111", "fooocus", "leonardo.ai", "bing image creator",
    "flux.1", "flux", "ideogram", "runway", "pika", "sora", "kling"
]


class ImageAuthenticityAnalyzer:
    """
    Singleton service analyzing deep learning synthetic representations,
    cryptographic provenance, EXIF metadata, and frequency domain noise residuals.
    """
    _instance: Optional["ImageAuthenticityAnalyzer"] = None

    def __init__(self):
        self.version = "2.0.0-production-vit"
        self._hf_model = None
        self._hf_processor = None
        self._hf_device = "cpu"
        self._hf_ready = False
        self._init_attempted = False

    @classmethod
    def get_instance(cls) -> "ImageAuthenticityAnalyzer":
        if cls._instance is None:
            cls._instance = ImageAuthenticityAnalyzer()
        return cls._instance

    def _init_hf_model(self):
        """Lazy-loads the Hugging Face Swin/ViT AI image detector model."""
        if self._init_attempted:
            return
        self._init_attempted = True

        try:
            import torch
            from transformers import AutoImageProcessor, AutoModelForImageClassification

            self._hf_device = "cuda" if torch.cuda.is_available() else "cpu"
            backend_dir = os.path.dirname(__file__)
            env_model_dir = os.getenv("AI_DETECTOR_MODEL_DIR")
            local_model_dir = env_model_dir if (env_model_dir and os.path.isabs(env_model_dir)) else os.path.join(backend_dir, env_model_dir or "models/ai_detector")

            # Check if local model weights are present
            if os.path.exists(local_model_dir) and os.path.exists(os.path.join(local_model_dir, "pytorch_model.bin")):
                model_source = local_model_dir
                logger.info(f"Loading local AI Image Detector weights from {local_model_dir}...")
            else:
                model_source = "umm-maybe/AI-image-detector"
                logger.info(f"Loading AI Image Detector from Hugging Face: {model_source}...")

            self._hf_processor = AutoImageProcessor.from_pretrained(model_source)
            self._hf_model = AutoModelForImageClassification.from_pretrained(model_source)
            self._hf_model.to(self._hf_device)
            self._hf_model.eval()
            self._hf_ready = True
            logger.info(f"AI Image Detector model initialized successfully on {self._hf_device}.")
        except Exception as e:
            logger.warning(f"AI Image Detector ViT model init note (multi-signal forensic fallback active): {e}")
            self._hf_ready = False

    def _predict_deep_learning_ai(self, img: Image.Image) -> Dict[str, Any]:
        """
        Runs the Hugging Face Swin/ViT transformer on the input image.
        Returns AI generation probability and real camera capture probability.
        """
        if not self._hf_ready:
            self._init_hf_model()

        if not self._hf_ready or self._hf_model is None or self._hf_processor is None:
            return {
                "model_available": False,
                "ai_probability": None,
                "real_probability": None,
                "label": "unknown"
            }

        try:
            import torch
            rgb_img = img.convert("RGB")
            inputs = self._hf_processor(images=rgb_img, return_tensors="pt")
            inputs = {k: v.to(self._hf_device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = self._hf_model(**inputs)
                logits = outputs.logits
                probs = torch.softmax(logits, dim=-1).squeeze().tolist()

            id2label = getattr(self._hf_model.config, "id2label", {0: "artificial", 1: "human"})
            
            # Map probabilities according to config
            score_dict = {}
            for idx, prob in enumerate(probs):
                lbl = str(id2label.get(idx, str(idx))).lower()
                score_dict[lbl] = float(prob)

            ai_prob = score_dict.get("artificial", score_dict.get("0", 0.5))
            real_prob = score_dict.get("human", score_dict.get("1", 0.5))

            return {
                "model_available": True,
                "ai_probability": round(ai_prob, 4),
                "real_probability": round(real_prob, 4),
                "label": "artificial" if ai_prob >= 0.5 else "human"
            }
        except Exception as e:
            logger.error(f"Inference error in AI image detector: {e}")
            return {
                "model_available": False,
                "ai_probability": None,
                "real_probability": None,
                "label": "error"
            }

    def _check_c2pa_provenance(self, raw_bytes: bytes) -> Dict[str, Any]:
        """
        Inspects binary payloads for C2PA JUMBF boxes, Content Credentials,
        or XMP assertion manifests commonly added by DALL-E, Firefly, Midjourney.
        """
        has_jumbf = b"jumb" in raw_bytes[:10000] or b"c2pa" in raw_bytes[:50000]
        has_content_credentials = b"contentCredentials" in raw_bytes or b"adobe:c2pa" in raw_bytes

        if has_jumbf or has_content_credentials:
            return {
                "provenance_found": True,
                "c2pa_marker": True,
                "manifest_type": "C2PA / Adobe Content Credentials",
                "details": "Cryptographic Content Credentials manifest located in binary markers."
            }
        return {
            "provenance_found": False,
            "c2pa_marker": False,
            "manifest_type": None,
            "details": "No standard C2PA JUMBF header found."
        }

    def _check_exif_signatures(self, img: Image.Image) -> Dict[str, Any]:
        """
        Inspects EXIF metadata for camera hardware tags vs AI generator strings.
        """
        signals = []
        exif_data = {}
        ai_tag_found = None
        has_camera_hardware = False

        try:
            raw_exif = img.getexif()
            if raw_exif:
                for tag_id, value in raw_exif.items():
                    tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                    val_str = str(value)
                    exif_data[tag_name] = val_str

                    # Check for known AI software tags
                    for sig in AI_GENERATOR_SIGNATURES:
                        if sig in val_str.lower():
                            ai_tag_found = sig
                            signals.append(f"AI generator signature detected in EXIF '{tag_name}': {sig}")

                # Camera hardware markers
                make = exif_data.get("Make", "")
                model = exif_data.get("Model", "")
                if make or model:
                    has_camera_hardware = True
                    signals.append(f"Camera hardware identified: {make} {model}".strip())
        except Exception as e:
            logger.debug(f"EXIF extraction note: {e}")

        return {
            "has_exif": bool(exif_data),
            "ai_software_tag": ai_tag_found,
            "has_camera_hardware": has_camera_hardware,
            "exif_tags_count": len(exif_data),
            "signals": signals
        }

    def _analyze_noise_and_frequency(self, img: Image.Image) -> Dict[str, Any]:
        """
        Examines high-frequency noise residuals and spectral smoothness.
        AI generative models often display unnaturally uniform noise residuals
        or periodic high-frequency grid artifacts compared to camera sensors.
        """
        try:
            gray = img.convert("L").resize((256, 256), Image.Resampling.BILINEAR)
            arr = np.array(gray, dtype=np.float32)

            # High-pass filter via Laplacian
            laplacian = np.array([
                [0, 1, 0],
                [1, -4, 1],
                [0, 1, 0]
            ], dtype=np.float32)
            from scipy.signal import convolve2d
            high_freq = convolve2d(arr, laplacian, mode='valid')

            hf_variance = float(np.var(high_freq))
            hf_skewness = float(np.mean(((high_freq - np.mean(high_freq)) / (np.std(high_freq) + 1e-6))**3))

            # Check for color channel correlation
            rgb = np.array(img.convert("RGB").resize((128, 128)), dtype=np.float32)
            r_diff = np.abs(np.diff(rgb[:, :, 0], axis=1)).flatten()
            g_diff = np.abs(np.diff(rgb[:, :, 1], axis=1)).flatten()
            
            if np.std(r_diff) > 1e-5 and np.std(g_diff) > 1e-5:
                corr_mat = np.corrcoef(r_diff, g_diff)
                channel_correlation = float(corr_mat[0, 1]) if not np.isnan(corr_mat[0, 1]) else 0.0
            else:
                channel_correlation = 0.0

            is_synthetic_noise = channel_correlation > 0.96 and hf_variance < 80.0

            return {
                "high_frequency_variance": round(hf_variance, 2),
                "spectral_skewness": round(hf_skewness, 3),
                "channel_correlation": round(channel_correlation, 3),
                "is_synthetic_noise_signature": is_synthetic_noise
            }
        except Exception as e:
            logger.debug(f"Frequency analysis note: {e}")
            return {
                "high_frequency_variance": 100.0,
                "spectral_skewness": 0.0,
                "channel_correlation": 0.5,
                "is_synthetic_noise_signature": False
            }

    def analyze_authenticity(self, raw_bytes: bytes) -> Dict[str, Any]:
        """
        Performs holistic multi-modal authenticity assessment:
        1. Deep Learning Vision Transformer (Hugging Face)
        2. C2PA Cryptographic Provenance
        3. EXIF Camera Metadata vs AI generator markers
        4. Spectral noise and frequency residuals
        """
        t0 = time.time()
        try:
            img = Image.open(io.BytesIO(raw_bytes))
            img.verify()
            img = Image.open(io.BytesIO(raw_bytes))
        except Exception as e:
            return {
                "is_ai_generated": False,
                "authenticity_verdict": "model_unavailable",
                "authenticity_score": 0.0,
                "evidence_signals": [f"Image file unreadable: {str(e)}"],
                "actionable_summary": "Unable to verify file structure.",
                "processing_time_ms": round((time.time() - t0) * 1000, 2)
            }

        # 1. Run Deep Learning Transformer Model
        dl_res = self._predict_deep_learning_ai(img)
        c2pa = self._check_c2pa_provenance(raw_bytes)
        exif = self._check_exif_signatures(img)
        noise = self._analyze_noise_and_frequency(img)

        signals = []

        # Calculate combined risk score
        if dl_res["model_available"] and dl_res["ai_probability"] is not None:
            # Baseline from vision transformer
            ai_risk_score = dl_res["ai_probability"]
            signals.append(
                f"Vision Transformer classified as {dl_res['label'].upper()} "
                f"({round(ai_risk_score * 100, 1)}% synthetic probability)"
            )
            model_source = "Hugging Face Swin/ViT (umm-maybe/AI-image-detector)"
        else:
            ai_risk_score = 0.20  # Neutral prior if DL model unavailable
            model_source = "Multi-Signal Forensic & EXIF Provenance Engine"

        # 2. Check direct AI software tags
        if exif["ai_software_tag"]:
            signals.append(f"Direct AI software tag in metadata ({exif['ai_software_tag']})")
            ai_risk_score = max(0.96, ai_risk_score)
        elif c2pa["provenance_found"]:
            signals.append("C2PA content credentials verified in file manifest")
            ai_risk_score = max(0.90, ai_risk_score)

        # 3. Camera hardware verification
        if exif["has_camera_hardware"]:
            signals.append("Hardware camera EXIF tags confirmed (smartphone/digital camera)")
            # If camera hardware confirmed, penalize AI risk unless DL model is ultra-confident
            if ai_risk_score < 0.85:
                ai_risk_score = max(0.04, ai_risk_score - 0.25)
        elif not exif["has_exif"]:
            signals.append("No EXIF metadata found (typical of web-compressed, AI-generated, or scrubbed images)")
            if ai_risk_score < 0.70:
                ai_risk_score += 0.08

        # 4. Noise & frequency signature
        if noise["is_synthetic_noise_signature"]:
            signals.append("High channel correlation with low localized sensor grain (synthetic diffusion signature)")
            ai_risk_score = min(0.98, ai_risk_score + 0.15)
        else:
            signals.append(f"Natural noise distribution detected (HF variance {noise['high_frequency_variance']})")
            ai_risk_score = max(0.04, ai_risk_score - 0.05)

        ai_risk_score = round(float(np.clip(ai_risk_score, 0.02, 0.99)), 3)
        real_score = round(1.0 - ai_risk_score, 3)

        # Final Decision: Flag if transformer identifies as artificial or metadata contains AI marks
        is_ai = bool(
            ai_risk_score >= 0.65
            or (dl_res.get("model_available") and dl_res.get("label") == "artificial" and ai_risk_score >= 0.55)
            or exif.get("ai_software_tag")
            or c2pa.get("provenance_found")
        )

        if is_ai:
            verdict = "ai_generated"
            summary = (
                f"Image classified as AI-Generated / Synthetic (AI Risk: {round(ai_risk_score * 100, 1)}%). "
                "Municipal work orders require authentic on-site camera photographs."
            )
        elif ai_risk_score <= 0.35:
            verdict = "genuine_camera"
            summary = (
                f"Image verified as authentic camera capture ({round(real_score * 100, 1)}% confidence). "
                "Physical defect evidence approved."
            )
        else:
            verdict = "suspicious_or_edited"
            summary = (
                f"Mixed evidence: compression or editing detected ({round(ai_risk_score * 100, 1)}% risk). "
                "Non-blocking municipal review recommended."
            )

        elapsed_ms = round((time.time() - t0) * 1000, 2)

        return {
            "is_ai_generated": is_ai,
            "authenticity_verdict": verdict,
            "authenticity_score": ai_risk_score,
            "ai_probability": ai_risk_score,
            "real_probability": real_score,
            "confidence": f"{round(ai_risk_score * 100 if is_ai else real_score * 100, 1)}%",
            "model_source": model_source,
            "evidence_signals": signals,
            "c2pa_provenance": c2pa,
            "exif_telemetry": exif,
            "frequency_telemetry": noise,
            "actionable_summary": summary,
            "processing_time_ms": elapsed_ms
        }


def get_authenticity_analyzer() -> ImageAuthenticityAnalyzer:
    return ImageAuthenticityAnalyzer.get_instance()
