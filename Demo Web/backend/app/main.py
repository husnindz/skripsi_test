import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

import numpy as np
import torch
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .schemas import (
    CheckUpInput,
    PredictionResponse,
    PredictionInfo,
    ExplanationInfo,
    HealthResponse,
    AIRecommendationRequest,
    AIRecommendationResponse,
)
from .preprocessing import FEATURE_ORDER, TARGET_NAMES, Preprocessor
from .model import TabularConformer
from .explainer import ConformerExplainer
from .ollama_service import generate_clinical_narrative

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("aethermed")

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "models"
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

app = FastAPI(
    title="AetherMed Medical Conformer XAI API",
    description="Backend API for Tabular Conformer Medical Check-up Screening & SHAP XAI Visualizer",
    version="1.0.0",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model state
preprocessor = Preprocessor(models_dir=MODELS_DIR)
model: Optional[TabularConformer] = None
explainer: Optional[ConformerExplainer] = None
model_mode: str = "simulation"


def load_model_artifacts():
    global model, explainer, model_mode
    config_path = MODELS_DIR / "config.json"
    weights_path = MODELS_DIR / "conformer_model.pth"

    # Default config
    config = {
        "num_features": len(FEATURE_ORDER),
        "num_classes": 4,
        "d_model": 64,
        "num_heads": 4,
        "num_layers": 2,
        "ffn_dim": 128,
        "conv_kernel_size": 3,
        "dropout": 0.1,
    }

    if config_path.exists():
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                loaded_cfg = json.load(f)
                config.update({k: v for k, v in loaded_cfg.items() if k in config})
        except Exception as e:
            logger.warning("Could not parse config.json: %s", e)

    # Initialize PyTorch architecture
    conformer = TabularConformer(
        num_features=config["num_features"],
        num_classes=config["num_classes"],
        d_model=config["d_model"],
        num_heads=config["num_heads"],
        num_layers=config["num_layers"],
        ffn_dim=config["ffn_dim"],
        conv_kernel_size=config["conv_kernel_size"],
        dropout=config["dropout"],
    )

    if weights_path.exists() and weights_path.stat().st_size > 0:
        try:
            state_dict = torch.load(weights_path, map_location="cpu", weights_only=True)
            conformer.load_state_dict(state_dict)
            conformer.eval()
            model = conformer
            model_mode = "model"
            logger.info("Loaded Conformer weights from %s", weights_path)
        except Exception as e:
            logger.warning(
                "Could not load weights from %s: %s. Falling back to simulation mode.",
                weights_path,
                e,
            )
            model = None
            model_mode = "simulation"
    else:
        logger.info(
            "Weights conformer_model.pth not yet found in %s. Running in calibrated simulation mode.",
            MODELS_DIR,
        )
        model = None
        model_mode = "simulation"

    explainer = ConformerExplainer(model=model, preprocessor=preprocessor)


# Initialize immediately at module import
load_model_artifacts()


@app.on_event("startup")
def startup_event():
    load_model_artifacts()


@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="healthy",
        model_loaded=(model is not None),
        scaler_loaded=preprocessor.is_custom_scaler,
        mode=model_mode,
        feature_count=len(FEATURE_ORDER),
        canonical_features=FEATURE_ORDER,
    )


