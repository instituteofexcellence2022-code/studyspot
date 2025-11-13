@echo off
echo ========================================
echo Killing Old Processes
echo ========================================

REM Kill processes on ports
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3002') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /F /PID %%a 2>nul

echo All ports cleared!
echo.
timeout /t 2 /nobreak > nul

echo ========================================
echo Starting Portals One by One
echo ========================================
echo.

echo [1/3] Starting Student Portal on Port 3000...
start "Student Portal (3000)" cmd /k "cd studyspot-student-pwa && set PORT=3000 && npm run dev"
echo     Waiting for Student Portal to initialize...
timeout /t 10 /nobreak > nul
echo     Student Portal window opened!
echo.

echo [2/3] Starting Owner Portal on Port 3001...
start "Owner Portal (3001)" cmd /k "cd web-owner && set PORT=3001 && npm start"
echo     Waiting for Owner Portal to initialize...
timeout /t 10 /nobreak > nul
echo     Owner Portal window opened!
echo.

echo [3/3] Starting Admin Portal on Port 3002...
start "Admin Portal (3002)" cmd /k "cd web-admin-new/frontend && npm run dev"
echo     Waiting for Admin Portal to initialize...
timeout /t 10 /nobreak > nul
echo     Admin Portal window opened!
echo.

echo ========================================
echo ALL PORTALS STARTING!
echo ========================================
echo.
echo You should now see 3 command windows open.
echo Wait 1-2 minutes for compilation.
echo.
echo URLs to open in browser:
echo   [1] Student: http://localhost:3000
echo   [2] Owner:   http://localhost:3001
echo   [3] Admin:   http://localhost:3002
echo.
echo ========================================
echo.
echo Press any key to close this window...
pause > nul


