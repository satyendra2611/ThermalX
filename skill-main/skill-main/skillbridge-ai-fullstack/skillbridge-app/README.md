# SkillBridge AI

AI-powered competency and job-readiness platform. Built from the project's PRD, TRD,
UI/UX and Application Flow documents, using the exact stack specified there:

```
React + TypeScript Frontend
        ↓
FastAPI Backend
        ↓
AI / ML Processing Layer (Groq + XGBoost + SHAP)
        ↓
MySQL Database
        ↓
Personalized Results & Dashboard
```

## Project structure

```
skillbridge-app/
├── frontend/     React + TypeScript + Tailwind + Recharts
├── backend/      FastAPI + SQLAlchemy + MySQL
│   └── ml/       Synthetic data generation, XGBoost training, SHAP
└── docker-compose.yml   Local MySQL for development
```

## Quick start

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # fill in DATABASE_URL / GROQ_API_KEY / etc.

# Optional but recommended — trains the real XGBoost readiness model.
# Without this step the API automatically falls back to a transparent
# weighted-average formula, so it still runs fine without it.
cd ml && python generate_data.py && python train_model.py && cd ..

uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`.

By default `DATABASE_URL` points at a local SQLite file (`skillbridge.db`) so the
API runs immediately with zero setup. To use MySQL as specified in the TRD:

```bash
docker compose up -d mysql
# then set in backend/.env:
# DATABASE_URL=mysql+pymysql://root:password@localhost:3306/skillbridge_ai
```

### 2. Frontend (React + TypeScript)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` to
`http://localhost:8000`, so no CORS configuration is needed locally.

## What's wired up

- **Authentication** — Google sign-in stub + mobile OTP flow (TextBee-ready,
  falls back to a demo `123456` code with no API key configured).
- **Assessment → Competency** — real scoring and strong/developing/needs-focus
  classification from `assessment_service.py`.
- **Roadmap engine** — topic-by-topic adaptive logic in `roadmap_service.py`.
- **AI Viva & Mock Interview** — Groq-backed when `GROQ_API_KEY` is set;
  otherwise a rule-based evaluator keeps the flow fully demoable.
- **Job Readiness** — XGBoost regression + SHAP explanation in
  `readiness_service.py`, with a transparent weighted-formula fallback until
  you've run the training scripts in `backend/ml/`.

## What still needs wiring for a production build

- Persisting assessment/project/viva/interview results to the SQLAlchemy
  models (currently held in-memory per process for demo simplicity).
- Real Google ID-token verification instead of trusting the payload.
- Session/token refresh and route guards on the frontend.

These are intentionally left as the next increment so the MVP stays easy to
run end-to-end during a hackathon demo.
