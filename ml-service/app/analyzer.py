from detoxify import Detoxify
from typing import Dict, List, Optional
from datetime import datetime
from loguru import logger

from app.config import settings


class DetoxifyAnalyzer:
    """
    Wrapper class for Detoxify model to analyze text for harmful content.

    Detoxify uses BERT-based models to detect:
    - Toxicity
    - Severe Toxicity
    - Obscene language
    - Threats
    - Insults
    - Identity-based attacks
    """

    def __init__(self):
        logger.info(f"Initializing Detoxify model: {settings.MODEL_NAME}")
        self.model = Detoxify(settings.MODEL_NAME)
        logger.info("Detoxify model loaded successfully")

        self.thresholds = {
            "toxicity": settings.TOXICITY_THRESHOLD,
            "severe_toxicity": settings.SEVERE_TOXICITY_THRESHOLD,
            "obscene": settings.OBSCENE_THRESHOLD,
            "threat": settings.THREAT_THRESHOLD,
            "insult": settings.INSULT_THRESHOLD,
            "identity_attack": settings.IDENTITY_ATTACK_THRESHOLD,
        }

    def analyze(
        self,
        text: str,
        user_id: Optional[str] = None,
        conversation_id: Optional[str] = None,
    ) -> Dict:
        """
        Analyze text for harmful content.

        Args:
            text: Text to analyze
            user_id: Optional user identifier
            conversation_id: Optional conversation identifier

        Returns:
            Dictionary containing scores, risk level, and exceeded categories
        """
        # Get predictions from Detoxify
        predictions = self.model.predict(text)

        # Normalize scores to 0-1 range and convert to float
        scores = {
            "toxicity": float(predictions.get("toxicity", 0)),
            "severe_toxicity": float(predictions.get("severe_toxicity", 0)),
            "obscene": float(predictions.get("obscene", 0)),
            "threat": float(predictions.get("threat", 0)),
            "insult": float(predictions.get("insult", 0)),
            "identity_attack": float(predictions.get("identity_attack", 0)),
        }

        # Determine which categories exceed thresholds
        categories_exceeded = self._get_exceeded_categories(scores)

        # Determine if content is harmful
        is_harmful = len(categories_exceeded) > 0

        # Calculate risk level
        risk_level = self._calculate_risk_level(scores, categories_exceeded)

        return {
            "text": text[:100] + "..." if len(text) > 100 else text,  # Truncate for response
            "scores": scores,
            "is_harmful": is_harmful,
            "risk_level": risk_level,
            "categories_exceeded": categories_exceeded,
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _get_exceeded_categories(self, scores: Dict[str, float]) -> List[str]:
        """Identify which categories exceed their thresholds."""
        exceeded = []

        for category, score in scores.items():
            if score >= self.thresholds.get(category, 0.7):
                exceeded.append(category)

        return exceeded

    def _calculate_risk_level(
        self,
        scores: Dict[str, float],
        categories_exceeded: List[str],
    ) -> str:
        """
        Calculate overall risk level based on scores.

        Risk levels:
        - critical: Severe toxicity > 0.8 or threat > 0.8
        - high: Multiple categories exceeded or any score > 0.75
        - medium: 1-2 categories exceeded
        - low: No categories exceeded
        """
        if not categories_exceeded:
            return "low"

        # Critical: Very high severe toxicity or threats
        if scores["severe_toxicity"] > 0.8 or scores["threat"] > 0.8:
            return "critical"

        # High: Multiple categories or very high individual scores
        if len(categories_exceeded) >= 3:
            return "high"

        max_score = max(scores.values())
        if max_score > 0.85:
            return "high"

        # Medium: Some concerning content
        if len(categories_exceeded) >= 1 or max_score > 0.7:
            return "medium"

        return "low"

    def update_thresholds(self, new_thresholds: Dict[str, float]):
        """Update detection thresholds."""
        self.thresholds.update(new_thresholds)
        logger.info(f"Thresholds updated: {self.thresholds}")
