from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import get_settings
from app.database.base import Base
from app.database.connection import engine

# Import models so SQLAlchemy registers them before create_all()
from app import models  # noqa: F401

# Import all API routers
from app.api import (
    auth,
    users,
    assessment,
    roadmap,
    projects,
    viva,
    interview,
    readiness,
    ai,
)


# Load application settings
settings = get_settings()


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="SkillBridge AI API",
    version="1.0.0",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        *settings.cors_origin_list,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# UPLOADS DIRECTORY
# ============================================================

upload_dir = os.path.join(
    os.path.dirname(__file__),
    "..",
    "uploads",
)

os.makedirs(upload_dir, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=upload_dir),
    name="uploads",
)


# ============================================================
# API ROUTES
# ============================================================

api_prefix = "/api"


# Authentication
app.include_router(
    auth.router,
    prefix=api_prefix,
)


# Users
app.include_router(
    users.router,
    prefix=api_prefix,
)


# Assessment
app.include_router(
    assessment.router,
    prefix=api_prefix,
)


# Career Roadmap
app.include_router(
    roadmap.router,
    prefix=api_prefix,
)


# Projects
app.include_router(
    projects.router,
    prefix=api_prefix,
)


# Viva Preparation
app.include_router(
    viva.router,
    prefix=api_prefix,
)


# Interview Preparation
app.include_router(
    interview.router,
    prefix=api_prefix,
)


# Career Readiness
app.include_router(
    readiness.router,
    prefix=api_prefix,
)


# ============================================================
# SKILLBRIDGE AI — GROQ LLM
# ============================================================

app.include_router(
    ai.router,
    prefix=api_prefix,
)


# ============================================================
# BASIC ROUTES
# ============================================================

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "SkillBridge AI API",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }