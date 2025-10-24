@echo off
echo ============================================
echo  Sentiment Analysis - Starting Frontend
echo ============================================
echo.

cd frontend

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo Dependencies not found. Installing...
    echo This may take a few minutes...
    npm install
    echo.
)

echo.
echo ============================================
echo  Starting Frontend Server
echo ============================================
echo.
echo Frontend will be available at: http://localhost:5173
echo.
echo Make sure the backend is running on port 8000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
