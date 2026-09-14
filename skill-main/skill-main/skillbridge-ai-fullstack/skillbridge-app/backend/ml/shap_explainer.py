"""
Standalone SHAP explainability helper — useful for offline analysis or
notebooks. The live API path (app/services/readiness_service.py) loads the
same model and explainer directly for request-time explanations.

Run: python ml/shap_explainer.py
"""
import os
import joblib
import shap
import pandas as pd

from generate_data import generate

FEATURES = [
    "topic_assessment_score",
    "project_completion_score",
    "project_understanding_score",
    "viva_score",
    "modification_score",
    "mock_interview_score",
]


def explain_sample(n: int = 5):
    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    if not os.path.exists(model_path):
        raise SystemExit("No trained model found — run train_model.py first.")

    model = joblib.load(model_path)
    df = generate().sample(n, random_state=1)
    X = df[FEATURES]

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)

    for i in range(n):
        print(f"\nLearner {i + 1} — predicted readiness: {model.predict(X.iloc[[i]])[0]:.1f}")
        for feat, val in sorted(zip(FEATURES, shap_values[i]), key=lambda kv: -abs(kv[1])):
            sign = "+" if val >= 0 else ""
            print(f"  {feat:<28} {sign}{val:.2f}")


if __name__ == "__main__":
    explain_sample()
