@echo off
echo 🚀 Starting StudySpot Owner Portal...
echo.

echo 📦 Starting API Server...
start "API Server" cmd /k "cd api && npm start"

echo ⏳ Waiting for API to start...
timeout /t 5 /nobreak > nul

echo 🏢 Starting Owner Portal...
start "Owner Portal" cmd /k "cd web-owner && npm start"

echo.
echo ✅ Owner Portal is starting up!
echo 🌐 Owner Portal: http://localhost:3000
echo 🔧 API Server: http://localhost:3001
echo.
echo 📋 Demo Credentials:
echo    Email: owner@demo.com
echo    Password: Demo123456
echo.
pause