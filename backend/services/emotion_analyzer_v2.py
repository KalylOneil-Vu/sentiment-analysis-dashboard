"""
Enhanced Emotion Analysis Service using DeepFace

This service analyzes facial emotions with 7-emotion classification
and integrates with FastVLM keywords for comprehensive sentiment analysis.
"""
import cv2
import numpy as np
from typing import Dict, Optional, List
import logging
from deepface import DeepFace

logger = logging.getLogger(__name__)


class EmotionAnalyzer:
    """Analyzes facial emotions using DeepFace with 7-emotion classification."""

    def __init__(self):
        """Initialize the emotion analyzer."""
        self._is_loaded = False
        # DeepFace supports 7 emotions
        self.emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']

    def load(self):
        """Preload the emotion detection model."""
        if self._is_loaded:
            logger.info("DeepFace emotion analyzer already initialized")
            return

        try:
            logger.info("Initializing DeepFace emotion analyzer")
            # Trigger model download by analyzing a dummy image
            dummy = np.zeros((48, 48, 3), dtype=np.uint8)
            DeepFace.analyze(
                dummy,
                actions=['emotion'],
                enforce_detection=False,
                silent=True
            )
            self._is_loaded = True
            logger.info("DeepFace emotion analyzer initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize emotion analyzer: {str(e)}")
            raise

    def analyze_face(self, face_image: np.ndarray) -> Optional[Dict]:
        """Analyze emotions in a face image.

        Args:
            face_image: Cropped face image (BGR format)

        Returns:
            Dictionary containing emotion scores and dominant emotion,
            or None if analysis fails
        """
        if face_image is None or face_image.size == 0:
            return None

        try:
            # Ensure image is at least minimum size
            h, w = face_image.shape[:2]
            if h < 48 or w < 48:
                face_image = cv2.resize(face_image, (48, 48))

            # Analyze emotions with DeepFace
            result = DeepFace.analyze(
                face_image,
                actions=['emotion'],
                enforce_detection=False,
                silent=True
            )

            # DeepFace returns a list, get first result
            if isinstance(result, list):
                result = result[0]

            emotion_scores = result.get('emotion', {})
            dominant_emotion = result.get('dominant_emotion', 'neutral')

            # Calculate engagement score from emotions
            engagement_score = self._compute_engagement_from_emotions(emotion_scores)

            return {
                'emotion_scores': emotion_scores,
                'dominant_emotion': dominant_emotion,
                'engagement_score': engagement_score,
                'positive_score': self._compute_positive_score(emotion_scores),
            }

        except Exception as e:
            logger.debug(f"Error analyzing face emotions: {str(e)}")
            return None

    @staticmethod
    def _compute_positive_score(emotion_scores: Dict[str, float]) -> float:
        """Compute overall positive sentiment score from emotion distribution.

        Args:
            emotion_scores: Dictionary of emotion names to scores

        Returns:
            Positive score between 0 and 1
        """
        # Positive emotions: happy, surprise
        positive = emotion_scores.get('happy', 0) + emotion_scores.get('surprise', 0) * 0.5

        # Negative emotions: angry, disgust, fear, sad
        negative = (
            emotion_scores.get('angry', 0) +
            emotion_scores.get('disgust', 0) +
            emotion_scores.get('fear', 0) +
            emotion_scores.get('sad', 0)
        )

        # Neutral is neutral
        neutral = emotion_scores.get('neutral', 0)

        # Normalize to 0-1 range
        total = positive + negative + neutral
        if total == 0:
            return 0.5  # Default neutral

        return positive / total

    @staticmethod
    def _compute_engagement_from_emotions(emotion_scores: Dict[str, float]) -> float:
        """Compute engagement score from emotions.

        High engagement emotions: happy, surprise
        Medium engagement: neutral
        Low engagement: sad
        Negative but engaged: angry, disgust, fear

        Args:
            emotion_scores: Dictionary of emotion names to scores

        Returns:
            Engagement score between 0 and 1
        """
        # High positive engagement
        high_engagement = (
            emotion_scores.get('happy', 0) * 1.0 +
            emotion_scores.get('surprise', 0) * 0.9
        )

        # Medium engagement (neutral attention)
        medium_engagement = emotion_scores.get('neutral', 0) * 0.6

        # Negative but engaged (shows strong reaction)
        negative_engaged = (
            emotion_scores.get('angry', 0) * 0.5 +
            emotion_scores.get('disgust', 0) * 0.4 +
            emotion_scores.get('fear', 0) * 0.3
        )

        # Low engagement (disengaged/bored)
        low_engagement = emotion_scores.get('sad', 0) * 0.2

        # Combine scores
        total = high_engagement + medium_engagement + negative_engaged + low_engagement
        if total == 0:
            return 0.5

        # Weighted average
        engagement = (
            high_engagement +
            medium_engagement +
            negative_engaged * 0.6 +
            low_engagement * 0.3
        )

        return min(1.0, max(0.0, engagement / 100))  # Normalize

    @property
    def is_loaded(self) -> bool:
        """Check if analyzer is loaded."""
        return self._is_loaded


# Global instance
_analyzer_instance = None


def get_emotion_analyzer() -> EmotionAnalyzer:
    """Get or create the global emotion analyzer instance."""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = EmotionAnalyzer()
    return _analyzer_instance
