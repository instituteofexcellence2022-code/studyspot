@echo off
cls
echo ========================================
echo   STUDYSPOT - QUICK START (DEMO MODE)
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Stopping any running servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo [2/3] Starting API Server (Demo Mode)...
cd api
start "StudySpot API" cmd /k "echo Starting API Server... && node src/index-demo-simple.js"
cd ..
timeout /t 3 >nul

echo [3/3] Starting Web App...
cd web
start "StudySpot Web" cmd /k "echo Starting Web App... && npm start"
cd ..

echo.
echo ========================================
echo SERVERS STARTING!
echo ========================================
echo.
echo API Server will be at:  http://localhost:3001
echo Web App will be at:     http://localhost:3000
echo.
echo Wait 30 seconds for web app to compile...
echo Then open: http://localhost:3000
echo.
echo Press any key to open browser automatically...
pause >nul

timeout /t 5 >nul
start http://localhost:3000

echo.
echo ========================================
echo Both servers are running!
echo ========================================
echo.
echo To stop servers: Close the cmd windows
echo Or press Ctrl+C in each window
echo.
pause


