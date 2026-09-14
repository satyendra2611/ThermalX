"""
Job Readiness prediction pipeline: feature prep -> XGBoost -> SHAP explanation.

If the trained model (ml/model.pkl) isn't present yet — e.g. before anyone has
run `python ml/train_model.py` — this falls back to a transparent weighted-average
formula so the API and frontend stay fully functional out of the box.
"""
import os
import joblib
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "model.pkl")

FEATURE_NAMES = [
    "topic_assessment_score",
    "project_completion_score",
    "project_understanding_score",
    "viva_score",
    "modification_score",
    "mock_interview_score",
]

FEATURE_WEIGHTS = {
    "topic_assessment_score": 0.20,
    "project_completion_score": 0.15,
    "project_understanding_score": 0.15,
    "viva_score": 0.15,
    "modification_score": 0.15,
    "mock_interview_score": 0.20,
}

_model = None
_explainer = None


def _load_model():
    global _model, _explainer
    if _model is not None:
        return
    try:
        _model = joblib.load(MODEL_PATH)
        import shap
        _explainer = shap.TreeExplainer(_model)
    except Exception:
        _model = False  # sentinel: "tried and unavailable"


def predict_readiness(features: dict) -> dict:
    """features keys must match FEATURE_NAMES (0-100 scale each)."""
    _load_model()
    ordered = [features.get(k, 0.0) for k in FEATURE_NAMES]

    if _model and _model is not False:
        X = np.array([ordered])
        score = float(_model.predict(X)[0])
        score = max(0.0, min(100.0, score))

        shap_values = _explainer.shap_values(X)[0]
        contributions = {name: float(val) for name, val in zip(FEATURE_NAMES, shap_values)}
    else:
        score = sum(features.get(k, 0.0) * w for k, w in FEATURE_WEIGHTS.items())
        baseline = 50.0
        contributions = {
            k: round((features.get(k, 0.0) - baseline) * FEATURE_WEIGHTS[k] / 5, 1)
            for k in FEATURE_NAMES
        }

    return {"score": round(score, 1), "contributions": contributions}


LABELS = {
    "topic_assessment_score": "Topic assessment performance",
    "project_completion_score": "Project completion",
    "project_understanding_score": "Project understanding",
    "viva_score": "AI viva performance",
    "modification_score": "Modification challenge",
    "mock_interview_score": "Mock interview",
}


def build_report(features: dict) -> dict:
    result = predict_readiness(features)
    score = result["score"]
    contributions = result["contributions"]

    ranked = sorted(contributions.items(), key=lambda kv: kv[1], reverse=True)
    positive = [{"label": LABELS[k], "impact": round(v, 1)} for k, v in ranked if v > 0][:3]
    negative = [{"label": LABELS[k], "impact": round(v, 1)} for k, v in ranked if v < 0][:3]

    if score < 40:
        status = "foundation"
    elif score < 60:
        status = "developing"
    elif score < 80:
        status = "approaching"
    else:
        status = "interview_ready"

    weak_labels = [n["label"] for n in negative]
    next_steps = [f"Focus on {label.lower()} before your next milestone." for label in weak_labels]
    if not next_steps:
        next_steps = ["Keep reinforcing your current roadmap topics."]
    next_steps.append("Retake your mock interview once you've closed the gaps above.")

    return {
        "readinessScore": score,
        "status": status,
        "positiveContributors": positive,
        "improvementFactors": negative,
        "recommendedNextSteps": next_steps,
    }
