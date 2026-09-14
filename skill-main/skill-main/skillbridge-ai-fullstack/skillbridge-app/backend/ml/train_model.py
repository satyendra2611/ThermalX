"""
Trains the XGBoost Job Readiness model on the synthetic dataset and saves it
for the FastAPI backend to load at request time.

Run: python ml/train_model.py
Produces: ml/model.pkl
"""
import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import xgboost as xgb

from generate_data import generate

FEATURES = [
    "topic_assessment_score",
    "project_completion_score",
    "project_understanding_score",
    "viva_score",
    "modification_score",
    "mock_interview_score",
]
TARGET = "readiness_score"


def main():
    csv_path = os.path.join(os.path.dirname(__file__), "synthetic_learners.csv")
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
    else:
        df = generate()

    X = df[FEATURES]
    y = df[TARGET]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = xgb.XGBRegressor(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
        random_state=42,
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    print(f"Validation MAE: {mae:.2f} points | R^2: {r2:.3f}")

    out_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    joblib.dump(model, out_path)
    print(f"Saved trained model to {out_path}")


if __name__ == "__main__":
    main()