def simulate_inference(scaled_1d: np.ndarray) -> np.ndarray:
    """
    Calibrated simulation engine based on dataset distribution
    when .pth weights are pending.
    """
    # Feature indices:
    # 0: GENDER, 1: AGE, 2: CHOL, 3: CREAT, 4: FBS, 5: RBS,
    # 6: HGB, 7: LYMPH, 8: MCH, 9: MCHC, 10: MCV, 11: UREUM, 12: WBC
    
    # Base logits
    # 0: Sehat, 1: Jantung, 2: Penyakit Dalam, 3: Paru-Paru
    logits = np.zeros(4, dtype=np.float32)

    # Deviation scores
    chol = scaled_1d[2]
    creat = scaled_1d[3]
    fbs = scaled_1d[4]
    rbs = scaled_1d[5]
    hgb = scaled_1d[6]
    lymph = scaled_1d[7]
    ureum = scaled_1d[11]
    wbc = scaled_1d[12]
    age = scaled_1d[1]

    # Healthy logit: favored when values are near normal (z-score near 0)
    abnormality_sum = (
        abs(chol) * 0.4 + abs(creat) * 0.5 + abs(fbs) * 0.6 +
        abs(ureum) * 0.5 + abs(wbc) * 0.6 + max(0, age - 1.0) * 0.3
    )
    logits[0] = 2.0 - abnormality_sum * 0.7

    # Jantung logit: driven by high cholesterol, older age, blood pressure/sugar
    logits[1] = 0.5 + (chol * 1.5) + (age * 0.7) + (creat * 0.4) + (rbs * 0.3)

    # Spes. Penyakit Dalam: driven by fasting blood sugar, ureum, creatinine (metabolic/renal)
    logits[2] = 0.5 + (fbs * 1.6) + (ureum * 1.3) + (creat * 1.2) + (rbs * 0.8)

    # Spes. Paru-Paru: driven by high WBC, abnormal lymphocytes, low hemoglobin
    logits[3] = 0.5 + (wbc * 1.8) - (lymph * 0.8) - (hgb * 0.9) + (age * 0.4)

    # Softmax
    exp_logits = np.exp(logits - np.max(logits))
    probs = exp_logits / np.sum(exp_logits)
    return probs.astype(np.float32)


@app.post("/predict", response_model=PredictionResponse)
def predict(data: CheckUpInput):
    try:
        # 1. Convert to numpy in canonical order
        raw_numpy = preprocessor.input_to_numpy(data)
        scaled_numpy = preprocessor.transform(raw_numpy)
        scaled_1d = scaled_numpy.flatten()

        # 2. Inference
        if model is not None:
            model.eval()
            with torch.no_grad():
                tensor_input = torch.tensor(scaled_numpy, dtype=torch.float32)
                logits = model(tensor_input)
                probs = torch.softmax(logits, dim=1).cpu().numpy()[0]
        else:
            probs = simulate_inference(scaled_1d)

        # 3. Determine top predicted class
        predicted_class_id = int(np.argmax(probs))
        predicted_class_name = TARGET_NAMES[predicted_class_id]

        # 4. Probabilities dictionary
        prob_dict = {
            TARGET_NAMES[i]: round(float(probs[i]), 4)
            for i in range(len(TARGET_NAMES))
        }

        # 5. SHAP Local Explanation
        contributions = explainer.explain_sample(
            raw_features=raw_numpy,
            scaled_features=scaled_numpy,
            predicted_class=predicted_class_id,
            probabilities=probs,
        )

        return PredictionResponse(
            prediction=PredictionInfo(
                class_id=predicted_class_id,
                class_name=predicted_class_name,
            ),
            probabilities=prob_dict,
            explanation=ExplanationInfo(features=contributions),
            mode=model_mode,
            status="success",
        )

    except Exception as e:
        logger.exception("Prediction failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}",
        )


@app.post("/ai-recommendations", response_model=AIRecommendationResponse)
def get_ai_recommendations(req: AIRecommendationRequest):
    """
    Generate dynamic medical clinical narrative & recommendations using Ollama (MedGemma / Llama).
    Called by frontend after Conformer prediction and SHAP analysis are displayed.
    """
    try:
        result = generate_clinical_narrative(
            patient_data=req.patient_data,
            predicted_class_id=req.predicted_class_id,
            predicted_class_name=req.predicted_class_name,
            probability=req.probability,
            top_shap_features=req.top_shap_features,
        )
        return AIRecommendationResponse(**result)
    except Exception as e:
        logger.exception("AI recommendation generation failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Recommendation error: {str(e)}",
        )


# Serve built frontend for single-container deployment (Hugging Face Spaces)
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Ignore api endpoints
        if (
            full_path.startswith("predict")
            or full_path.startswith("ai-recommendations")
            or full_path.startswith("health")
            or full_path.startswith("docs")
            or full_path.startswith("openapi.json")
        ):
            raise HTTPException(status_code=404, detail="Not Found")
        
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend index.html not found")
