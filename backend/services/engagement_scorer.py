"""Engagement scoring service that combines all analysis modalities."""
from typing import Dict, List, Optional
import logging
from dataclasses import dataclass, field
from datetime import datetime

from config import settings

logger = logging.getLogger(__name__)


@dataclass
class PersonEngagement:
    """Engagement data for a single person."""
    track_id: int
    timestamp: datetime = field(default_factory=datetime.now)

    # Component scores (0-1 range)
    emotion_score: float = 0.5
    body_language_score: float = 0.5
    gaze_score: float = 0.5
    micro_expression_score: float = 0.5
    movement_score: float = 0.5
    speech_score: float = 0.5

    # Overall engagement score
    overall_score: float = 0.5

    # Raw data
    dominant_emotion: Optional[str] = None
    emotion_scores: Optional[Dict] = None
    posture: Optional[str] = None
    arms_crossed: bool = False
    arms_raised: bool = False
    is_speaking: bool = False
    speech_sentiment: Optional[float] = None

    # Detection confidence
    bbox: Optional[Dict] = None
    detection_confidence: float = 1.0

    def to_dict(self) -> dict:
        """Convert to dictionary representation."""
        return {
            "track_id": self.track_id,
            "timestamp": self.timestamp.isoformat(),
            "overall_score": round(self.overall_score, 3),
            "component_scores": {
                "emotion": round(self.emotion_score, 3),
                "body_language": round(self.body_language_score, 3),
                "gaze": round(self.gaze_score, 3),
                "micro_expression": round(self.micro_expression_score, 3),
                "movement": round(self.movement_score, 3),
                "speech": round(self.speech_score, 3)
            },
            "details": {
                "dominant_emotion": self.dominant_emotion,
                "posture": self.posture,
                "arms_crossed": self.arms_crossed,
                "arms_raised": self.arms_raised,
                "is_speaking": self.is_speaking
            },
            "bbox": self.bbox,
            "confidence": round(self.detection_confidence, 3)
        }


@dataclass
class RoomEngagement:
    """Aggregated engagement metrics for the entire room."""
    timestamp: datetime = field(default_factory=datetime.now)
    overall_score: float = 0.5
    total_participants: int = 0
    active_participants: int = 0

    # Distribution
    highly_engaged_count: int = 0
    neutral_count: int = 0
    disengaged_count: int = 0

    # Averages
    avg_emotion_score: float = 0.5
    avg_body_language_score: float = 0.5
    avg_speech_score: float = 0.5

    # Participation
    speaking_count: int = 0
    participation_rate: float = 0.0

    # Individual person data
    persons: List[PersonEngagement] = field(default_factory=list)

    def to_dict(self) -> dict:
        """Convert to dictionary representation."""
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
                    "highly_engaged": round(self.highly_engaged_count / max(1, self.total_participants) * 100, 1),
                    "neutral": round(self.neutral_count / max(1, self.total_participants) * 100, 1),
                    "disengaged": round(self.disengaged_count / max(1, self.total_participants) * 100, 1)
                }
            },
            "averages": {
                "emotion": round(self.avg_emotion_score, 3),
                "body_language": round(self.avg_body_language_score, 3),
                "speech": round(self.avg_speech_score, 3)
            },
            "participation": {
                "speaking_count": self.speaking_count,
                "participation_rate": round(self.participation_rate, 3)
            },
            "persons": [person.to_dict() for person in self.persons]
        }


