@echo off
cls
echo.
echo ========================================
echo   StudySpot - Starting All 3 Portals
echo ========================================
echo.
echo Port Configuration (VERIFIED):
echo   Student Portal --^> Port 3000
echo   Owner Portal   --^> Port 3001
echo   Admin Portal   --^> Port 3002
echo.
echo ========================================
echo.

echo [CLEANUP] Killing any existing processes...
echo.

REM Kill any processes on target ports
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3002') do taskkill /F /PID %%a 2>nul

echo Ports cleared!
echo.
timeout /t 3 /nobreak > nul

echo ========================================
echo   Starting Portals Systematically
echo ========================================
echo.

echo [1/3] Starting Student Portal (Port 3000)...
start "StudySpot - Student Portal (3000)" cmd /k "cd /d "%~dp0studyspot-student-pwa" && npm run dev"
echo       Command window opened
echo       Wait for: "Local: http://localhost:3000/"
echo.
timeout /t 10 /nobreak > nul

echo [2/3] Starting Owner Portal (Port 3001)...
start "StudySpot - Owner Portal (3001)" cmd /k "cd /d "%~dp0web-owner" && npm start"
echo       Command window opened
echo       Wait for: "Compiled successfully!"
echo.
timeout /t 10 /nobreak > nul

echo [3/3] Starting Admin Portal (Port 3002)...
start "StudySpot - Admin Portal (3002)" cmd /k "cd /d "%~dp0web-admin-new\frontend" && npm run dev"
echo       Command window opened
echo       Wait for: "Compiled successfully!"
echo.
timeout /t 5 /nobreak > nul

echo ========================================
echo   All Portals Starting Successfully!
echo ========================================
echo.
echo You should now see 3 command windows:
echo.
echo   [1] StudySpot - Student Portal (3000)
echo   [2] StudySpot - Owner Portal (3001)
echo   [3] StudySpot - Admin Portal (3002)
echo.
echo ----------------------------------------
echo   Wait 1-2 minutes for compilation
echo ----------------------------------------
echo.
echo Then open in your browser:
echo.
echo   Student: http://localhost:3000
echo   Owner:   http://localhost:3001
echo   Admin:   http://localhost:3002
echo.
echo ========================================
echo.
echo Press any key to close this window...
pause > nul

