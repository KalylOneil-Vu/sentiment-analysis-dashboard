"""Real-time FastAPI application using actual video/audio data."""
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import cv2
import numpy as np
import base64
from datetime import datetime
import random

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections."""

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"Client {client_id} disconnected")

    async def send_personal_message(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to {client_id}: {e}")
                self.disconnect(client_id)


class SimpleVideoAnalyzer:
    """Analyzes video frames using OpenCV's built-in face detection."""

    def __init__(self):
        # Load Haar Cascade for face detection (comes with OpenCV)
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.eye_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_eye.xml'
        )
        self.smile_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_smile.xml'
        )
        logger.info("Video analyzer initialized with OpenCV Haar Cascades")

    def analyze_frame(self, frame_data: str) -> dict:
        """Analyze a video frame and extract engagement metrics."""
        try:
            # Decode base64 image
            if ',' in frame_data:
                frame_data = frame_data.split(',')[1]

            img_bytes = base64.b64decode(frame_data)
            nparr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                logger.error("Failed to decode frame")
                return self._empty_result()

            # Convert to grayscale for detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )

            logger.info(f"Detected {len(faces)} faces in frame")

            if len(faces) == 0:
                return self._empty_result()

            # Analyze each detected face
            persons = []
            for i, (x, y, w, h) in enumerate(faces):
                face_roi_gray = gray[y:y+h, x:x+w]
                face_roi_color = frame[y:y+h, x:x+w]

                # Detect eyes (indicator of attention)
                eyes = self.eye_cascade.detectMultiScale(face_roi_gray)
                has_eyes = len(eyes) >= 2

                # Detect smile (indicator of positive emotion)
                smiles = self.smile_cascade.detectMultiScale(
                    face_roi_gray,
                    scaleFactor=1.8,
                    minNeighbors=20
                )
                is_smiling = len(smiles) > 0

                # Calculate brightness (can indicate alertness)
                brightness = np.mean(face_roi_color)

                # Estimate engagement based on detected features
                engagement_score = self._calculate_engagement(
                    has_eyes=has_eyes,
                    is_smiling=is_smiling,
                    brightness=brightness,
                    face_size=(w, h),
                    frame_size=frame.shape[:2]
                )

                # Determine emotion based on smile detection
                emotion = "happy" if is_smiling else "neutral"

                # Estimate posture based on face position
                frame_height = frame.shape[0]
                face_center_y = y + h // 2
                if face_center_y < frame_height * 0.4:
                    posture = "forward"  # Face in upper part of frame
                elif face_center_y > frame_height * 0.6:
                    posture = "backward"  # Face in lower part
                else:
                    posture = "neutral"

                person_data = {
                    "track_id": i + 1,
                    "timestamp": datetime.now().isoformat(),
                    "overall_score": engagement_score,
                    "component_scores": {
                        "emotion": 0.7 if is_smiling else 0.5,
                        "body_language": 0.6 if posture == "forward" else 0.5,
                        "gaze": 0.8 if has_eyes else 0.3,
                        "micro_expression": 0.5,
                        "movement": 0.5,
                        "speech": 0.5
                    },
                    "details": {
                        "dominant_emotion": emotion,
                        "posture": posture,
                        "arms_crossed": False,
                        "arms_raised": False,
                        "is_speaking": False,
                        "eyes_detected": has_eyes,
                        "smiling": is_smiling
                    },
                    "bbox": {
                        "x1": int(x),
                        "y1": int(y),
                        "x2": int(x + w),
                        "y2": int(y + h),
                        "center": [int(x + w/2), int(y + h/2)],
                        "width": int(w),
                        "height": int(h)
                    },
                    "confidence": 0.85
                }
                persons.append(person_data)

            # Calculate room-level metrics
            return self._aggregate_room_metrics(persons)

        except Exception as e:
            logger.error(f"Error analyzing frame: {e}")
            return self._empty_result()

    def _calculate_engagement(self, has_eyes, is_smiling, brightness, face_size, frame_size):
        """Calculate engagement score from detected features."""
        score = 0.5  # Base score

        # Eyes detected = paying attention
        if has_eyes:
            score += 0.2

        # Smiling = positive engagement
        if is_smiling:
            score += 0.15

        # Face size relative to frame (closer = more engaged)
        face_area = face_size[0] * face_size[1]
        frame_area = frame_size[0] * frame_size[1]
        relative_size = face_area / frame_area

        if relative_size > 0.15:  # Large face in frame
            score += 0.1
        elif relative_size < 0.05:  # Small face in frame
            score -= 0.1

        # Brightness (very dark or very bright might indicate issues)
        if 50 < brightness < 200:
            score += 0.05

        return round(max(0.0, min(1.0, score)), 3)

    def _aggregate_room_metrics(self, persons):
        """Aggregate individual metrics into room-level data."""
        if not persons:
            return self._empty_result()

        overall_score = sum(p["overall_score"] for p in persons) / len(persons)
        highly_engaged = sum(1 for p in persons if p["overall_score"] >= 0.7)
        neutral = sum(1 for p in persons if 0.4 <= p["overall_score"] < 0.7)
        disengaged = sum(1 for p in persons if p["overall_score"] < 0.4)

        return {
            "timestamp": datetime.now().isoformat(),
            "overall_score": round(overall_score, 3),
            "total_participants": len(persons),
            "active_participants": len(persons),
            "distribution": {
                "highly_engaged": highly_engaged,
                "neutral": neutral,
                "disengaged": disengaged,
                "percentages": {
                    "highly_engaged": round(highly_engaged / len(persons) * 100, 1),
                    "neutral": round(neutral / len(persons) * 100, 1),
                    "disengaged": round(disengaged / len(persons) * 100, 1)
                }
            },
            "averages": {
                "emotion": round(sum(p["component_scores"]["emotion"] for p in persons) / len(persons), 3),
                "body_language": round(sum(p["component_scores"]["body_language"] for p in persons) / len(persons), 3),
                "speech": round(sum(p["component_scores"]["speech"] for p in persons) / len(persons), 3)
            },
            "participation": {
                "speaking_count": 0,
                "participation_rate": 0.0
            },
            "persons": persons
        }

    def _empty_result(self):
        """Return empty result when no faces detected."""
        return {
            "timestamp": datetime.now().isoformat(),
            "overall_score": 0.0,
            "total_participants": 0,
            "active_participants": 0,
            "distribution": {
                "highly_engaged": 0,
                "neutral": 0,
                "disengaged": 0,
                "percentages": {
                    "highly_engaged": 0.0,
                    "neutral": 0.0,
                    "disengaged": 0.0
                }
            },
            "averages": {
                "emotion": 0.0,
                "body_language": 0.0,
                "speech": 0.0
            },
            "participation": {
                "speaking_count": 0,
                "participation_rate": 0.0
            },
            "persons": []
        }


