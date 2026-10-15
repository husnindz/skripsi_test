from pydantic import BaseModel, Field, field_validator
from typing import Dict, List, Optional, Any


class CheckUpInput(BaseModel):
    # 13 canonical features in exact order
    JENIS_KELAMIN: float = Field(..., description="0 for Laki-laki (Male), 1 for Perempuan (Female)")
    UMUR_TAHUN: float = Field(..., ge=0, le=130, description="Age in years")
    cholesterol_total: float = Field(..., alias="cholesterol total", ge=0, description="Total Cholesterol (mg/dL)")
    creatinin: float = Field(..., ge=0, description="Creatinine (mg/dL)")
    fbs: float = Field(..., ge=0, description="Fasting Blood Sugar (mg/dL)")
    rbs: float = Field(..., ge=0, description="Random Blood Sugar (mg/dL)")
    hgb: float = Field(..., ge=0, description="Hemoglobin (g/dL)")
    lymfosit_percent: float = Field(..., alias="lymfosit%", ge=0, le=100, description="Lymphocyte percentage (%)")
    mch: float = Field(..., ge=0, description="Mean Corpuscular Hemoglobin (pg)")
    mchc: float = Field(..., ge=0, description="Mean Corpuscular Hemoglobin Concentration (g/dL)")
    mcv: float = Field(..., ge=0, description="Mean Corpuscular Volume (fL)")
    ureum: float = Field(..., ge=0, description="Ureum (mg/dL)")
    wbc: float = Field(..., ge=0, description="White Blood Cell count (10^3/uL)")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "JENIS_KELAMIN": 1,
                "UMUR_TAHUN": 61.0,
                "cholesterol total": 169.98,
                "creatinin": 0.4,
                "fbs": 115.3,
                "rbs": 220.4,
                "hgb": 11.0,
                "lymfosit%": 14.4,
                "mch": 25.8,
                "mchc": 32.4,
                "mcv": 79.6,
                "ureum": 100.0,
                "wbc": 9.9
            }
        }
    }

    @field_validator("JENIS_KELAMIN")
    @classmethod
    def validate_gender(cls, v: float) -> float:
        if v not in (0.0, 1.0, 0, 1):
            raise ValueError("JENIS_KELAMIN must be 0 (Laki-laki) or 1 (Perempuan)")
        return float(v)


class PredictionInfo(BaseModel):
    class_id: int
    class_name: str


class FeatureContribution(BaseModel):
    feature: str
    value: float
    shap: float


class ExplanationInfo(BaseModel):
    features: List[FeatureContribution]


class PredictionResponse(BaseModel):
    prediction: PredictionInfo
    probabilities: Dict[str, float]
    explanation: ExplanationInfo
    mode: str = "model"
    status: str = "success"
    message: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    scaler_loaded: bool
    mode: str
    feature_count: int
    canonical_features: List[str]


class RecommendationItem(BaseModel):
    label: str
    text: str


class AIRecommendationRequest(BaseModel):
    patient_data: Dict[str, float]
    predicted_class_id: int
    predicted_class_name: str
    probability: float
    top_shap_features: List[Dict[str, Any]]


class AIRecommendationResponse(BaseModel):
    status: str
    engine: str
    ai_summary: str
    recommendations: List[RecommendationItem]
