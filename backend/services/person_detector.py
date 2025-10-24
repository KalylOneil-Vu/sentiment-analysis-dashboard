"""Person detection service using YOLO v8."""
import cv2
import numpy as np
from typing import List, Tuple
import logging
from ultralytics import YOLO

from config import settings

logger = logging.getLogger(__name__)


class BoundingBox:
    """Represents a detected person's bounding box."""

    def __init__(self, x1: int, y1: int, x2: int, y2: int, confidence: float, class_id: int = 0):
        """Initialize bounding box.

        Args:
            x1: Left coordinate
            y1: Top coordinate
            x2: Right coordinate
            y2: Bottom coordinate
            confidence: Detection confidence score
            class_id: Object class ID (0 for person in COCO)
        """
        self.x1 = x1
        self.y1 = y1
        self.x2 = x2
        self.y2 = y2
        self.confidence = confidence
        self.class_id = class_id

    @property
    def center(self) -> Tuple[int, int]:
        """Get the center point of the bounding box."""
        return ((self.x1 + self.x2) // 2, (self.y1 + self.y2) // 2)

    @property
    def width(self) -> int:
        """Get the width of the bounding box."""
        return self.x2 - self.x1

    @property
    def height(self) -> int:
        """Get the height of the bounding box."""
        return self.y2 - self.y1

    @property
    def area(self) -> int:
        """Get the area of the bounding box."""
        return self.width * self.height

    def to_dict(self) -> dict:
        """Convert to dictionary representation."""
        return {
            "x1": self.x1,
            "y1": self.y1,
            "x2": self.x2,
            "y2": self.y2,
            "center": self.center,
            "width": self.width,
            "height": self.height,
            "confidence": self.confidence
        }


class PersonDetector:
    """Detects persons in images using YOLO v8."""

    def __init__(self, model_path: str = None, confidence_threshold: float = 0.5):
        """Initialize the person detector.

        Args:
            model_path: Path to YOLO model file
            confidence_threshold: Minimum confidence for detections
        """
        self.model_path = model_path or settings.yolo_model_path
        self.confidence_threshold = confidence_threshold
        self.model = None
        self._is_loaded = False

    def load(self):
        """Load the YOLO model."""
        if self._is_loaded:
            logger.info("YOLO model already loaded")
            return

        try:
            logger.info(f"Loading YOLO model from {self.model_path}")
            self.model = YOLO(self.model_path)
            self._is_loaded = True
            logger.info("YOLO model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {str(e)}")
            raise

    def detect(self, frame: np.ndarray) -> List[BoundingBox]:
        """Detect persons in a frame.

        Args:
            frame: Input image as numpy array (BGR format)

        Returns:
            List of detected person bounding boxes
        """
        if not self._is_loaded:
            raise RuntimeError("Model not loaded. Call load() first.")

        try:
            # Run inference
            results = self.model(frame, verbose=False)

            detections = []
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    # Filter for person class (class 0 in COCO dataset)
                    class_id = int(box.cls[0])
                    if class_id != 0:  # 0 is person in COCO
                        continue

                    confidence = float(box.conf[0])
                    if confidence < self.confidence_threshold:
                        continue

                    # Get bounding box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    detections.append(
                        BoundingBox(
                            int(x1), int(y1), int(x2), int(y2),
                            confidence, class_id
                        )
                    )

            logger.debug(f"Detected {len(detections)} persons in frame")
            return detections

        except Exception as e:
            logger.error(f"Error during person detection: {str(e)}")
            return []

    def draw_detections(self, frame: np.ndarray, detections: List[BoundingBox]) -> np.ndarray:
        """Draw detection boxes on frame for visualization.

        Args:
            frame: Input image
            detections: List of detections to draw

        Returns:
            Frame with drawn detections
        """
        output_frame = frame.copy()

        for i, detection in enumerate(detections):
            # Draw bounding box
            cv2.rectangle(
                output_frame,
                (detection.x1, detection.y1),
                (detection.x2, detection.y2),
                (0, 255, 0),
                2
            )

            # Draw label
            label = f"Person {i+1}: {detection.confidence:.2f}"
            cv2.putText(
                output_frame,
                label,
                (detection.x1, detection.y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 0),
                2
            )

        return output_frame

    @property
    def is_loaded(self) -> bool:
        """Check if model is loaded."""
        return self._is_loaded


# Global instance
_detector_instance = None


def get_person_detector() -> PersonDetector:
    """Get or create the global person detector instance."""
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = PersonDetector()
    return _detector_instance
