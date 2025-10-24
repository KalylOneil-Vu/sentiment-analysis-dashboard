"""Pose estimation service using MediaPipe."""
import cv2
import numpy as np
from typing import Dict, Optional, List, Tuple
import logging
import mediapipe as mp

logger = logging.getLogger(__name__)


class PoseEstimator:
    """Estimates body pose using MediaPipe."""

    def __init__(self):
        """Initialize the pose estimator."""
        self.mp_pose = mp.solutions.pose
        self.pose = None
        self._is_loaded = False

    def load(self):
        """Load the MediaPipe pose model."""
        if self._is_loaded:
            logger.info("Pose estimator already loaded")
            return

        try:
            logger.info("Loading MediaPipe pose estimator")
            self.pose = self.mp_pose.Pose(
                static_image_mode=False,
                model_complexity=1,
                smooth_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            self._is_loaded = True
            logger.info("Pose estimator loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load pose estimator: {str(e)}")
            raise

    def estimate_pose(self, frame: np.ndarray, person_bbox: Optional[Tuple[int, int, int, int]] = None) -> Optional[Dict]:
        """Estimate pose landmarks for a person.

        Args:
            frame: Input image (BGR format)
            person_bbox: Optional (x1, y1, x2, y2) to crop to person region

        Returns:
            Dictionary containing pose landmarks and analysis, or None if pose not detected
        """
        if not self._is_loaded:
            raise RuntimeError("Model not loaded. Call load() first.")

        try:
            # Crop to person region if bbox provided
            if person_bbox:
                x1, y1, x2, y2 = person_bbox
                person_img = frame[y1:y2, x1:x2]
                offset_x, offset_y = x1, y1
            else:
                person_img = frame
                offset_x, offset_y = 0, 0

            # Convert BGR to RGB for MediaPipe
            rgb_img = cv2.cvtColor(person_img, cv2.COLOR_BGR2RGB)

            # Process the image
            results = self.pose.process(rgb_img)

            if not results.pose_landmarks:
                return None

            # Extract landmark coordinates
            h, w = person_img.shape[:2]
            landmarks = []

            for landmark in results.pose_landmarks.landmark:
                landmarks.append({
                    'x': landmark.x * w + offset_x,
                    'y': landmark.y * h + offset_y,
                    'z': landmark.z,
                    'visibility': landmark.visibility
                })

            # Analyze pose for engagement signals
            pose_analysis = self._analyze_pose(landmarks)

            return {
                'landmarks': landmarks,
                'pose_analysis': pose_analysis,
                'bbox': person_bbox
            }

        except Exception as e:
            logger.debug(f"Error estimating pose: {str(e)}")
            return None

    def _analyze_pose(self, landmarks: List[Dict]) -> Dict:
        """Analyze pose landmarks for engagement indicators.

        Args:
            landmarks: List of pose landmarks

        Returns:
            Dictionary with pose analysis results
        """
        # MediaPipe pose landmark indices
        LEFT_SHOULDER = 11
        RIGHT_SHOULDER = 12
        LEFT_ELBOW = 13
        RIGHT_ELBOW = 14
        LEFT_WRIST = 15
        RIGHT_WRIST = 16
        NOSE = 0

        try:
            # Check if arms are crossed
            arms_crossed = self._check_arms_crossed(
                landmarks[LEFT_SHOULDER],
                landmarks[RIGHT_SHOULDER],
                landmarks[LEFT_WRIST],
                landmarks[RIGHT_WRIST]
            )

            # Check posture (leaning forward/backward)
            posture = self._check_posture(
                landmarks[NOSE],
                landmarks[LEFT_SHOULDER],
                landmarks[RIGHT_SHOULDER]
            )

            # Check arm position (raised arms might indicate engagement/questions)
            arms_raised = self._check_arms_raised(
                landmarks[LEFT_SHOULDER],
                landmarks[RIGHT_SHOULDER],
                landmarks[LEFT_WRIST],
                landmarks[RIGHT_WRIST]
            )

            # Compute engagement score from pose
            engagement_score = self._compute_pose_engagement(
                arms_crossed, posture, arms_raised
            )

            return {
                'arms_crossed': arms_crossed,
                'posture': posture,  # 'forward', 'neutral', 'backward'
                'arms_raised': arms_raised,
                'engagement_score': engagement_score
            }

        except Exception as e:
            logger.debug(f"Error analyzing pose: {str(e)}")
            return {
                'arms_crossed': False,
                'posture': 'neutral',
                'arms_raised': False,
                'engagement_score': 0.5
            }

    @staticmethod
    def _check_arms_crossed(left_shoulder: Dict, right_shoulder: Dict,
                           left_wrist: Dict, right_wrist: Dict) -> bool:
        """Check if arms appear to be crossed."""
        # Simple heuristic: wrists are closer to opposite shoulder
        left_wrist_x = left_wrist['x']
        right_wrist_x = right_wrist['x']
        left_shoulder_x = left_shoulder['x']
        right_shoulder_x = right_shoulder['x']

        # Check if wrists crossed the body midline
        midline = (left_shoulder_x + right_shoulder_x) / 2

        left_crossed = left_wrist_x > midline
        right_crossed = right_wrist_x < midline

        return left_crossed and right_crossed

    @staticmethod
    def _check_posture(nose: Dict, left_shoulder: Dict, right_shoulder: Dict) -> str:
        """Determine if person is leaning forward, backward, or neutral."""
        # Calculate shoulder midpoint
        shoulder_mid_x = (left_shoulder['x'] + right_shoulder['x']) / 2
        shoulder_mid_y = (left_shoulder['y'] + right_shoulder['y']) / 2

        # Calculate vertical distance from nose to shoulders
        vertical_diff = nose['y'] - shoulder_mid_y

        # Use z-coordinate if available (depth)
        nose_z = nose.get('z', 0)
        shoulder_z = (left_shoulder.get('z', 0) + right_shoulder.get('z', 0)) / 2
        depth_diff = nose_z - shoulder_z

        # Forward lean: nose is forward (negative z difference)
        if depth_diff < -0.1:
            return 'forward'
        elif depth_diff > 0.1:
            return 'backward'
        else:
            return 'neutral'

    @staticmethod
    def _check_arms_raised(left_shoulder: Dict, right_shoulder: Dict,
                          left_wrist: Dict, right_wrist: Dict) -> bool:
        """Check if one or both arms are raised (e.g., asking questions)."""
        # Check if wrists are above shoulders
        left_raised = left_wrist['y'] < left_shoulder['y'] - 20
        right_raised = right_wrist['y'] < right_shoulder['y'] - 20

        return left_raised or right_raised

    @staticmethod
    def _compute_pose_engagement(arms_crossed: bool, posture: str, arms_raised: bool) -> float:
        """Compute engagement score from pose features.

        Args:
            arms_crossed: Whether arms are crossed (defensive/closed)
            posture: 'forward', 'neutral', or 'backward'
            arms_raised: Whether arms are raised (active participation)

        Returns:
            Engagement score between 0 and 1
        """
        score = 0.5  # Start neutral

        # Arms crossed typically indicates defensive/disengaged posture
        if arms_crossed:
            score -= 0.2

        # Forward lean indicates engagement
        if posture == 'forward':
            score += 0.3
        elif posture == 'backward':
            score -= 0.1

        # Raised arms indicate active participation
        if arms_raised:
            score += 0.2

        # Clamp to [0, 1]
        return max(0.0, min(1.0, score))

    def close(self):
        """Release resources."""
        if self.pose:
            self.pose.close()
            self._is_loaded = False

    @property
    def is_loaded(self) -> bool:
        """Check if model is loaded."""
        return self._is_loaded


# Global instance
_estimator_instance = None


def get_pose_estimator() -> PoseEstimator:
    """Get or create the global pose estimator instance."""
    global _estimator_instance
    if _estimator_instance is None:
        _estimator_instance = PoseEstimator()
    return _estimator_instance
