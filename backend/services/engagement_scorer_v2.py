"""
Enhanced Engagement Scoring Service

Combines FastVLM keywords, DeepFace emotions, and speech analysis
into comprehensive engagement metrics.
"""
from typing import Dict, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class PersonEngagement:
    """Engagement data for a single person."""

    def __init__(self, track_id: int):
        """Initialize person engagement tracker.

        Args:
            track_id: Unique identifier for this person
        """
        self.track_id = track_id
        self.timestamp = datetime.now()

        # Component scores (0-1 range)
        self.fastvlm_score = 0.5  # Contextual understanding (35% weight)
        self.emotion_score = 0.5   # DeepFace emotions (25% weight)
        self.body_language_score = 0.5  # From FastVLM keywords (15% weight)
        self.speech_score = 0.5    # Speech sentiment (15% weight)
        self.participation_score = 0.5  # Speaking rate (10% weight)

        # Overall engagement score
        self.overall_score = 0.5

        # Raw data
        self.vlm_text = ""
        self.vlm_keywords = []
        self.dominant_emotion = None
        self.emotion_scores = None
        self.is_speaking = False
        self.speech_text = None
        self.speech_sentiment = None

        # Detection info
        self.bbox = None
        self.confidence = 1.0

    def calculate_overall(self, weights: Optional[Dict[str, float]] = None):
        """Calculate overall engagement score from components.

        Args:
            weights: Custom weights dict, or None to use defaults
        """
        if weights is None:
            # Optimized weights - FastVLM is primary source
            weights = {
                'fastvlm': 0.50,       # Primary: contextual understanding
                'emotion': 0.20,        # From FastVLM keywords
                'body_language': 0.20,  # From FastVLM keywords
                'speech': 0.05,         # Reduced (often unused)
                'participation': 0.05   # Reduced
            }

        self.overall_score = (
            self.fastvlm_score * weights['fastvlm'] +
            self.emotion_score * weights['emotion'] +
            self.body_language_score * weights['body_language'] +
            self.speech_score * weights['speech'] +
            self.participation_score * weights['participation']
        )

        # Clamp to [0, 1]
        self.overall_score = max(0.0, min(1.0, self.overall_score))

    def to_dict(self) -> dict:
        """Convert to dictionary representation."""
        return {
            "track_id": self.track_id,
            "timestamp": self.timestamp.isoformat(),
            "overall_score": round(self.overall_score, 3),
            "component_scores": {
                "fastvlm": round(self.fastvlm_score, 3),
                "emotion": round(self.emotion_score, 3),
                "body_language": round(self.body_language_score, 3),
                "speech": round(self.speech_score, 3),
                "participation": round(self.participation_score, 3)
            },
            "details": {
                "vlm_text": self.vlm_text,
                "vlm_keywords": self.vlm_keywords,
                "dominant_emotion": self.dominant_emotion,
                "is_speaking": self.is_speaking,
                "speech_text": self.speech_text,
                "speech_sentiment": self.speech_sentiment
            },
            "bbox": self.bbox,
            "confidence": round(self.confidence, 3)
        }


class RoomEngagement:
    """Aggregated engagement metrics for the entire room."""

    def __init__(self):
        """Initialize room engagement tracker."""
        self.timestamp = datetime.now()
        self.overall_score = 0.5
        self.total_participants = 0
        self.active_participants = 0

        # Distribution
        self.highly_engaged_count = 0
        self.neutral_count = 0
        self.disengaged_count = 0

        # Component averages
        self.avg_fastvlm_score = 0.5
        self.avg_emotion_score = 0.5
        self.avg_speech_score = 0.5

        # Participation
        self.speaking_count = 0
        self.participation_rate = 0.0

        # Individual data
        self.persons: List[PersonEngagement] = []

    def to_dict(self) -> dict:
        """Convert to dictionary representation."""
        total = max(1, self.total_participants)  # Avoid division by zero

        return {
            "timestamp": self.timestamp.isoformat(),
            "overall_score": round(self.overall_score, 3),
            "total_participants": self.total_participants,
            "active_participants": self.active_participants,
            "distribution": {
                "highly_engaged": self.highly_engaged_count,
                "neutral": self.neutral_count,
                "disengaged": self.disengaged_count,
                "percentages": {
                    "highly_engaged": round(self.highly_engaged_count / total * 100, 1),
                    "neutral": round(self.neutral_count / total * 100, 1),
                    "disengaged": round(self.disengaged_count / total * 100, 1)
                }
            },
            "averages": {
                "fastvlm": round(self.avg_fastvlm_score, 3),
                "emotion": round(self.avg_emotion_score, 3),
                "speech": round(self.avg_speech_score, 3)
            },
            "participation": {
                "speaking_count": self.speaking_count,
                "participation_rate": round(self.participation_rate, 3)
            },
            "persons": [person.to_dict() for person in self.persons]
        }


