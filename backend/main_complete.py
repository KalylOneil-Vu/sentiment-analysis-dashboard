"""
Complete FastAPI Backend with FastVLM Integration

Receives FastVLM keywords from frontend, processes with DeepFace and Speech,
returns comprehensive engagement scores.
"""
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import cv2
import numpy as np
import base64
from datetime import datetime

from services.emotion_analyzer_v2 import get_emotion_analyzer
from services.speech_analyzer_v2 import get_speech_analyzer
from services.keyword_parser import get_keyword_parser
from services.engagement_scorer_v2 import get_engagement_scorer

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

    async def send_message(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending to {client_id}: {e}")
                self.disconnect(client_id)


# Global instances
manager = ConnectionManager()
emotion_analyzer = get_emotion_analyzer()
speech_analyzer = get_speech_analyzer()
keyword_parser = get_keyword_parser()
engagement_scorer = get_engagement_scorer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    logger.info("=" * 60)
    logger.info("SENTIMENT ANALYSIS API - FastVLM + DeepFace + Whisper")
    logger.info("=" * 60)
    logger.info("Loading ML models...")

    try:
        # Load DeepFace
        emotion_analyzer.load()
        logger.info("✓ DeepFace loaded")

        # Load Whisper (optional, comment out if too slow)
        # speech_analyzer.load()
        # logger.info("✓ Whisper loaded")

        logger.info("All models loaded successfully!")
    except Exception as e:
        logger.error(f"Error loading models: {e}")

    yield

    logger.info("Shutting down server...")


# Create FastAPI app
app = FastAPI(
    title="Sentiment Analysis API (Complete)",
    description="Real-time engagement with FastVLM + DeepFace + Whisper",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Sentiment Analysis API (Complete)",
        "version": "1.0.0",
        "status": "running",
        "features": ["FastVLM", "DeepFace", "Whisper", "VADER"]
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "api": "operational",
            "deepface": "loaded" if emotion_analyzer.is_loaded else "not_loaded",
            "whisper": "loaded" if speech_analyzer.is_loaded else "not_loaded",
        }
    }


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time analysis.

    Receives:
    - video_frame: Base64 encoded image + FastVLM keywords
    - audio_chunk: Audio data for transcription

    Sends:
    - engagement_update: Combined engagement metrics
    """
    await manager.connect(websocket, client_id)

    frame_count = 0

    try:
        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")

            if message_type == "video_frame":
                frame_count += 1
                logger.info(f"Processing frame {frame_count} from {client_id}")

                # Get data from message
                frame_data = data.get("frame")  # Base64 image
                fastvlm_keywords = data.get("fastvlm_keywords", [])  # Keywords from client
                fastvlm_text = data.get("fastvlm_text", "")  # Full VLM description

                # Process the frame
                engagement_data = await process_frame(
                    frame_data,
                    fastvlm_text,
                    fastvlm_keywords
                )

                # Send back results
                await manager.send_message(
                    {
                        "type": "engagement_update",
                        "data": engagement_data
                    },
                    client_id
                )

            elif message_type == "audio_chunk":
                logger.debug(f"Received audio from {client_id}")
                # TODO: Process audio with Whisper
                # For now, speech analysis is optional

            elif message_type == "ping":
                await manager.send_message({"type": "pong"}, client_id)

    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"Error in WebSocket for {client_id}: {e}")
        manager.disconnect(client_id)


async def process_frame(
    frame_data: str,
    fastvlm_text: str,
    fastvlm_keywords: list
) -> dict:
    """Process a single frame with FastVLM keywords.

    Args:
        frame_data: Base64 encoded image
        fastvlm_text: Full text description from FastVLM
        fastvlm_keywords: Keywords extracted on client-side

    Returns:
        Engagement metrics dictionary
    """
    try:
        # Decode frame
        if ',' in frame_data:
            frame_data = frame_data.split(',')[1]

        img_bytes = base64.b64decode(frame_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            logger.error("Failed to decode frame")
            return {"error": "Failed to decode frame"}

        # 1. Parse FastVLM output (client already did extraction, but reparse for server)
        parsed_vlm = keyword_parser.parse(fastvlm_text)

        # 2. Detect and analyze faces with DeepFace
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Simple face detection (using OpenCV for speed)
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(30, 30))

        logger.info(f"Detected {len(faces)} faces")

        # Process each face
        persons = []
        for i, (x, y, w, h) in enumerate(faces):
            face_img = frame[y:y+h, x:x+w]

            # Analyze emotion with DeepFace
            emotion_data = None
            if emotion_analyzer.is_loaded:
                try:
                    emotion_data = emotion_analyzer.analyze_face(face_img)
                except Exception as e:
                    logger.debug(f"Emotion analysis failed: {e}")

            # Create person engagement score
            person = engagement_scorer.score_person(
                track_id=i + 1,
                fastvlm_data=parsed_vlm,
                emotion_data=emotion_data,
                speech_data=None,  # TODO: Add speech when available
                bbox={'x1': int(x), 'y1': int(y), 'x2': int(x+w), 'y2': int(y+h)}
            )

            persons.append(person)

        # Aggregate room metrics
        room_engagement = engagement_scorer.aggregate_room(persons)

        return room_engagement.to_dict()

    except Exception as e:
        logger.error(f"Error processing frame: {e}")
        return {"error": str(e)}


if __name__ == "__main__":
    print("\n" + "="*60)
    print("SENTIMENT ANALYSIS API - COMPLETE VERSION")
    print("="*60)
    print("\nFeatures:")
    print("  ✓ FastVLM keyword analysis (client-side)")
    print("  ✓ DeepFace emotion recognition")
    print("  ✓ Whisper speech-to-text (optional)")
    print("  ✓ VADER sentiment analysis")
    print("  ✓ Combined engagement scoring")
    print("\nServer starting on: http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("\n" + "="*60 + "\n")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
