import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np
import joblib

from .schemas import CheckUpInput

logger = logging.getLogger(__name__)

# Canonical feature ordering - MUST NEVER BE REORDERED
FEATURE_ORDER: List[str] = [
    "JENIS_KELAMIN",
    "UMUR_TAHUN",
    "cholesterol total",
    "creatinin",
    "fbs",
    "rbs",
    "hgb",
    "lymfosit%",
    "mch",
    "mchc",
    "mcv",
    "ureum",
    "wbc",
]

TARGET_NAMES: Dict[int, str] = {
    0: "Sehat / Tidak Ada Indikasi",
    1: "Jantung dan Pembuluh Darah",
    2: "Spes. Penyakit Dalam",
    3: "Spes. Paru-Paru",
}

# Empirical dataset stats for fallback scaling when scaler.pkl is pending
DEFAULT_MEANS = np.array([
    0.5,     # JENIS_KELAMIN
    45.0,    # UMUR_TAHUN
    200.0,   # cholesterol total
    1.5,     # creatinin
    120.0,   # fbs
    140.0,   # rbs
    12.5,    # hgb
    28.0,    # lymfosit%
    27.0,    # mch
    33.0,    # mchc
    82.0,    # mcv
    60.0,    # ureum
    8.5,     # wbc
], dtype=np.float32)

DEFAULT_STDS = np.array([
    0.5,     # JENIS_KELAMIN
    14.3,    # UMUR_TAHUN
    34.3,    # cholesterol total
    2.04,    # creatinin
    72.3,    # fbs
    91.0,    # rbs
    1.82,    # hgb
    11.1,    # lymfosit%
    4.22,    # mch
    5.16,    # mchc
    15.2,    # mcv
    40.2,    # ureum
    3.97,    # wbc
], dtype=np.float32)


class Preprocessor:
    def __init__(self, models_dir: Optional[Path] = None):
        if models_dir is None:
            # Default to ../../models relative to this file
            self.models_dir = Path(__file__).resolve().parent.parent.parent / "models"
        else:
            self.models_dir = Path(models_dir)

        self.scaler = None
        self.is_custom_scaler = False
        self.load_scaler()

    def load_scaler(self):
        scaler_path = self.models_dir / "scaler.pkl"
        if scaler_path.exists() and scaler_path.stat().st_size > 0:
            try:
                self.scaler = joblib.load(scaler_path)
                self.is_custom_scaler = True
                logger.info("Successfully loaded fitted scaler from %s", scaler_path)
            except Exception as e:
                logger.warning("Could not load scaler from %s: %s. Using default empirical scaler.", scaler_path, e)
                self.scaler = None
                self.is_custom_scaler = False
        else:
            logger.info("scaler.pkl not found at %s. Using default empirical scaler.", scaler_path)
            self.scaler = None
            self.is_custom_scaler = False

    def input_to_numpy(self, data: CheckUpInput) -> np.ndarray:
        """Extract features in exact FEATURE_ORDER to 1D float32 numpy array."""
        values = [
            float(data.JENIS_KELAMIN),
            float(data.UMUR_TAHUN),
            float(data.cholesterol_total),
            float(data.creatinin),
            float(data.fbs),
            float(data.rbs),
            float(data.hgb),
            float(data.lymfosit_percent),
            float(data.mch),
            float(data.mchc),
            float(data.mcv),
            float(data.ureum),
            float(data.wbc),
        ]
        return np.array(values, dtype=np.float32)

    def transform(self, raw_features: np.ndarray) -> np.ndarray:
        """
        Scale features using fitted scaler if available, or empirical fallback.
        Input shape: (13,) or (N, 13)
        Returns: (N, 13) float32
        """
        features_2d = raw_features.reshape(-1, len(FEATURE_ORDER))

        if self.scaler is not None:
            try:
                import pandas as pd
                df = pd.DataFrame(features_2d, columns=FEATURE_ORDER)
                scaled = self.scaler.transform(df).astype(np.float32)
                return scaled
            except Exception as e:
                logger.warning("Scaler transform failed: %s. Falling back to default scaling.", e)

        # Fallback z-score scaling
        scaled = (features_2d - DEFAULT_MEANS) / DEFAULT_STDS
        return scaled.astype(np.float32)
