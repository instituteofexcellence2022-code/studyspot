@echo off
echo ========================================
echo Cleaning Up Previous Processes
echo ========================================
echo.

echo Killing processes on ports 3000, 3001, 3002...
echo.

REM Kill process on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %%a 2>nul
echo [✓] Port 3000 cleared

REM Kill process on port 3001
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /F /PID %%a 2>nul
echo [✓] Port 3001 cleared

REM Kill process on port 3002
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3002') do taskkill /F /PID %%a 2>nul
echo [✓] Port 3002 cleared

REM Kill process on port 5173 (default Vite port)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /F /PID %%a 2>nul
echo [✓] Port 5173 cleared

echo.
echo ========================================
echo Starting All Portals Fresh
echo ========================================
echo.
timeout /t 2 /nobreak > nul

echo [1/3] Starting Student Portal on Port 3000...
start "Student Portal (3000)" cmd /k "cd studyspot-student-pwa && set PORT=3000 && npm run dev"
timeout /t 8 /nobreak > nul
echo     ✓ Student Portal starting...
echo.

echo [2/3] Starting Owner Portal on Port 3001...
start "Owner Portal (3001)" cmd /k "cd web-owner && npm run dev"
timeout /t 8 /nobreak > nul
echo     ✓ Owner Portal starting...
echo.

echo [3/3] Starting Admin Portal on Port 3002...
start "Admin Portal (3002)" cmd /k "cd web-admin-new && npm run dev"
timeout /t 8 /nobreak > nul
echo     ✓ Admin Portal starting...
echo.

echo ========================================
echo All Portals Started Successfully!
echo ========================================
echo.
echo Wait 1-2 minutes for compilation to complete
echo.
echo Access URLs:
echo   [1] Student Portal: http://localhost:3000
echo   [2] Owner Portal:   http://localhost:3001
echo   [3] Admin Portal:   http://localhost:3002
echo.
echo ========================================
echo.
echo Press any key to close this window...
pause > nul


