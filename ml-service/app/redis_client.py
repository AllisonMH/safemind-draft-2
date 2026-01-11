import redis
from loguru import logger
from app.config import settings


class RedisClient:
    """Redis client for caching analysis results."""

    def __init__(self):
        self.client = None
        self._connect()

    def _connect(self):
        """Establish connection to Redis."""
        try:
            self.client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                password=settings.REDIS_PASSWORD,
                decode_responses=True,
            )
            self.client.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. Continuing without cache.")
            self.client = None

    def get(self, key: str):
        """Get value from Redis."""
        if not self.client:
            return None

        try:
            return self.client.get(key)
        except Exception as e:
            logger.error(f"Redis GET error: {e}")
            return None

    def set(self, key: str, value: str, expiry: int = 3600):
        """Set value in Redis with expiry."""
        if not self.client:
            return False

        try:
            self.client.setex(key, expiry, value)
            return True
        except Exception as e:
            logger.error(f"Redis SET error: {e}")
            return False

    def delete(self, key: str):
        """Delete key from Redis."""
        if not self.client:
            return False

        try:
            self.client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Redis DELETE error: {e}")
            return False


# Global Redis client instance
redis_client = RedisClient()
