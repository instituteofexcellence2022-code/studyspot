@echo off
echo ========================================
echo STUDYSPOT - QUICK TEST
echo ========================================
echo.

echo Starting API Server...
start "API" cmd /c "cd api && node src/index-unified.js && pause"

echo Waiting 5 seconds...
timeout /t 5 /nobreak >nul

echo Testing API...
powershell -Command "try { $r = Invoke-WebRequest 'http://localhost:3001/health' -TimeoutSec 5; Write-Host 'API: OK -' $r.StatusCode } catch { Write-Host 'API: FAILED' }"

echo.
echo Starting Owner Portal...
start "Owner" cmd /c "cd web-owner && npm start && pause"

echo.
echo Starting Admin Portal...
start "Admin" cmd /c "cd web-admin && npm start && pause"

echo.
echo ========================================
echo SERVERS STARTED!
echo ========================================
echo.
echo Test URLs:
echo - API: http://localhost:3001/health
echo - Owner: http://localhost:3000
echo - Admin: http://localhost:3002
echo.
echo Demo Login:
echo - Owner: owner@demo.com / Demo123456
echo - Admin: admin@demo.com / Admin123456
echo.
echo Press any key to open URLs...
pause

start http://localhost:3001/health
start http://localhost:3000
start http://localhost:3002

echo.
echo Testing complete! Check the opened browser windows.
pause
