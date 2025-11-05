@echo off
echo ========================================
echo Starting All Three StudySpot Portals
echo ========================================
echo.
echo Systematic startup sequence:
echo - Student Portal: Port 3000
echo - Owner Portal:   Port 3001
echo - Admin Portal:   Port 3002
echo.
echo ========================================
echo.

echo [1/3] Starting Student Portal on Port 3000...
start "Student Portal (3000)" cmd /k "cd studyspot-student-pwa && set PORT=3000 && npm run dev"
timeout /t 5 /nobreak > nul
echo     Student Portal starting at http://localhost:3000
echo.

echo [2/3] Starting Owner Portal on Port 3001...
start "Owner Portal (3001)" cmd /k "cd web-owner && npm run dev"
timeout /t 5 /nobreak > nul
echo     Owner Portal starting at http://localhost:3001
echo.

echo [3/3] Starting Admin Portal on Port 3002...
start "Admin Portal (3002)" cmd /k "cd web-admin-new && npm run dev"
timeout /t 5 /nobreak > nul
echo     Admin Portal starting at http://localhost:3002
echo.

echo ========================================
echo All portals are starting!
echo ========================================
echo.
echo Wait 30-60 seconds for all portals to fully load
echo.
echo Access URLs:
echo   Student Portal: http://localhost:3000
echo   Owner Portal:   http://localhost:3001
echo   Admin Portal:   http://localhost:3002
echo.
echo ========================================
echo.
echo Press any key to close this window...
pause > nul

