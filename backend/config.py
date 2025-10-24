"""Configuration management for the sentiment analysis backend."""
import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Server Configuration
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    debug: bool = Field(default=True, env="DEBUG")

    # Database
    database_url: str = Field(default="postgresql://user:password@localhost:5432/sentiment_db", env="DATABASE_URL")
    redis_url: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")

    # Model Paths
    yolo_model_path: str = Field(default="models/yolov8n.pt", env="YOLO_MODEL_PATH")
    fastvlm_model_path: str = Field(default="models/FastVLM-0.5B-ONNX", env="FASTVLM_MODEL_PATH")
    whisper_model_size: str = Field(default="base", env="WHISPER_MODEL_SIZE")

    # Processing Configuration
    frame_processing_interval: int = Field(default=5, env="FRAME_PROCESSING_INTERVAL")
    max_persons_to_track: int = Field(default=20, env="MAX_PERSONS_TO_TRACK")

    # Engagement Score Weights (emotion, body, gaze, micro, movement, speech)
    engagement_score_weights: str = Field(default="0.3,0.25,0.15,0.10,0.10,0.10", env="ENGAGEMENT_SCORE_WEIGHTS")

    # Feature Flags
    enable_face_detection: bool = Field(default=True, env="ENABLE_FACE_DETECTION")
    enable_pose_estimation: bool = Field(default=True, env="ENABLE_POSE_ESTIMATION")
    enable_emotion_recognition: bool = Field(default=True, env="ENABLE_EMOTION_RECOGNITION")
    enable_fastvlm: bool = Field(default=True, env="ENABLE_FASTVLM")
    enable_speech_to_text: bool = Field(default=True, env="ENABLE_SPEECH_TO_TEXT")
    enable_speaker_diarization: bool = Field(default=True, env="ENABLE_SPEAKER_DIARIZATION")

    # Security
    cors_origins: str = Field(default="http://localhost:3000,http://localhost:5173", env="CORS_ORIGINS")
    jwt_secret_key: str = Field(default="your-secret-key-here", env="JWT_SECRET_KEY")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def score_weights(self) -> List[float]:
        """Parse engagement score weights into list of floats."""
        weights = [float(w.strip()) for w in self.engagement_score_weights.split(",")]
        # Normalize to ensure sum = 1.0
        total = sum(weights)
        return [w / total for w in weights]


# Global settings instance
settings = Settings()
