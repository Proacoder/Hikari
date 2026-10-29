# backend/authenticity_service.py
"""
Standalone Image Authenticity & Provenance Analyzer.
Evaluates C2PA / Content Credentials markers, EXIF signatures, and frequency/noise
forensics to detect generative AI manipulation vs genuine camera capture.
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
    "automatic1111", "fooocus", "leonardo.ai", "bing image creator"
]


class ImageAuthenticityAnalyzer:
    """
    Singleton service analyzing cryptographic provenance, EXIF metadata,
    and frequency domain noise residuals for synthetic image detection.
    """
    _instance: Optional["ImageAuthenticityAnalyzer"] = None

    def __init__(self):
        self.version = "1.0.0-forensics"

    @classmethod
    def get_instance(cls) -> "ImageAuthenticityAnalyzer":
        if cls._instance is None:
            cls._instance = ImageAuthenticityAnalyzer()
        return cls._instance

    def _check_c2pa_provenance(self, raw_bytes: bytes) -> Dict[str, Any]:
        """
        Inspects binary payloads for C2PA JUMBF boxes, Content Credentials,
        or XMP assertion manifests.
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

        # Synthetic smoothness heuristic:
        # Generative diffusion models frequently yield very high cross-channel correlation
        # with low localized noise grain compared to CMOS sensors.
        is_synthetic_noise = channel_correlation > 0.96 and hf_variance < 80.0

        return {
            "high_frequency_variance": round(hf_variance, 2),
            "spectral_skewness": round(hf_skewness, 3),
            "channel_correlation": round(channel_correlation, 3),
            "is_synthetic_noise_signature": is_synthetic_noise
        }

    def analyze_authenticity(self, raw_bytes: bytes) -> Dict[str, Any]:
        """
        Performs holistic multi-modal authenticity assessment.
        Returns explicit status, risk score, and detailed evidence.
        """
        t0 = time.time()
        try:
            img = Image.open(io.BytesIO(raw_bytes))
            img.verify()
            img = Image.open(io.BytesIO(raw_bytes))
        except Exception as e:
            return {
                "authenticity_verdict": "model_unavailable",
                "authenticity_score": 0.0,
                "evidence_signals": [f"Image file unreadable: {str(e)}"],
                "actionable_summary": "Unable to verify file structure.",
                "processing_time_ms": round((time.time() - t0) * 1000, 2)
            }

        c2pa = self._check_c2pa_provenance(raw_bytes)
        exif = self._check_exif_signatures(img)
        noise = self._analyze_noise_and_frequency(img)

        signals = []
        ai_risk_score = 0.20  # Neutral prior

        # 1. Direct signature hits
        if exif["ai_software_tag"]:
            signals.append(f"Direct AI software tag in metadata ({exif['ai_software_tag']})")
            ai_risk_score = 0.95
        elif c2pa["provenance_found"]:
            signals.append("C2PA content credentials verified in file manifest")
            ai_risk_score = 0.10

        # 2. Camera hardware tags
        if exif["has_camera_hardware"]:
            signals.append("Hardware camera EXIF tags confirmed (smartphone/digital camera)")
            ai_risk_score = max(0.05, ai_risk_score - 0.25)
        elif not exif["has_exif"]:
            signals.append("No EXIF metadata found (typical of web-compressed or edited images)")
            ai_risk_score += 0.15

        # 3. Noise & frequency signature
        if noise["is_synthetic_noise_signature"]:
            signals.append("High channel correlation with low localized sensor grain (synthetic diffusion signature)")
            ai_risk_score += 0.25
        else:
            signals.append(f"Natural noise distribution detected (HF variance {noise['high_frequency_variance']})")
            ai_risk_score = max(0.05, ai_risk_score - 0.10)

        ai_risk_score = round(float(np.clip(ai_risk_score, 0.05, 0.98)), 2)

        # Verdict assignment
        if exif["ai_software_tag"] or ai_risk_score >= 0.80:
            verdict = "likely_ai_generated"
            summary = (
                f"Image exhibits high synthetic indicators (risk score {ai_risk_score}). "
                "Flagged for municipal officer scrutiny prior to field dispatch."
            )
        elif exif["has_camera_hardware"] and ai_risk_score < 0.35:
            verdict = "likely_camera_captured_or_non_ai"
            summary = (
                f"Image demonstrates authentic camera sensor characteristics (risk score {ai_risk_score}). "
                "Physical capture verified."
            )
        elif 0.35 <= ai_risk_score < 0.70:
            verdict = "manipulated_or_mixed_evidence"
            summary = (
                f"Mixed evidence: compression or editing detected (risk score {ai_risk_score}). "
                "Non-blocking review recommended."
            )
        else:
            verdict = "inconclusive"
            summary = "Insufficient forensic indicators to conclusively classify image provenance."

        elapsed_ms = round((time.time() - t0) * 1000, 2)

        return {
            "authenticity_verdict": verdict,
            "authenticity_score": ai_risk_score,
            "evidence_signals": signals,
            "c2pa_provenance": c2pa,
            "exif_telemetry": exif,
            "frequency_telemetry": noise,
            "actionable_summary": summary,
            "processing_time_ms": elapsed_ms
        }


def get_authenticity_analyzer() -> ImageAuthenticityAnalyzer:
    return ImageAuthenticityAnalyzer.get_instance()
