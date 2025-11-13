@echo off
echo ========================================
echo   STUDENT PORTAL - STARTING
echo ========================================
echo.
echo Port: 3000
echo URL: http://localhost:3000
echo.
echo Backend: https://studyspot-api.onrender.com
echo Auth: https://studyspot-auth.onrender.com
echo.
echo ========================================

cd studyspot-student-pwa
start http://localhost:3000
npm run dev

pause

