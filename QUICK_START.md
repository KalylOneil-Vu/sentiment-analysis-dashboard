# Quick Start Guide

## Prerequisites Check

Before starting, make sure you have:

1. **Python 3.9+** installed
   ```bash
   python --version
   ```
   If not installed: Download from https://www.python.org/downloads/

2. **Node.js 18+** installed
   ```bash
   node --version
   ```
   If not installed: Download from https://nodejs.org/

## Easy Start (Windows)

### Option 1: Using Batch Scripts (Easiest!)

1. **Start Backend** (First Terminal)
   - Double-click `start_backend.bat`
   - Or open terminal and run:
     ```bash
     cd sentiment-app
     start_backend.bat
     ```
   - Wait until you see "Uvicorn running on http://0.0.0.0:8000"

2. **Start Frontend** (Second Terminal)
   - Double-click `start_frontend.bat`
   - Or open new terminal and run:
     ```bash
     cd sentiment-app
     start_frontend.bat
     ```
   - Wait until you see "Local: http://localhost:5173/"

3. **Open Browser**
   - Go to: http://localhost:5173
   - Allow camera and microphone permissions
   - Click "Start Analysis"

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd sentiment-app\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd sentiment-app\frontend
npm install
npm run dev
```

**Browser:**
Open http://localhost:5173

## First Time Setup (Detailed)

### Backend Setup (~5-10 minutes)

```bash
# 1. Navigate to backend folder
cd C:\Dev\Projects\Sentiment\sentiment-app\backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
venv\Scripts\activate

# You should see (venv) in your prompt

# 4. Upgrade pip
python -m pip install --upgrade pip

# 5. Install dependencies (this will take a few minutes)
pip install -r requirements.txt

# 6. Copy environment file
copy .env.example .env

# 7. Test that everything is installed
python test_imports.py

# 8. Start the server
python main.py
```

**Expected output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
Starting Sentiment Analysis API Server...
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ **Backend is now running!** Keep this terminal open.

### Frontend Setup (~2-5 minutes)

Open a **NEW** terminal:

```bash
# 1. Navigate to frontend folder
cd C:\Dev\Projects\Sentiment\sentiment-app\frontend

# 2. Install dependencies (this will take a few minutes)
npm install

# 3. Start the development server
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

✅ **Frontend is now running!** Keep this terminal open too.

### Open the Application

1. Open your browser
2. Navigate to: **http://localhost:5173**
3. You should see the "Meeting Engagement Monitor" interface

## Verify Everything is Working

### Test Backend
Open http://localhost:8000 in your browser
- Should show: `{"message":"Sentiment Analysis API","version":"0.1.0","status":"running"}`

### Test API Documentation
Open http://localhost:8000/docs
- Should show interactive API documentation (Swagger UI)

### Test Frontend
Open http://localhost:5173
- Should show the application interface
- Should ask for camera/microphone permissions

## Using the Application

1. **Allow Permissions**
   - Browser will ask for camera and microphone access
   - Click "Allow"

2. **Start Analysis**
   - Click the blue "Start Analysis" button
   - You should see:
     - Green "Connected" indicator
     - "Analyzing" badge on video
     - Metrics updating every 5-10 seconds

3. **View Metrics**
   - Overall engagement score
   - Individual participant cards
   - Distribution chart
   - Participation metrics

## Stopping the Application

1. **Stop Frontend**
   - In the frontend terminal, press `Ctrl+C`
   - Confirm with `Y` if prompted

2. **Stop Backend**
   - In the backend terminal, press `Ctrl+C`
   - Confirm with `Y` if prompted

## Next Time You Start

You don't need to reinstall everything! Just:

**Backend:**
```bash
cd sentiment-app\backend
venv\Scripts\activate
python main.py
```

**Frontend:**
```bash
cd sentiment-app\frontend
npm run dev
```

Or simply run the batch scripts:
- `start_backend.bat`
- `start_frontend.bat`

## Troubleshooting

### Problem: "python: command not found"
- **Solution:** Install Python from python.org
- Make sure to check "Add Python to PATH" during installation

### Problem: "npm: command not found"
- **Solution:** Install Node.js from nodejs.org

### Problem: Backend won't start - "ModuleNotFoundError"
- **Solution:** Make sure virtual environment is activated and run:
  ```bash
  pip install -r requirements.txt
  ```

### Problem: Port already in use
- **Solution:**
  - Kill the process using that port
  - Or change the port in `.env` file

### Problem: Frontend shows "Cannot connect"
- **Solution:** Make sure backend is running on port 8000
- Check http://localhost:8000 works

### Problem: No camera/microphone access
- **Solution:**
  - Check browser permissions
  - Must use http://localhost (not 127.0.0.1 or IP)
  - Try a different browser (Chrome recommended)

For more troubleshooting, see **TROUBLESHOOTING.md**

## What to Expect

### First Run
- Models will download automatically (takes 2-5 minutes)
- Total download size: ~250 MB
- After first run, models are cached locally

### Performance
- Frame analysis: Every 5 seconds
- Metrics update: 5-10 second delay
- Works on CPU (slower) or GPU (faster)

### Supported Browsers
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari (macOS)
- ❌ Internet Explorer

## Resources

- **API Documentation:** http://localhost:8000/docs
- **Setup Guide:** See SETUP_GUIDE.md
- **Troubleshooting:** See TROUBLESHOOTING.md
- **Project Details:** See PROJECT_SUMMARY.md

## Quick Commands Reference

```bash
# Backend
cd sentiment-app\backend
venv\Scripts\activate          # Activate virtual env
python main.py                 # Start server
python test_imports.py         # Test dependencies

# Frontend
cd sentiment-app\frontend
npm install                    # Install dependencies
npm run dev                    # Start dev server
npm run build                  # Build for production

# Useful
netstat -ano | findstr :8000   # Check what's using port 8000
tasklist | findstr python      # See Python processes
```

---

**That's it! You're ready to go!** 🚀

If you run into any issues, check TROUBLESHOOTING.md or the error messages in your terminal.
