# Sentiment Analysis Dashboard

A real-time engagement and sentiment analysis application designed for LED wall displays in headquarters environments. This modern dashboard uses computer vision and natural language processing to monitor room engagement during meetings and presentations.

## Features

- **Multi-person Detection**: Tracks individuals separately with unique IDs
- **Visual Analysis**: Facial expressions, body language, pose estimation
- **Audio Analysis**: Speech-to-text, sentiment analysis, participation tracking
- **Real-time Dashboard**: Live engagement metrics updating every 5-10 seconds
- **Historical Analytics**: Compare sessions and track trends over time

## Architecture

### Frontend (React + TypeScript)
- Real-time video display
- Live engagement dashboard
- Metric visualizations
- WebSocket client

### Backend (Python FastAPI)
- Multi-modal processing pipeline
- Computer vision analysis (YOLO, MediaPipe, DeepFace)
- FastVLM integration for contextual analysis
- Audio processing (Whisper, sentiment analysis)
- WebSocket server for real-time updates

## Technology Stack

**Computer Vision:**
- YOLO v8 - Multi-person detection
- DeepSORT - Person tracking
- MediaPipe - Pose estimation
- DeepFace - Emotion recognition
- FastVLM - Contextual sentiment analysis
- OpenCV - Video processing

**Audio Processing:**
- Whisper - Speech-to-text
- PyAnnotate/Resemblyzer - Speaker diarization
- VADER/Transformers - Text sentiment analysis

**Backend:**
- FastAPI - REST API and WebSocket server
- PostgreSQL - Data storage
- Redis - Real-time caching

**Frontend:**
- React 19 + TypeScript
- Chart.js/D3.js - Visualizations
- TailwindCSS - Styling

## Setup

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Engagement Scoring Algorithm

Individual engagement score calculated from:
- Facial Emotion (30%): Positive emotions boost score
- Body Language (25%): Posture, gestures, openness
- Gaze Direction (15%): Looking at screen/presenter
- Micro-expressions (10%): Surprise, interest markers
- Movement (10%): Appropriate gestures vs fidgeting
- Speech Participation (10%): Tone and participation

## License

MIT
