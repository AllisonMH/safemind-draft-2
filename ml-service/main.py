from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uvicorn
from loguru import logger
import sys

from app.analyzer import DetoxifyAnalyzer
from app.config import settings

# Configure logger
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
    level=settings.LOG_LEVEL,
)

app = FastAPI(
    title="SafeMind ML Service",
    description="Machine Learning service for harmful language detection using Detoxify",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Detoxify analyzer
analyzer = DetoxifyAnalyzer()


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Text to analyze")
    user_id: Optional[str] = Field(None, description="Optional user ID")
    conversation_id: Optional[str] = Field(None, description="Optional conversation ID")


class AnalyzeResponse(BaseModel):
    text: str
    scores: dict
    is_harmful: bool
    risk_level: str
    categories_exceeded: list
    timestamp: str


@app.on_event("startup")
async def startup_event():
    logger.info("Starting SafeMind ML Service")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Model: {settings.MODEL_NAME}")

    # Warm up the model
    try:
        analyzer.analyze("test")
        logger.info("Model warmed up successfully")
    except Exception as e:
        logger.error(f"Failed to warm up model: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down SafeMind ML Service")


@app.get("/")
async def root():
    return {
        "service": "SafeMind ML Service",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model": settings.MODEL_NAME,
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/api/v1/health")
async def api_health_check():
    return await health_check()


@app.post("/api/v1/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    """
    Analyze text for harmful content using Detoxify model.

    Returns toxicity scores for multiple categories and determines
    if the content is harmful and at what risk level.
    """
    try:
        logger.info(f"Analyzing text (length: {len(request.text)})")

        result = analyzer.analyze(
            text=request.text,
            user_id=request.user_id,
            conversation_id=request.conversation_id,
        )

        logger.info(
            f"Analysis complete - Risk: {result['risk_level']}, "
            f"Harmful: {result['is_harmful']}"
        )

        return AnalyzeResponse(**result)

    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.get("/api/v1/thresholds")
async def get_thresholds():
    """Get current detection thresholds."""
    return {
        "toxicity": settings.TOXICITY_THRESHOLD,
        "severe_toxicity": settings.SEVERE_TOXICITY_THRESHOLD,
        "obscene": settings.OBSCENE_THRESHOLD,
        "threat": settings.THREAT_THRESHOLD,
        "insult": settings.INSULT_THRESHOLD,
        "identity_attack": settings.IDENTITY_ATTACK_THRESHOLD,
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
        workers=settings.WORKERS if settings.ENVIRONMENT == "production" else 1,
    )
