"""
Generates a realistic synthetic dataset of learner performance for the
hackathon MVP, as described in the TRD (Section 5, Phase 1).

Run: python ml/generate_data.py
Produces: ml/synthetic_learners.csv
"""
import numpy as np
import pandas as pd
import os

RNG = np.random.default_rng(42)
N = 2000


def generate() -> pd.DataFrame:
    # Simulate a learner "ability" latent variable, then derive correlated
    # feature scores around it with realistic noise — stronger learners tend
    # to score well across the board, but not identically on every stage.
    ability = RNG.normal(65, 18, N).clip(5, 100)

    def noisy(base, spread):
        return (base + RNG.normal(0, spread, N)).clip(0, 100)

    topic_assessment_score = noisy(ability, 10)
    project_completion_score = noisy(ability * 0.95 + 5, 12)
    project_understanding_score = noisy(ability * 0.9 + 8, 12)
    viva_score = noisy(project_understanding_score * 0.85 + ability * 0.15, 10)
    modification_score = noisy(project_understanding_score * 0.8 + ability * 0.2, 12)
    mock_interview_score = noisy(ability * 0.8 + viva_score * 0.2, 13)

    # Ground-truth readiness label as a weighted, slightly noisy composite —
    # this is the "expert judgement" the model learns to approximate.
    readiness = (
        0.20 * topic_assessment_score
        + 0.15 * project_completion_score
        + 0.15 * project_understanding_score
        + 0.15 * viva_score
        + 0.15 * modification_score
        + 0.20 * mock_interview_score
    )
    readiness = (readiness + RNG.normal(0, 4, N)).clip(0, 100)

    return pd.DataFrame({
        "topic_assessment_score": topic_assessment_score,
        "project_completion_score": project_completion_score,
        "project_understanding_score": project_understanding_score,
        "viva_score": viva_score,
        "modification_score": modification_score,
        "mock_interview_score": mock_interview_score,
        "readiness_score": readiness,
    })


if __name__ == "__main__":
    df = generate()
    out_path = os.path.join(os.path.dirname(__file__), "synthetic_learners.csv")
    df.to_csv(out_path, index=False)
    print(f"Wrote {len(df)} synthetic learner records to {out_path}")
