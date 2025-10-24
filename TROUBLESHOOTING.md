# Troubleshooting Guide - Localhost Not Working

## Quick Diagnostic Steps

### Step 1: Test Backend Dependencies

Navigate to the backend folder and run:

```bash
cd sentiment-app\backend
python test_imports.py
```

This will check if all required Python packages are installed.

### Step 2: Check if Backend is Running

Try to start the backend manually:

```bash
cd sentiment-app\backend

# Activate virtual environment first
venv\Scripts\activate

# Run the server
python main.py
```

**Expected output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Test Backend Connection

Open a new browser tab and visit:
- `http://localhost:8000` - Should show API status
- `http://localhost:8000/docs` - Should show Swagger API documentation
- `http://localhost:8000/health` - Should show health check

### Step 4: Check Frontend

```bash
cd sentiment-app\frontend
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Common Issues & Solutions

### Issue 1: "ModuleNotFoundError" when starting backend

**Solution:**
```bash
# Make sure virtual environment is activated
cd sentiment-app\backend
venv\Scripts\activate

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Issue 2: "Address already in use" - Port 8000 or 5173

**Solution:**

**Windows:**
```bash
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use different port
# Edit backend/.env:
PORT=8001
```

**Alternative - Use different ports:**

Backend (.env):
```bash
PORT=8001
```

Frontend (run with):
```bash
npm run dev -- --port 5174
```

### Issue 3: Virtual environment not created

**Solution:**
```bash
cd sentiment-app\backend

# Create virtual environment
python -m venv venv

# If python command doesn't work, try:
py -m venv venv

# Activate it
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Issue 4: "scipy not found" or "ultralytics errors"

**Solution:**
```bash
# Some packages need specific versions on Windows
pip install scipy
pip install ultralytics --upgrade
```

### Issue 5: Frontend shows "Cannot connect to WebSocket"

**Checklist:**
1. Is backend running? Check `http://localhost:8000`
2. Check browser console for errors (F12)
3. Verify WebSocket URL in frontend

**Fix frontend WebSocket URL:**

Create `frontend/.env`:
```bash
VITE_WS_URL=ws://localhost:8000/ws
```

If using different port:
```bash
VITE_WS_URL=ws://localhost:8001/ws
```

### Issue 6: "npm: command not found"

**Solution:**
Download and install Node.js from https://nodejs.org/
- Use LTS version (18.x or higher)
- Restart terminal after installation

### Issue 7: Camera/Microphone permissions denied

**Solution:**
- Chrome: Settings → Privacy → Camera/Microphone
- Edge: Settings → Cookies and site permissions → Camera/Microphone
- Firefox: about:preferences#privacy → Permissions
- Must use `http://localhost` or HTTPS (not IP address)

### Issue 8: High CPU usage / Slow performance

**Temporary Solution:**
Edit `backend/.env`:
```bash
# Process frames less frequently
FRAME_PROCESSING_INTERVAL=10

# Use smaller Whisper model
WHISPER_MODEL_SIZE=tiny

# Limit max persons
MAX_PERSONS_TO_TRACK=5
```

### Issue 9: "SSL: CERTIFICATE_VERIFY_FAILED" during model downloads

**Solution:**
```bash
# Windows - run as administrator
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt

# Or update certificates
pip install --upgrade certifi
```

## Step-by-Step First Run Guide

### 1. Install Prerequisites

**Python:**
```bash
# Check if installed
python --version

# Should be 3.9 or higher
# If not installed, download from python.org
```

**Node.js:**
```bash
# Check if installed
node --version
npm --version

# Should be Node 18+ and npm 9+
# If not installed, download from nodejs.org
```

### 2. Setup Backend

```bash
# Navigate to backend
cd C:\Dev\Projects\Sentiment\sentiment-app\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# You should see (venv) in your terminal prompt

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies (this may take 5-10 minutes)
pip install -r requirements.txt

# Create environment file
copy .env.example .env

# Test imports
python test_imports.py

# If all tests pass, start the server
python main.py
```

**Leave this terminal running!**

### 3. Setup Frontend (New Terminal)

```bash
# Navigate to frontend
cd C:\Dev\Projects\Sentiment\sentiment-app\frontend

# Install dependencies (this may take 2-5 minutes)
npm install

# Start development server
npm run dev
```

### 4. Access the Application

Open browser and go to:
```
http://localhost:5173
```

## Still Not Working?

### Collect Debug Information

Run these commands and share the output:

```bash
# Python version
python --version

# Node version
node --version

# Check if ports are available
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Check Python packages
pip list

# Backend logs
cd sentiment-app\backend
python main.py
# Copy any error messages
```

### Minimal Test Server

If the full application won't start, try this minimal test:

Create `backend/test_server.py`:
```python
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Server is working!"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

Run it:
```bash
python test_server.py
```

Visit `http://localhost:8000` - Should show the message.

### Reset Everything

If all else fails, start fresh:

```bash
# Delete virtual environment
cd sentiment-app\backend
rmdir /s venv

# Delete node_modules
cd ..\frontend
rmdir /s node_modules
del package-lock.json

# Start setup from scratch
cd ..\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

cd ..\frontend
npm install
```

## Contact Points

If you're still stuck:

1. **Check the error message carefully** - It usually tells you what's wrong
2. **Look at backend terminal** - Shows detailed Python errors
3. **Check browser console** (F12) - Shows frontend JavaScript errors
4. **Verify all prerequisites are installed** - Python 3.9+, Node 18+

## Quick Reference

**Backend URL:** http://localhost:8000
**Frontend URL:** http://localhost:5173
**API Docs:** http://localhost:8000/docs

**Start Backend:**
```bash
cd sentiment-app\backend
venv\Scripts\activate
python main.py
```

**Start Frontend:**
```bash
cd sentiment-app\frontend
npm run dev
```
