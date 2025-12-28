"""
FastAPI Backend - Lightweight FastVLM Integration

Optimized for speed: relies on client-side MediaPipe for detection,
processes FastVLM keywords for engagement scoring.
No heavy ML models (DeepFace removed for performance).
"""
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from datetime import datetime
import httpx
import os
from dotenv import load_dotenv

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
    logger.info("SENTIMENT ANALYSIS API - Lightweight")
    logger.info("=" * 60)
    logger.info("Features:")
    logger.info("  * FastVLM keyword processing (primary)")
    logger.info("  * Client-side MediaPipe detection")
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
    """Process FastVLM keywords for engagement scoring.

    Optimized: No image processing - relies on client-side MediaPipe detection.
    FastVLM keywords are the primary source of engagement data.
    """
    try:
        # Parse FastVLM output - this is the primary data source
        parsed_vlm = keyword_parser.parse(fastvlm_text)

        logger.info(f"FastVLM score: {parsed_vlm['contextual_score']:.2f}")
        if fastvlm_text:
            logger.info(f"FastVLM text: {fastvlm_text[:80]}...")

        # Create single person engagement from FastVLM data
        # (MediaPipe handles face detection client-side)
        emotion_data = {
            'engagement_score': parsed_vlm['contextual_score'],
            'dominant_emotion': parsed_vlm['emotions'].get('dominant', 'neutral'),
            'emotion_scores': {}
        }

        # Map FastVLM emotions to scores
        for emotion in parsed_vlm['emotions'].get('positive', []):
            emotion_data['emotion_scores'][emotion] = 80
        for emotion in parsed_vlm['emotions'].get('negative', []):
            emotion_data['emotion_scores'][emotion] = 60
        if not emotion_data['emotion_scores']:
            emotion_data['emotion_scores']['neutral'] = 70

        # Create person engagement from FastVLM analysis
        person = engagement_scorer.score_person(
            track_id=1,
            fastvlm_data=parsed_vlm,
            emotion_data=emotion_data,
            speech_data=None,
            bbox=None  # No bbox needed - client handles detection
        )

        # Aggregate (single person)
        room_engagement = engagement_scorer.aggregate_room([person])

        # Add parsed keywords to response
        result = room_engagement.to_dict()
        result['parsed_keywords'] = {
            'keywords': parsed_vlm.get('keywords', {}),
            'emotions': parsed_vlm.get('emotions', {}),
            'body_language': parsed_vlm.get('body_language', {})
        }

        return result

    except Exception as e:
        logger.error(f"Error processing: {e}")
        return {"error": str(e)}


if __name__ == "__main__":
    print("\n" + "="*60)
    print("SENTIMENT ANALYSIS API - Lightweight")
    print("="*60)
    print("\nFeatures:")
    print("  * FastVLM keyword analysis (primary)")
    print("  * Client-side MediaPipe (no server-side CV)")
    print("  * Fast engagement scoring")
    print("\nServer: http://localhost:8000")
    print("Docs: http://localhost:8000/docs")
    print("\n" + "="*60 + "\n")

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
