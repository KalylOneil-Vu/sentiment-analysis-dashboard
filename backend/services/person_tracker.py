"""Person tracking service using DeepSORT-like tracking."""
import numpy as np
from typing import List, Dict, Optional
from collections import deque
import logging
from scipy.optimize import linear_sum_assignment

from services.person_detector import BoundingBox

logger = logging.getLogger(__name__)


class TrackedPerson:
    """Represents a tracked person across frames."""

    def __init__(self, track_id: int, bbox: BoundingBox):
        """Initialize tracked person.

        Args:
            track_id: Unique identifier for this person
            bbox: Initial bounding box
        """
        self.track_id = track_id
        self.bbox = bbox
        self.history = deque(maxlen=30)  # Keep last 30 positions
        self.history.append(bbox)
        self.frames_since_update = 0
        self.total_frames = 1

    def update(self, bbox: BoundingBox):
        """Update person's position with new detection.

        Args:
            bbox: New bounding box for this person
        """
        self.bbox = bbox
        self.history.append(bbox)
        self.frames_since_update = 0
        self.total_frames += 1

    def mark_missed(self):
        """Mark that this person wasn't detected in current frame."""
        self.frames_since_update += 1

    @property
    def is_stale(self) -> bool:
        """Check if track is stale (not seen for many frames)."""
        return self.frames_since_update > 30

    def to_dict(self) -> dict:
        """Convert to dictionary representation."""
        return {
            "track_id": self.track_id,
            "bbox": self.bbox.to_dict(),
            "frames_since_update": self.frames_since_update,
            "total_frames_seen": self.total_frames
        }


class PersonTracker:
    """Tracks multiple persons across video frames using IOU matching."""

    def __init__(self, iou_threshold: float = 0.3, max_age: int = 30):
        """Initialize the person tracker.

        Args:
            iou_threshold: Minimum IOU for matching detections to tracks
            max_age: Maximum frames to keep a track without updates
        """
        self.iou_threshold = iou_threshold
        self.max_age = max_age
        self.tracks: Dict[int, TrackedPerson] = {}
        self.next_track_id = 1

    def update(self, detections: List[BoundingBox]) -> List[TrackedPerson]:
        """Update tracks with new detections.

        Args:
            detections: List of person detections from current frame

        Returns:
            List of active tracked persons
        """
        # Mark all existing tracks as potentially missed
        for track in self.tracks.values():
            track.mark_missed()

        if len(detections) == 0:
            # No detections, just return existing tracks
            self._remove_stale_tracks()
            return list(self.tracks.values())

        if len(self.tracks) == 0:
            # No existing tracks, create new ones for all detections
            for detection in detections:
                self._create_new_track(detection)
            return list(self.tracks.values())

        # Compute IOU matrix between existing tracks and new detections
        track_ids = list(self.tracks.keys())
        iou_matrix = np.zeros((len(track_ids), len(detections)))

        for i, track_id in enumerate(track_ids):
            track_bbox = self.tracks[track_id].bbox
            for j, detection in enumerate(detections):
                iou_matrix[i, j] = self._compute_iou(track_bbox, detection)

        # Use Hungarian algorithm for optimal assignment
        if iou_matrix.size > 0:
            row_indices, col_indices = linear_sum_assignment(-iou_matrix)

            # Update matched tracks
            matched_detections = set()
            matched_tracks = set()

            for row, col in zip(row_indices, col_indices):
                if iou_matrix[row, col] >= self.iou_threshold:
                    track_id = track_ids[row]
                    self.tracks[track_id].update(detections[col])
                    matched_detections.add(col)
                    matched_tracks.add(track_id)

            # Create new tracks for unmatched detections
            for j, detection in enumerate(detections):
                if j not in matched_detections:
                    self._create_new_track(detection)

        # Remove stale tracks
        self._remove_stale_tracks()

        return list(self.tracks.values())

    def _create_new_track(self, bbox: BoundingBox):
        """Create a new track for a detection.

        Args:
            bbox: Bounding box for the new track
        """
        track_id = self.next_track_id
        self.tracks[track_id] = TrackedPerson(track_id, bbox)
        self.next_track_id += 1
        logger.debug(f"Created new track {track_id}")

    def _remove_stale_tracks(self):
        """Remove tracks that haven't been updated recently."""
        stale_track_ids = [
            track_id for track_id, track in self.tracks.items()
            if track.frames_since_update > self.max_age
        ]

        for track_id in stale_track_ids:
            del self.tracks[track_id]
            logger.debug(f"Removed stale track {track_id}")

    @staticmethod
    def _compute_iou(bbox1: BoundingBox, bbox2: BoundingBox) -> float:
        """Compute Intersection over Union (IoU) between two bounding boxes.

        Args:
            bbox1: First bounding box
            bbox2: Second bounding box

        Returns:
            IoU score between 0 and 1
        """
        # Compute intersection
        x1 = max(bbox1.x1, bbox2.x1)
        y1 = max(bbox1.y1, bbox2.y1)
        x2 = min(bbox1.x2, bbox2.x2)
        y2 = min(bbox1.y2, bbox2.y2)

        intersection = max(0, x2 - x1) * max(0, y2 - y1)

        # Compute union
        area1 = bbox1.area
        area2 = bbox2.area
        union = area1 + area2 - intersection

        if union == 0:
            return 0.0

        return intersection / union

    def get_track_by_id(self, track_id: int) -> Optional[TrackedPerson]:
        """Get a specific track by ID.

        Args:
            track_id: The track identifier

        Returns:
            TrackedPerson if found, None otherwise
        """
        return self.tracks.get(track_id)

    def get_active_tracks(self) -> List[TrackedPerson]:
        """Get all currently active tracks.

        Returns:
            List of active tracked persons
        """
        return [track for track in self.tracks.values() if track.frames_since_update == 0]

    def reset(self):
        """Reset the tracker, clearing all tracks."""
        self.tracks.clear()
        self.next_track_id = 1
        logger.info("Tracker reset")


# Global instance
_tracker_instance = None


def get_person_tracker() -> PersonTracker:
    """Get or create the global person tracker instance."""
    global _tracker_instance
    if _tracker_instance is None:
        _tracker_instance = PersonTracker()
    return _tracker_instance
