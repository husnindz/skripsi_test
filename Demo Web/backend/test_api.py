import json
from starlette.testclient import TestClient
from app.main import app
from app.preprocessing import FEATURE_ORDER, TARGET_NAMES

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200, f"Health check failed: {response.text}"
    data = response.json()
    assert data["status"] == "healthy"
    assert data["feature_count"] == 13
    assert data["canonical_features"] == FEATURE_ORDER
    print("[PASS] /health endpoint OK:", data)

def test_predict_samples():
    samples = [
        {
            "name": "Sehat",
            "data": {
                "JENIS_KELAMIN": 0,
                "UMUR_TAHUN": 28,
                "cholesterol total": 165.0,
                "creatinin": 0.85,
                "fbs": 88.0,
                "rbs": 110.0,
                "hgb": 14.5,
                "lymfosit%": 32.0,
                "mch": 28.5,
                "mchc": 33.5,
                "mcv": 85.0,
                "ureum": 26.0,
                "wbc": 6.8,
            }
        },
        {
            "name": "Jantung",
            "data": {
                "JENIS_KELAMIN": 1,
                "UMUR_TAHUN": 64,
                "cholesterol total": 282.5,
                "creatinin": 1.65,
                "fbs": 122.0,
                "rbs": 175.0,
                "hgb": 12.0,
                "lymfosit%": 24.5,
                "mch": 26.2,
                "mchc": 32.0,
                "mcv": 80.5,
                "ureum": 52.0,
                "wbc": 8.4,
            }
        },
        {
            "name": "Penyakit Dalam",
            "data": {
                "JENIS_KELAMIN": 1,
                "UMUR_TAHUN": 58,
                "cholesterol total": 228.0,
                "creatinin": 3.45,
                "fbs": 235.0,
                "rbs": 310.0,
                "hgb": 10.8,
                "lymfosit%": 21.0,
                "mch": 25.5,
                "mchc": 31.8,
                "mcv": 78.0,
                "ureum": 115.0,
                "wbc": 9.6,
            }
        },
        {
            "name": "Paru-Paru",
            "data": {
                "JENIS_KELAMIN": 0,
                "UMUR_TAHUN": 52,
                "cholesterol total": 185.0,
                "creatinin": 1.1,
                "fbs": 95.0,
                "rbs": 130.0,
                "hgb": 9.8,
                "lymfosit%": 12.5,
                "mch": 24.0,
                "mchc": 30.5,
                "mcv": 76.5,
                "ureum": 44.0,
                "wbc": 16.8,
            }
        },
    ]

    for s in samples:
        res = client.post("/predict", json=s["data"])
        assert res.status_code == 200, f"Predict failed for {s['name']}: {res.text}"
        payload = res.json()
        
        # Verify schema
        assert "prediction" in payload
        assert "probabilities" in payload
        assert "explanation" in payload
        assert payload["status"] == "success"
        
        pred = payload["prediction"]
        assert pred["class_id"] in (0, 1, 2, 3)
        assert pred["class_name"] == TARGET_NAMES[pred["class_id"]]

        # Check probabilities
        probs = payload["probabilities"]
        assert len(probs) == 4
        prob_sum = sum(probs.values())
        assert abs(prob_sum - 1.0) < 0.05, f"Probabilities do not sum to 1.0: {prob_sum}"

        # Check SHAP explanation
        features = payload["explanation"]["features"]
        assert len(features) == 13, f"Expected 13 feature explanations, got {len(features)}"
        
        print(f"[PASS] Sample '{s['name']}' -> Predicted: {pred['class_name']} ({probs[pred['class_name']]:.2%}) | Top SHAP: {features[0]['feature']} ({features[0]['shap']:+.4f})")

def test_static_frontend_serving():
    res = client.get("/")
    assert res.status_code == 200
    assert "<!doctype html>" in res.text.lower()
    assert "aethermed" in res.text.lower()
    print("[PASS] Static frontend serving OK (index.html served at /)")

if __name__ == "__main__":
    print("Running AetherMed API Integration Tests...")
    test_health()
    test_predict_samples()
    test_static_frontend_serving()
    print("ALL TESTS PASSED SUCCESSFULLY!")
