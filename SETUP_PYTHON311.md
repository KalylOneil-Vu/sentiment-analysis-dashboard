# Python 3.11 Setup Guide

## Why Python 3.11?

The full ML stack (MediaPipe, DeepFace, Whisper) requires Python 3.11 or lower. Python 3.13 is too new and not yet supported.

## Installation Steps

### Option 1: Install Python 3.11 (Recommended)

1. **Download Python 3.11:**
   - Go to: https://www.python.org/downloads/
   - Find Python 3.11.9 (latest 3.11 version)
   - Download Windows installer (64-bit)

2. **Install Python 3.11:**
   - Run the installer
   - ✅ **IMPORTANT:** Check "Add python.exe to PATH"
   - Choose "Customize installation"
   - Select "Install for all users" (optional)
   - Set custom install location (recommended): `C:\Python311`
   - Complete installation

3. **Verify Installation:**
   ```bash
   py -3.11 --version
   # Should show: Python 3.11.9
   ```

### Option 2: Use py launcher (if already installed)

If you have Python launcher, you can install 3.11 alongside 3.13:

```bash
# Check available Python versions
py --list

# If 3.11 isn't listed, install from python.org
```

## Create New Virtual Environment with Python 3.11

Once Python 3.11 is installed:

```bash
# Navigate to project
cd C:\Dev\Projects\Sentiment\sentiment-app

# Create new backend directory for clean rebuild
mkdir backend-v2
cd backend-v2

# Create virtual environment with Python 3.11
py -3.11 -m venv venv

# Activate it
venv\Scripts\activate

# Verify correct Python version
python --version
# Should show: Python 3.11.x

# Upgrade pip
python -m pip install --upgrade pip
```

## Install Full ML Stack

With Python 3.11 virtual environment activated:

```bash
# Install dependencies (will take 10-15 minutes)
pip install -r requirements_full.txt
```

## Troubleshooting

### "py -3.11" not found
- Python 3.11 not installed
- Download from python.org
- Make sure to check "Add to PATH"

### Multiple Python versions conflict
```bash
# Use specific Python path
C:\Python311\python.exe -m venv venv
```

### Permission errors
- Run terminal as Administrator
- Or install Python for current user only

### Package installation fails
```bash
# Try installing with --user flag
pip install --user package-name

# Or upgrade setuptools
pip install --upgrade setuptools wheel
```

## Next Steps

After Python 3.11 is installed and dependencies are ready:

1. Run the backend server:
   ```bash
   python main.py
   ```

2. In separate terminal, run frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open browser to http://localhost:5173

## Alternative: Using Docker

If you prefer not to install Python 3.11 locally, you can use Docker:

```dockerfile
# Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements_full.txt .
RUN pip install -r requirements_full.txt
COPY . .
CMD ["python", "main.py"]
```

```bash
# Build and run
docker build -t sentiment-backend .
docker run -p 8000:8000 sentiment-backend
```

This isolates Python 3.11 environment from your system.
