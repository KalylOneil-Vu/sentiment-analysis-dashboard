"""Simplified main FastAPI application - works with Python 3.13."""
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import random
from datetime import datetime

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


manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle."""
    logger.info("Starting Sentiment Analysis API Server (Simplified Mode)")
    logger.info("Note: Running in demo mode with mock data")
    logger.info("For full ML features, use Python 3.9-3.11")
    yield
    logger.info("Shutting down server...")


# Create FastAPI app
app = FastAPI(
    title="Sentiment Analysis API (Demo Mode)",
    description="Real-time engagement monitoring demo",
    version="0.1.0-demo",
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
        "message": "Sentiment Analysis API (Demo Mode)",
        "version": "0.1.0-demo",
        "status": "running",
        "note": "Using mock data for demonstration"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "mode": "demo",
        "services": {
            "api": "operational",
            "websocket": "operational"
        }
    }


def generate_mock_engagement_data(num_persons: int = None):
    """Generate mock engagement data for demonstration."""
    if num_persons is None:
        num_persons = random.randint(3, 8)

    persons = []
    for i in range(num_persons):
        person_score = random.uniform(0.3, 0.95)

        persons.append({
            "track_id": i + 1,
            "timestamp": datetime.now().isoformat(),
            "overall_score": round(person_score, 3),
            "component_scores": {
                "emotion": round(random.uniform(0.4, 0.9), 3),
                "body_language": round(random.uniform(0.3, 0.9), 3),
                "gaze": round(random.uniform(0.4, 0.8), 3),
                "micro_expression": round(random.uniform(0.4, 0.7), 3),
                "movement": round(random.uniform(0.5, 0.8), 3),
                "speech": round(random.uniform(0.3, 0.9), 3)
            },
            "details": {
                "dominant_emotion": random.choice(["happy", "neutral", "surprised", "sad", "engaged"]),
                "posture": random.choice(["forward", "neutral", "backward"]),
                "arms_crossed": random.choice([True, False]),
                "arms_raised": random.choice([True, False]),
                "is_speaking": random.choice([True, False])
            },
            "bbox": {
                "x1": random.randint(50, 300),
                "y1": random.randint(50, 200),
                "x2": random.randint(400, 600),
                "y2": random.randint(300, 500),
                "center": [random.randint(200, 400), random.randint(150, 350)],
                "width": random.randint(100, 300),
                "height": random.randint(200, 400)
            },
            "confidence": round(random.uniform(0.7, 0.99), 3)
        })

    # Calculate room-level metrics
    overall_score = sum(p["overall_score"] for p in persons) / len(persons)
    highly_engaged = sum(1 for p in persons if p["overall_score"] >= 0.7)
    neutral = sum(1 for p in persons if 0.4 <= p["overall_score"] < 0.7)
    disengaged = sum(1 for p in persons if p["overall_score"] < 0.4)
    speaking = sum(1 for p in persons if p["details"]["is_speaking"])

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
            "speaking_count": speaking,
            "participation_rate": round(speaking / len(persons), 3)
        },
        "persons": persons
    }


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time communication."""
    await manager.connect(websocket, client_id)

    try:
        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")

            if message_type == "video_frame":
                logger.info(f"Received video frame from {client_id}")

                # Generate mock engagement data
                mock_data = generate_mock_engagement_data()

                # Send back engagement metrics
                await manager.send_personal_message(
                    {
                        "type": "engagement_update",
                        "data": mock_data
                    },
                    client_id
                )

            elif message_type == "audio_chunk":
                logger.debug(f"Received audio chunk from {client_id}")

            elif message_type == "ping":
                await manager.send_personal_message({"type": "pong"}, client_id)

    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"Error in WebSocket for {client_id}: {e}")
        manager.disconnect(client_id)


if __name__ == "__main__":
    print("\n" + "="*60)
    print("SENTIMENT ANALYSIS API - DEMO MODE")
    print("="*60)
    print("\nRunning with MOCK DATA for demonstration")
    print("(Full ML features require Python 3.9-3.11)\n")
    print("Server starting on: http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("\n" + "="*60 + "\n")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
