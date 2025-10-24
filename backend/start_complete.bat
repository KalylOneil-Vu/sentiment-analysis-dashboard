@echo off
echo ============================================
echo  Sentiment Analysis - Complete Backend
echo ============================================
echo.
echo Features:
echo  - FastVLM keyword processing
echo  - DeepFace emotion recognition
echo  - Whisper speech analysis
echo  - Combined engagement scoring
echo.

cd %~dp0

echo Activating Python 3.11 environment...
call venv\Scripts\activate.bat

echo.
echo Starting server...
echo.

python main_complete.py

pause
