"""Main video processing pipeline that coordinates all analysis services."""
import cv2
import numpy as np
from typing import Dict, List, Optional
import logging
import base64
from datetime import datetime

from services.person_detector import get_person_detector, BoundingBox
from services.person_tracker import get_person_tracker, TrackedPerson
from services.emotion_analyzer import get_emotion_analyzer
from services.pose_estimator import get_pose_estimator
from services.engagement_scorer import get_engagement_scorer, PersonEngagement, RoomEngagement
from config import settings

logger = logging.getLogger(__name__)


class VideoProcessor:
    """Coordinates video frame processing through the analysis pipeline."""

    def __init__(self):
        """Initialize the video processor."""
        self.person_detector = get_person_detector()
        self.person_tracker = get_person_tracker()
        self.emotion_analyzer = get_emotion_analyzer()
        self.pose_estimator = get_pose_estimator()
        self.engagement_scorer = get_engagement_scorer()

        self._is_initialized = False
        self.frame_count = 0

    def initialize(self):
        """Initialize all ML models."""
        if self._is_initialized:
            logger.info("Video processor already initialized")
            return

        logger.info("Initializing video processor...")

        try:
            # Load all models
            if settings.enable_face_detection:
                self.person_detector.load()

            if settings.enable_emotion_recognition:
                self.emotion_analyzer.load()

            if settings.enable_pose_estimation:
                self.pose_estimator.load()

            self._is_initialized = True
            logger.info("Video processor initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize video processor: {str(e)}")
            raise

    def process_frame(
        self,
        frame: np.ndarray,
        speech_data: Optional[Dict[int, Dict]] = None
    ) -> RoomEngagement:
        """Process a single video frame through the analysis pipeline.

        Args:
            frame: Input frame (BGR format)
            speech_data: Optional dict mapping track_id to speech analysis data

        Returns:
            RoomEngagement object with aggregated metrics
        """
        if not self._is_initialized:
            raise RuntimeError("Video processor not initialized. Call initialize() first.")

        self.frame_count += 1
        logger.debug(f"Processing frame {self.frame_count}")

        try:
            # Step 1: Detect persons in frame
            detections = self._detect_persons(frame)

            # Step 2: Track persons across frames
            tracked_persons = self._track_persons(detections)

            # Step 3: Analyze each tracked person
            person_engagements = []

            for tracked_person in tracked_persons:
                if tracked_person.frames_since_update > 0:
                    # Skip persons not detected in current frame
                    continue

                person_engagement = self._analyze_person(
                    frame,
                    tracked_person,
                    speech_data.get(tracked_person.track_id) if speech_data else None
                )
                person_engagements.append(person_engagement)

            # Step 4: Aggregate room-level metrics
            room_engagement = self.engagement_scorer.aggregate_room_engagement(person_engagements)

            logger.debug(
                f"Processed {len(person_engagements)} persons. "
                f"Room score: {room_engagement.overall_score:.2f}"
            )

            return room_engagement

        except Exception as e:
            logger.error(f"Error processing frame: {str(e)}")
            # Return empty engagement data on error
            return RoomEngagement()

    def _detect_persons(self, frame: np.ndarray) -> List[BoundingBox]:
        """Detect persons in frame.

        Args:
            frame: Input frame

        Returns:
            List of person detections
        """
        if not settings.enable_face_detection:
            return []

        try:
            return self.person_detector.detect(frame)
        except Exception as e:
            logger.error(f"Person detection failed: {str(e)}")
            return []

    def _track_persons(self, detections: List[BoundingBox]) -> List[TrackedPerson]:
        """Track persons across frames.

        Args:
            detections: Person detections from current frame

        Returns:
            List of tracked persons
        """
        try:
            return self.person_tracker.update(detections)
        except Exception as e:
            logger.error(f"Person tracking failed: {str(e)}")
            return []

    def _analyze_person(
        self,
        frame: np.ndarray,
        tracked_person: TrackedPerson,
        speech_data: Optional[Dict] = None
    ) -> PersonEngagement:
        """Analyze a single tracked person.

        Args:
            frame: Full frame image
            tracked_person: Tracked person object
            speech_data: Optional speech analysis data for this person

        Returns:
            PersonEngagement object with calculated scores
        """
        bbox = tracked_person.bbox
        person_bbox = (bbox.x1, bbox.y1, bbox.x2, bbox.y2)

        # Extract person region
        person_img = frame[bbox.y1:bbox.y2, bbox.x1:bbox.x2]

        # Analyze emotions
        emotion_data = None
        if settings.enable_emotion_recognition and person_img.size > 0:
            try:
                emotion_data = self.emotion_analyzer.analyze_face(person_img)
            except Exception as e:
                logger.debug(f"Emotion analysis failed for person {tracked_person.track_id}: {str(e)}")

        # Analyze pose
        pose_data = None
        if settings.enable_pose_estimation:
            try:
                pose_data = self.pose_estimator.estimate_pose(frame, person_bbox)
            except Exception as e:
                logger.debug(f"Pose estimation failed for person {tracked_person.track_id}: {str(e)}")

        # Gaze analysis - TODO: Implement gaze detection
        gaze_data = None

        # Calculate engagement score
        person_engagement = self.engagement_scorer.score_person(
            track_id=tracked_person.track_id,
            emotion_data=emotion_data,
            pose_data=pose_data,
            gaze_data=gaze_data,
            speech_data=speech_data,
            bbox=bbox.to_dict()
        )

        person_engagement.detection_confidence = bbox.confidence

        return person_engagement

    def process_frame_from_base64(
        self,
        base64_image: str,
        speech_data: Optional[Dict[int, Dict]] = None
    ) -> RoomEngagement:
        """Process a frame received as base64 encoded image.

        Args:
            base64_image: Base64 encoded image string
            speech_data: Optional speech analysis data

        Returns:
            RoomEngagement object
        """
        try:
            # Decode base64 to numpy array
            img_data = base64.b64decode(base64_image.split(',')[1] if ',' in base64_image else base64_image)
            nparr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                logger.error("Failed to decode frame from base64")
                return RoomEngagement()

            return self.process_frame(frame, speech_data)

        except Exception as e:
            logger.error(f"Error processing base64 frame: {str(e)}")
            return RoomEngagement()

    def draw_annotations(
        self,
        frame: np.ndarray,
        room_engagement: RoomEngagement
    ) -> np.ndarray:
        """Draw annotations on frame for visualization.

        Args:
            frame: Input frame
            room_engagement: Room engagement data

        Returns:
            Annotated frame
        """
        annotated_frame = frame.copy()

        # Draw bounding boxes and scores for each person
        for person in room_engagement.persons:
            if not person.bbox:
                continue

            bbox = person.bbox
            x1, y1, x2, y2 = bbox['x1'], bbox['y1'], bbox['x2'], bbox['y2']

            # Choose color based on engagement level
            if person.overall_score >= 0.7:
                color = (0, 255, 0)  # Green - engaged
            elif person.overall_score >= 0.4:
                color = (0, 255, 255)  # Yellow - neutral
            else:
                color = (0, 0, 255)  # Red - disengaged

            # Draw bounding box
            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)

            # Draw label
            label = f"Person {person.track_id}: {person.overall_score:.2f}"
            if person.dominant_emotion:
                label += f" ({person.dominant_emotion})"

            cv2.putText(
                annotated_frame,
                label,
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                color,
                2
            )

            # Draw indicators
            indicators = []
            if person.arms_crossed:
                indicators.append("Arms X")
            if person.arms_raised:
                indicators.append("Raised")
            if person.is_speaking:
                indicators.append("Speaking")

            if indicators:
                indicator_text = ", ".join(indicators)
                cv2.putText(
                    annotated_frame,
                    indicator_text,
                    (x1, y2 + 20),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.4,
                    color,
                    1
                )

        # Draw overall room stats
        stats_text = f"Room: {room_engagement.overall_score:.2f} | Participants: {room_engagement.total_participants}"
        cv2.putText(
            annotated_frame,
            stats_text,
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (255, 255, 255),
            2
        )

        return annotated_frame

    def reset(self):
        """Reset the processor state."""
        self.person_tracker.reset()
        self.frame_count = 0
        logger.info("Video processor reset")

    @property
    def is_initialized(self) -> bool:
        """Check if processor is initialized."""
        return self._is_initialized


# Global instance
_processor_instance = None


def get_video_processor() -> VideoProcessor:
    """Get or create the global video processor instance."""
    global _processor_instance
    if _processor_instance is None:
        _processor_instance = VideoProcessor()
    return _processor_instance
