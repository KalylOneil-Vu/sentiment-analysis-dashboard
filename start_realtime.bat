@echo off
echo ============================================
echo  Sentiment Analysis - REAL-TIME MODE
echo ============================================
echo.
echo This version analyzes ACTUAL video data!
echo Using OpenCV for face, eye, and smile detection
echo.

cd backend

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo ============================================
echo  Starting Real-Time Backend Server
echo ============================================
echo.
echo Features:
echo  - Real face detection
echo  - Eye detection (attention tracking)
echo  - Smile detection (emotion)
echo  - Position analysis (posture)
echo.
echo Server will be available at: http://localhost:8000
echo.

python main_realtime.py

pause
