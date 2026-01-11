from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None

    # Model Configuration
    MODEL_NAME: str = "original"  # Options: original, unbiased, multilingual
    CACHE_DIR: str = "/root/.cache/huggingface"
    BATCH_SIZE: int = 8
    MAX_LENGTH: int = 512

    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Thresholds
    TOXICITY_THRESHOLD: float = 0.7
    SEVERE_TOXICITY_THRESHOLD: float = 0.8
    OBSCENE_THRESHOLD: float = 0.7
    THREAT_THRESHOLD: float = 0.75
    INSULT_THRESHOLD: float = 0.7
    IDENTITY_ATTACK_THRESHOLD: float = 0.7

    # Performance
    WORKERS: int = 4
    TIMEOUT: int = 300

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
