from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .config import settings
from .database import engine, Base, SessionLocal
from .models.user import User
from .services.auth_service import hash_password
from .services.ml_engine import ml_engine
from .services.data_pipeline import clean_and_process_pipeline, PROCESSED_DATA_PATH
import os

from .routers import (
    auth,
    dashboard,
    stations,
    forecast,
    simulator,
    scenarios,
    optimizer,
    fleet,
    copilot,
    carbon,
    reports
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smartcharge")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)

    # Seed demo user
    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.username == "operator").first()
        if not existing_user:
            demo_user = User(
                username="operator",
                email="operator@smartcharge.ai",
                hashed_password=hash_password("operator123"),
                full_name="Chief Grid Operator",
                role="Grid Operator"
            )
            db.add(demo_user)
            db.commit()
            logger.info("Default demo operator created: operator / operator123")
    finally:
        db.close()

    # Verify or generate dataset and train ML models
    if not os.path.exists(PROCESSED_DATA_PATH):
        logger.info("Generating real-world EV charging dataset and feature matrix...")
        clean_and_process_pipeline()

    if not ml_engine.is_trained:
        logger.info("Pre-training ML forecasting models...")
        ml_engine.train_models()

    logger.info("SmartCharge AI backend successfully initialized and ready!")
    yield
    logger.info("Shutting down SmartCharge AI backend...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Intelligent EV Charging Demand Forecasting & Capacity Optimization Platform API",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Mount all routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(stations.router, prefix=settings.API_PREFIX)
app.include_router(forecast.router, prefix=settings.API_PREFIX)
app.include_router(simulator.router, prefix=settings.API_PREFIX)
app.include_router(scenarios.router, prefix=settings.API_PREFIX)
app.include_router(optimizer.router, prefix=settings.API_PREFIX)
app.include_router(fleet.router, prefix=settings.API_PREFIX)
app.include_router(copilot.router, prefix=settings.API_PREFIX)
app.include_router(carbon.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs_url": "/docs",
        "timestamp": "2026-11-09T14:47:00Z"
    }

# Mount frontend production build if available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
