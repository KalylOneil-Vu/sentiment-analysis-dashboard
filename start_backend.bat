@echo off
echo ============================================
echo  Sentiment Analysis - Starting Backend
echo ============================================
echo.

cd backend

echo Checking if virtual environment exists...
if not exist "venv\" (
    echo Virtual environment not found. Creating...
    python -m venv venv
    echo.
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Checking dependencies...
python test_imports.py
if errorlevel 1 (
    echo.
    echo ERROR: Dependencies not installed!
    echo Installing dependencies...
    pip install -r requirements.txt
    echo.
)

echo.
echo ============================================
echo  Starting Backend Server on port 8000
echo ============================================
echo.
echo Backend will be available at: http://localhost:8000
echo API Documentation at: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python main.py

pause