# Global instances
manager = ConnectionManager()
video_analyzer = SimpleVideoAnalyzer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    logger.info("Starting Sentiment Analysis API Server")
    logger.info("Using OpenCV face detection for real-time analysis")
    yield
    logger.info("Shutting down server...")


# Create FastAPI app
app = FastAPI(
    title="Sentiment Analysis API (Real-time)",
    description="Real-time engagement monitoring using OpenCV",
    version="0.2.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Sentiment Analysis API (Real-time)",
        "version": "0.2.0",
        "status": "running",
        "features": "OpenCV face detection"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "mode": "realtime",
        "services": {
            "api": "operational",
            "websocket": "operational",
            "face_detection": "operational"
        }
    }


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time video/audio streaming."""
    await manager.connect(websocket, client_id)

    frame_count = 0

    try:
        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")

            if message_type == "video_frame":
                frame_count += 1
                logger.info(f"Processing frame {frame_count} from {client_id}")

                frame_data = data.get("data")
                if frame_data:
                    # Analyze the actual video frame
                    engagement_data = video_analyzer.analyze_frame(frame_data)

                    # Send back real engagement metrics
                    await manager.send_personal_message(
                        {
                            "type": "engagement_update",
                            "data": engagement_data
                        },
                        client_id
                    )
                else:
                    logger.warning("Received empty frame data")

            elif message_type == "audio_chunk":
                logger.debug(f"Received audio chunk from {client_id}")
                # TODO: Process audio when speech recognition is added

            elif message_type == "ping":
                await manager.send_personal_message({"type": "pong"}, client_id)

    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"Error in WebSocket for {client_id}: {e}")
        manager.disconnect(client_id)


if __name__ == "__main__":
    print("\n" + "="*60)
    print("SENTIMENT ANALYSIS API - REAL-TIME MODE")
    print("="*60)
    print("\nUsing OpenCV face detection")
    print("Analyzing actual video frames\n")
    print("Server starting on: http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("\n" + "="*60 + "\n")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
