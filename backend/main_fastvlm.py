"""
FastAPI Backend with Full ML Stack Integration

Combines FastVLM, DeepFace, and CV analysis for comprehensive engagement tracking.
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
import httpx
import os
from dotenv import load_dotenv

# Try to import DeepFace, fallback to OpenCV if not available
DEEPFACE_AVAILABLE = False
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except Exception as e:
    print(f"DeepFace not available: {e}. Using OpenCV fallback.")

from services.keyword_parser import get_keyword_parser
from services.engagement_scorer_v2 import get_engagement_scorer, PersonEngagement

# Load environment variables
load_dotenv()

WEBHOOK_URL = os.getenv('WEBHOOK_URL', '')
WEBHOOK_ENABLED = os.getenv('WEBHOOK_ENABLED', 'false').lower() == 'true'

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
keyword_parser = get_keyword_parser()
engagement_scorer = get_engagement_scorer()

# Load face cascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
smile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_smile.xml')


async def send_webhook(engagement_score: float, keywords: dict = None):
    """Send engagement score and keywords to configured webhook endpoint.

    Args:
        engagement_score: Overall engagement score (0.0 to 1.0)
        keywords: Dict containing positive/negative keywords, emotions, and body language
    """
    if not WEBHOOK_ENABLED or not WEBHOOK_URL:
        return

    try:
        async with httpx.AsyncClient() as client:
            # Convert 0-1 score to 0-100 percentage
            payload = {
                "engagement": round(engagement_score * 100),
                "keywords": keywords or {}
            }

            response = await client.post(
                WEBHOOK_URL,
                json=payload,
                timeout=5.0,
                headers={"Content-Type": "application/json"}
            )

            if response.status_code == 200:
                logger.info(f"✓ Webhook sent: engagement={payload['engagement']}, keywords={len(keywords.get('positive', []) if keywords else [])} positive, Status: {response.status_code}")
            else:
                logger.warning(f"Webhook returned status {response.status_code}: {response.text}")

    except httpx.TimeoutException:
        logger.warning(f"Webhook timeout after 5s for URL: {WEBHOOK_URL}")
    except Exception as e:
        logger.warning(f"Webhook failed: {type(e).__name__}: {str(e)}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    logger.info("=" * 60)
    logger.info("SENTIMENT ANALYSIS API - Enhanced ML Stack")
    logger.info("=" * 60)
    logger.info("Features:")
    logger.info("  * FastVLM keyword processing (35% weight)")
    if DEEPFACE_AVAILABLE:
        logger.info("  * DeepFace 7-emotion classification (25% weight)")
    else:
        logger.info("  * OpenCV smile detection (25% weight)")
    logger.info("  * Body language analysis (15% weight)")
    logger.info("  * Webhook integration")
    logger.info("=" * 60)
    yield
    logger.info("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Sentiment Analysis API (FastVLM)",
    description="Real-time engagement with FastVLM + OpenCV",
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
        "message": "Sentiment Analysis API (FastVLM)",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time analysis."""
    await manager.connect(websocket, client_id)

    frame_count = 0
    last_webhook_time = datetime.now()
    WEBHOOK_INTERVAL_SECONDS = 10  # Send webhook every 10 seconds

    try:
        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")

            if message_type == "video_frame":
                frame_count += 1
                logger.info(f"Processing frame {frame_count} from {client_id}")

                # Get data
                frame_data = data.get("frame")
                fastvlm_text = data.get("fastvlm_text", "")
                fastvlm_keywords = data.get("fastvlm_keywords", [])

                # Process
                engagement_data = await process_frame(
                    frame_data,
                    fastvlm_text,
                    fastvlm_keywords
                )

                # Send webhook with rate limiting (every 10 seconds)
                if not isinstance(engagement_data, dict) or "error" not in engagement_data:
                    current_time = datetime.now()
                    time_since_last_webhook = (current_time - last_webhook_time).total_seconds()

                    if time_since_last_webhook >= WEBHOOK_INTERVAL_SECONDS:
                        overall_score = engagement_data.get('overall_score', 0.5)
                        keywords_data = engagement_data.get('parsed_keywords', {})

                        await send_webhook(overall_score, keywords_data)
                        last_webhook_time = current_time

                # Send results
                await manager.send_message(
                    {"type": "engagement_update", "data": engagement_data},
                    client_id
                )

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
    """Process frame with FastVLM keywords."""
    try:
        # Decode frame
        if ',' in frame_data:
            frame_data = frame_data.split(',')[1]

        img_bytes = base64.b64decode(frame_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return {"error": "Failed to decode frame"}

        # Parse FastVLM output
        parsed_vlm = keyword_parser.parse(fastvlm_text)

        # Detect faces
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(30, 30))

        logger.info(f"Detected {len(faces)} faces, FastVLM score: {parsed_vlm['contextual_score']:.2f}")
        logger.info(f"FastVLM text: {fastvlm_text[:100]}...")  # Log first 100 chars
        logger.info(f"Extracted keywords - Positive: {parsed_vlm['keywords']['positive']}, Negative: {parsed_vlm['keywords']['negative']}")
        logger.info(f"Body language: {parsed_vlm['body_language']}")
        logger.info(f"Emotions: {parsed_vlm['emotions']}")

        # Process each face
        persons = []
        for i, (x, y, w, h) in enumerate(faces):
            # Extract face region for DeepFace analysis
            face_img = frame[y:y+h, x:x+w]

            # DeepFace emotion analysis (7 emotions) or OpenCV fallback
            emotion_data = None

            if DEEPFACE_AVAILABLE:
                try:
                    # Analyze emotions using DeepFace
                    analysis = DeepFace.analyze(
                        face_img,
                        actions=['emotion'],
                        enforce_detection=False,
                        detector_backend='opencv',
                        silent=True
                    )

                    # Extract emotion data (handle both list and dict responses)
                    if isinstance(analysis, list):
                        analysis = analysis[0]

                    emotions = analysis.get('emotion', {})
                    dominant_emotion = analysis.get('dominant_emotion', 'neutral').lower()

                    # Calculate engagement score from emotions
                    # Positive emotions: happy, surprise (when moderate)
                    # Neutral: neutral, calm
                    # Negative: sad, angry, fear, disgust
                    positive_score = emotions.get('happy', 0) + emotions.get('surprise', 0) * 0.5
                    negative_score = emotions.get('sad', 0) + emotions.get('angry', 0) + emotions.get('fear', 0) + emotions.get('disgust', 0)
                    neutral_score = emotions.get('neutral', 0)

                    # Normalize to 0-1 scale (emotions are 0-100 percentages)
                    emotion_score = (positive_score - negative_score * 0.5 + neutral_score * 0.3) / 100
                    emotion_score = max(0.0, min(1.0, emotion_score))  # Clamp to [0, 1]

                    emotion_data = {
                        'engagement_score': emotion_score,
                        'dominant_emotion': dominant_emotion,
                        'emotion_scores': emotions
                    }

                    logger.info(f"Face {i+1} [DeepFace]: {dominant_emotion}, Score = {emotion_score:.2f}")

                except Exception as e:
                    logger.warning(f"DeepFace failed for face {i+1}: {e}. Using OpenCV fallback.")
                    # Don't modify DEEPFACE_AVAILABLE here - just fall through to OpenCV
                    emotion_data = None  # Ensure we fall through to OpenCV

            if not DEEPFACE_AVAILABLE or emotion_data is None:
                # Fallback to basic smile detection (OpenCV)
                face_roi_gray = gray[y:y+h, x:x+w]
                smiles = smile_cascade.detectMultiScale(face_roi_gray, 1.8, 20)
                is_smiling = len(smiles) > 0

                emotion_score = 0.8 if is_smiling else 0.5
                dominant_emotion = "happy" if is_smiling else "neutral"

                emotion_data = {
                    'engagement_score': emotion_score,
                    'dominant_emotion': dominant_emotion,
                    'emotion_scores': {dominant_emotion: 100}
                }

                logger.info(f"Face {i+1} [OpenCV]: {dominant_emotion}, Score = {emotion_score:.2f}")

            # Create person engagement
            person = engagement_scorer.score_person(
                track_id=i + 1,
                fastvlm_data=parsed_vlm,
                emotion_data=emotion_data,
                speech_data=None,
                bbox={'x1': int(x), 'y1': int(y), 'x2': int(x+w), 'y2': int(y+h)}
            )

            persons.append(person)

        # Aggregate
        room_engagement = engagement_scorer.aggregate_room(persons)

        # Add parsed keywords to response
        result = room_engagement.to_dict()
        result['parsed_keywords'] = {
            'keywords': parsed_vlm.get('keywords', {}),
            'emotions': parsed_vlm.get('emotions', {}),
            'body_language': parsed_vlm.get('body_language', {})
        }

        return result

    except Exception as e:
        logger.error(f"Error processing frame: {e}")
        return {"error": str(e)}


if __name__ == "__main__":
    print("\n" + "="*60)
    print("SENTIMENT ANALYSIS API - FastVLM Integration")
    print("="*60)
    print("\nFeatures:")
    print("  * FastVLM keyword analysis (runs in browser)")
    print("  * OpenCV face & smile detection")
    print("  * Combined engagement scoring")
    print("\nServer: http://localhost:8000")
    print("Docs: http://localhost:8000/docs")
    print("\n" + "="*60 + "\n")

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
