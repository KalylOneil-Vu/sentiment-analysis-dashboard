# Sentiment Analysis App - Setup Guide

Complete guide to set up and run the Meeting Engagement Monitor application.

## Prerequisites

### System Requirements
- Python 3.9 or higher
- Node.js 18 or higher
- npm or yarn
- 8GB RAM minimum (16GB recommended for smooth operation)
- Webcam and microphone
- Modern browser with WebRTC support (Chrome, Edge, Firefox, Safari)

### Optional
- NVIDIA GPU with CUDA support (for faster inference)
- PostgreSQL database (for persistent storage)
- Redis (for caching)

## Installation Steps

### 1. Backend Setup

#### Navigate to backend directory
```bash
cd sentiment-app/backend
```

#### Create virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Install dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### Download ML models

**YOLO Model:**
```bash
# The YOLO model will auto-download on first run
# Or manually download yolov8n.pt
mkdir -p models
# YOLOv8 will automatically download to ~/.ultralytics/
```

**Whisper Model:**
```bash
# Whisper models auto-download on first use
# Models are cached in ~/.cache/whisper/
```

**FastVLM Model (Optional):**
```bash
# If using FastVLM, download from Hugging Face
# This is currently optional as it requires ONNX runtime setup
```

#### Configure environment
```bash
cp .env.example .env
# Edit .env with your settings
```

Key settings to configure:
- `DATABASE_URL`: If using PostgreSQL
- `REDIS_URL`: If using Redis
- `WHISPER_MODEL_SIZE`: Choose model size (tiny, base, small, medium, large)
  - `tiny`: Fastest, lower accuracy (~39M params)
  - `base`: Good balance (~74M params) - **RECOMMENDED**
  - `small`: Better accuracy (~244M params)
  - `medium`: High accuracy (~769M params)
  - `large`: Best accuracy (~1550M params)

#### Run backend server
```bash
python main.py
```

The backend will start on `http://localhost:8000`

### 2. Frontend Setup

#### Open new terminal and navigate to frontend
```bash
cd sentiment-app/frontend
```

#### Install dependencies
```bash
npm install
```

#### Configure environment (optional)
```bash
# Create .env file if needed
echo "VITE_WS_URL=ws://localhost:8000/ws" > .env
```

#### Run development server
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Allow camera and microphone permissions when prompted
3. Click "Start Analysis" to begin monitoring

## Model Download Information

### First Run Model Downloads

The first time you run the application, several models will be downloaded:

| Model | Size | Purpose | Download Time |
|-------|------|---------|---------------|
| YOLOv8n | ~6 MB | Person detection | ~10 seconds |
| Whisper (base) | ~140 MB | Speech recognition | ~1-2 minutes |
| DeepFace | ~100 MB | Emotion recognition | ~1 minute |
| MediaPipe | ~5 MB | Pose estimation | ~5 seconds |

**Total Initial Download:** ~250 MB (with base Whisper model)

These models are cached locally and won't need to be downloaded again.

## Troubleshooting

### Backend Issues

**Import errors:**
```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

**CUDA/GPU errors:**
```bash
# If you don't have a GPU, models will run on CPU (slower but functional)
# To force CPU mode, set in .env:
# DEVICE=cpu
```

**MediaPipe errors on Windows:**
```bash
# MediaPipe sometimes has issues on Windows
# Try installing Visual C++ redistributables
# Or use WSL2 for better compatibility
```

**DeepFace model download issues:**
```bash
# DeepFace downloads models from external sources
# If downloads fail, check internet connection
# Models are cached in ~/.deepface/
```

### Frontend Issues

**WebSocket connection failed:**
- Ensure backend is running on port 8000
- Check firewall settings
- Verify CORS settings in backend config

**Camera/Microphone access denied:**
- Check browser permissions
- Ensure no other app is using the camera
- Try HTTPS (required on some browsers)

**Build errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Performance Issues

**Slow inference:**
- Use smaller Whisper model (tiny or base)
- Reduce frame processing interval in config
- Ensure adequate RAM (8GB minimum)
- Use GPU if available

**High CPU usage:**
- Increase `FRAME_PROCESSING_INTERVAL` in .env (default: 5 seconds)
- Use lighter models
- Close other applications

**Memory issues:**
```bash
# Limit maximum persons to track
# In .env: MAX_PERSONS_TO_TRACK=10
```

## Production Deployment

### Backend (FastAPI)

**Using Gunicorn (Linux/macOS):**
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**Using Docker:**
```dockerfile
# Dockerfile example
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend (React)

**Build for production:**
```bash
npm run build
```

**Serve with nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/sentiment-app/frontend/dist;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
    }

    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Advanced Configuration

### Customize Engagement Weights

Edit `.env` to adjust component weights:
```bash
# Format: emotion,body,gaze,micro,movement,speech
# Default: 0.3,0.25,0.15,0.10,0.10,0.10
ENGAGEMENT_SCORE_WEIGHTS=0.35,0.25,0.15,0.10,0.05,0.10
```

### Enable/Disable Features

Toggle features in `.env`:
```bash
ENABLE_FACE_DETECTION=true
ENABLE_POSE_ESTIMATION=true
ENABLE_EMOTION_RECOGNITION=true
ENABLE_SPEECH_TO_TEXT=true
```

### Database Setup (Optional)

For persistent storage:

**PostgreSQL:**
```bash
# Install PostgreSQL
# Create database
createdb sentiment_db

# Update .env
DATABASE_URL=postgresql://user:password@localhost:5432/sentiment_db
```

**Redis:**
```bash
# Install Redis
# Update .env
REDIS_URL=redis://localhost:6379/0
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs for error messages
3. Check browser console for frontend errors
4. Ensure all dependencies are properly installed

## Performance Benchmarks

**Expected performance on typical hardware:**

| Hardware | Frame Processing Time | Latency |
|----------|----------------------|---------|
| CPU (Intel i5) | ~1-2 seconds/frame | 5-7 seconds |
| CPU (Intel i7) | ~0.5-1 second/frame | 5-6 seconds |
| GPU (NVIDIA GTX) | ~0.2-0.5 seconds/frame | 5 seconds |

Note: Latency includes frame capture interval (5 seconds) plus processing time.

## Next Steps

After successful setup:
1. Test with 1-2 people in frame
2. Verify engagement scores are updating
3. Check audio capture is working
4. Monitor CPU/memory usage
5. Adjust settings based on performance

For production use, consider:
- Setting up persistent storage (PostgreSQL)
- Implementing user authentication
- Adding session recording/playback
- Creating custom dashboards
- Setting up monitoring/alerts