class EngagementScorer:
    """Scores engagement by combining multiple analysis modalities."""

    def __init__(self):
        """Initialize the engagement scorer."""
        # Get weights from config: emotion, body, gaze, micro, movement, speech
        self.weights = settings.score_weights
        logger.info(f"Initialized engagement scorer with weights: {self.weights}")

    def score_person(
        self,
        track_id: int,
        emotion_data: Optional[Dict] = None,
        pose_data: Optional[Dict] = None,
        gaze_data: Optional[Dict] = None,
        speech_data: Optional[Dict] = None,
        bbox: Optional[Dict] = None
    ) -> PersonEngagement:
        """Calculate engagement score for a single person.

        Args:
            track_id: Person's tracking ID
            emotion_data: Facial emotion analysis results
            pose_data: Body pose analysis results
            gaze_data: Gaze direction analysis results
            speech_data: Speech and sentiment data
            bbox: Person's bounding box

        Returns:
            PersonEngagement object with calculated scores
        """
        person = PersonEngagement(track_id=track_id, bbox=bbox)

        # Score emotion component (30%)
        if emotion_data:
            person.emotion_score = emotion_data.get('engagement_indicator', 0.5)
            person.dominant_emotion = emotion_data.get('dominant_emotion')
            person.emotion_scores = emotion_data.get('emotion_scores')

        # Score body language component (25%)
        if pose_data:
            pose_analysis = pose_data.get('pose_analysis', {})
            person.body_language_score = pose_analysis.get('engagement_score', 0.5)
            person.posture = pose_analysis.get('posture')
            person.arms_crossed = pose_analysis.get('arms_crossed', False)
            person.arms_raised = pose_analysis.get('arms_raised', False)

        # Score gaze direction component (15%)
        if gaze_data:
            person.gaze_score = gaze_data.get('engagement_score', 0.5)

        # Score micro-expressions component (10%)
        # TODO: Implement micro-expression detection
        person.micro_expression_score = 0.5

        # Score movement component (10%)
        # TODO: Implement movement/fidgeting detection
        person.movement_score = 0.5

        # Score speech participation component (10%)
        if speech_data:
            person.is_speaking = speech_data.get('is_speaking', False)
            person.speech_sentiment = speech_data.get('sentiment', 0.5)
            # Speaking with positive sentiment boosts score
            if person.is_speaking:
                person.speech_score = 0.5 + (person.speech_sentiment * 0.5)
            else:
                person.speech_score = 0.3  # Not speaking = lower engagement

        # Calculate weighted overall score
        person.overall_score = self._calculate_weighted_score(
            person.emotion_score,
            person.body_language_score,
            person.gaze_score,
            person.micro_expression_score,
            person.movement_score,
            person.speech_score
        )

        return person

    def _calculate_weighted_score(
        self,
        emotion: float,
        body: float,
        gaze: float,
        micro: float,
        movement: float,
        speech: float
    ) -> float:
        """Calculate weighted engagement score.

        Args:
            emotion: Emotion score (0-1)
            body: Body language score (0-1)
            gaze: Gaze direction score (0-1)
            micro: Micro-expression score (0-1)
            movement: Movement score (0-1)
            speech: Speech participation score (0-1)

        Returns:
            Weighted overall score (0-1)
        """
        scores = [emotion, body, gaze, micro, movement, speech]
        weighted_sum = sum(score * weight for score, weight in zip(scores, self.weights))

        # Clamp to [0, 1]
        return max(0.0, min(1.0, weighted_sum))

    def aggregate_room_engagement(
        self,
        persons: List[PersonEngagement]
    ) -> RoomEngagement:
        """Aggregate individual engagement scores into room-level metrics.

        Args:
            persons: List of PersonEngagement objects

        Returns:
            RoomEngagement object with aggregated metrics
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

        # Active participants (recently detected with high confidence)
        room.active_participants = sum(
            1 for p in persons if p.detection_confidence > 0.5
        )

        # Calculate component averages
        room.avg_emotion_score = sum(p.emotion_score for p in persons) / room.total_participants
        room.avg_body_language_score = sum(p.body_language_score for p in persons) / room.total_participants
        room.avg_speech_score = sum(p.speech_score for p in persons) / room.total_participants

        # Participation metrics
        room.speaking_count = sum(1 for p in persons if p.is_speaking)
        room.participation_rate = room.speaking_count / room.total_participants if room.total_participants > 0 else 0.0

        return room


# Global instance
_scorer_instance = None


def get_engagement_scorer() -> EngagementScorer:
    """Get or create the global engagement scorer instance."""
    global _scorer_instance
    if _scorer_instance is None:
        _scorer_instance = EngagementScorer()
    return _scorer_instance