class EngagementScorer:
    """Scores engagement by combining FastVLM, DeepFace, and speech analysis."""

    def __init__(self):
        """Initialize the engagement scorer."""
        # Component weights
        self.weights = {
            'fastvlm': 0.35,        # FastVLM contextual analysis
            'emotion': 0.25,         # DeepFace emotions
            'body_language': 0.15,   # Body language from FastVLM
            'speech': 0.15,          # Speech sentiment
            'participation': 0.10    # Speaking rate
        }
        logger.info(f"Initialized engagement scorer with weights: {self.weights}")

    def score_person(
        self,
        track_id: int,
        fastvlm_data: Optional[Dict] = None,
        emotion_data: Optional[Dict] = None,
        speech_data: Optional[Dict] = None,
        bbox: Optional[Dict] = None
    ) -> PersonEngagement:
        """Calculate engagement score for a single person.

        Args:
            track_id: Person's tracking ID
            fastvlm_data: FastVLM keyword parsing results
            emotion_data: DeepFace emotion analysis results
            speech_data: Speech transcription and sentiment
            bbox: Person's bounding box

        Returns:
            PersonEngagement object with calculated scores
        """
        person = PersonEngagement(track_id)
        person.bbox = bbox

        # Process FastVLM data (35% weight)
        if fastvlm_data:
            person.fastvlm_score = fastvlm_data.get('contextual_score', 0.5)
            person.vlm_text = fastvlm_data.get('vlm_text', '')

            # Extract keywords for display
            keywords = fastvlm_data.get('keywords', {})
            person.vlm_keywords = (
                keywords.get('positive', []) +
                keywords.get('neutral', []) +
                keywords.get('negative', [])
            )

            # Body language score from FastVLM keywords (15% weight)
            body_lang = fastvlm_data.get('body_language', {})
            if body_lang.get('open_posture'):
                person.body_language_score = 0.75
            elif body_lang.get('closed_posture'):
                person.body_language_score = 0.35
            else:
                person.body_language_score = 0.5

        # Process emotion data (25% weight)
        if emotion_data:
            person.emotion_score = emotion_data.get('engagement_score', 0.5)
            person.dominant_emotion = emotion_data.get('dominant_emotion')
            person.emotion_scores = emotion_data.get('emotion_scores')

        # Process speech data (15% + 10% weight)
        if speech_data:
            person.is_speaking = True
            person.speech_text = speech_data.get('text')
            person.speech_sentiment = speech_data.get('sentiment')

            # Speech sentiment score (15% weight)
            person.speech_score = speech_data.get('engagement_score', 0.5)

            # Participation score (10% weight)
            person.participation_score = 0.8  # Speaking = high participation
        else:
            # Not speaking
            person.is_speaking = False
            person.participation_score = 0.3  # Low participation

        # Calculate weighted overall score
        person.calculate_overall(self.weights)

        return person

    def aggregate_room(self, persons: List[PersonEngagement]) -> RoomEngagement:
        """Aggregate individual scores into room-level metrics.

        Args:
            persons: List of PersonEngagement objects

        Returns:
            RoomEngagement object with aggregated data
        """
        room = RoomEngagement()
        room.persons = persons
        room.total_participants = len(persons)

        if room.total_participants == 0:
            return room

        # Calculate overall room score (average)
        room.overall_score = sum(p.overall_score for p in persons) / room.total_participants

        # Count engagement distribution
        for person in persons:
            if person.overall_score >= 0.7:
                room.highly_engaged_count += 1
            elif person.overall_score >= 0.4:
                room.neutral_count += 1
            else:
                room.disengaged_count += 1

        # Active participants (high confidence detections)
        room.active_participants = sum(1 for p in persons if p.confidence > 0.5)

        # Calculate component averages
        room.avg_fastvlm_score = sum(p.fastvlm_score for p in persons) / room.total_participants
        room.avg_emotion_score = sum(p.emotion_score for p in persons) / room.total_participants
        room.avg_speech_score = sum(p.speech_score for p in persons) / room.total_participants

        # Participation metrics
        room.speaking_count = sum(1 for p in persons if p.is_speaking)
        room.participation_rate = room.speaking_count / room.total_participants

        return room


# Global instance
_scorer_instance = None


def get_engagement_scorer() -> EngagementScorer:
    """Get or create the global engagement scorer instance."""
    global _scorer_instance
    if _scorer_instance is None:
        _scorer_instance = EngagementScorer()
    return _scorer_instance
