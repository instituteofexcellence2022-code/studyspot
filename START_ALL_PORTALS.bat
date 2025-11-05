@echo off
echo ========================================
echo Starting All Three StudySpot Portals
echo ========================================
echo.

echo [1/3] Starting Student Portal (Port 5173)...
start cmd /k "cd studyspot-student-pwa && npm run dev"
timeout /t 3 /nobreak > nul

echo [2/3] Starting Owner Portal (Port 3000)...
start cmd /k "cd web-owner && npm start"
timeout /t 3 /nobreak > nul

echo [3/3] Starting Admin Portal (Port 3005)...
start cmd /k "cd web-admin-new/frontend && npm start"
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo All portals are starting!
echo ========================================
echo.
echo Student Portal: http://localhost:5173
echo Owner Portal:   http://localhost:3000
echo Admin Portal:   http://localhost:3005
echo.
echo Press any key to close this window...
pause > nul

