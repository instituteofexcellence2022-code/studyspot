@echo off
echo ========================================
echo 🎓 STUDYSPOT - Starting Servers
echo ========================================

echo Starting API Server...
start "API Server" cmd /k "cd api && node src/index-simple.js"

echo Waiting 5 seconds...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd web-owner && npm start"

echo ========================================
echo ✅ Both servers are starting...
echo API Server: http://localhost:3001
echo Frontend: http://localhost:3000
echo ========================================
echo Opening browser...
start http://localhost:3000

pause


