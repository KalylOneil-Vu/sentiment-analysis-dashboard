"""Main FastAPI application entry point."""
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from config import settings
from api.websocket_manager import ConnectionManager
from api.routes import router

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# WebSocket connection manager
manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle events."""
    logger.info("Starting Sentiment Analysis API Server...")
    logger.info(f"Debug mode: {settings.debug}")
    logger.info(f"CORS origins: {settings.cors_origins_list}")

    # TODO: Initialize ML models here
    # - Load YOLO model
    # - Load MediaPipe
    # - Load DeepFace
    # - Load FastVLM
    # - Load Whisper

    yield

    logger.info("Shutting down Sentiment Analysis API Server...")
    # TODO: Cleanup resources


# Create FastAPI app
app = FastAPI(
    title="Sentiment Analysis API",
    description="Real-time engagement monitoring for corporate meetings",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Sentiment Analysis API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "services": {
            "api": "operational",
            # TODO: Add model status checks
        }
    }


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time video/audio streaming and metrics."""
    await manager.connect(websocket, client_id)
    logger.info(f"Client {client_id} connected")

    try:
        while True:
            # Receive data from client (video frames, audio chunks)
            data = await websocket.receive_json()

            message_type = data.get("type")

            if message_type == "video_frame":
                # TODO: Process video frame
                # - Detect persons
                # - Track individuals
                # - Analyze emotions
                # - Estimate poses
                # - Run FastVLM inference
                logger.debug(f"Received video frame from {client_id}")

                # Send back mock engagement metrics
                await manager.send_personal_message(
                    {
                        "type": "engagement_update",
                        "data": {
                            "overall_score": 0.73,
                            "persons": []
                        }
                    },
                    client_id
                )

            elif message_type == "audio_chunk":
                # TODO: Process audio chunk
                # - Transcribe speech
                # - Identify speakers
                # - Analyze sentiment
                logger.debug(f"Received audio chunk from {client_id}")

            elif message_type == "ping":
                await manager.send_personal_message({"type": "pong"}, client_id)

    except WebSocketDisconnect:
        manager.disconnect(client_id)
        logger.info(f"Client {client_id} disconnected")
    except Exception as e:
        logger.error(f"Error in WebSocket connection for {client_id}: {str(e)}")
        manager.disconnect(client_id)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info"
    )
