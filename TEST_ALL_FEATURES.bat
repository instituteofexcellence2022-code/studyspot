@echo off
echo ========================================
echo STUDYSPOT PLATFORM - COMPREHENSIVE TEST
echo ========================================
echo.

echo [1/6] Starting API Server...
start "API Server" cmd /k "cd api && npm start"
timeout /t 5 /nobreak >nul

echo [2/6] Starting Owner Portal...
start "Owner Portal" cmd /k "cd web-owner && npm start"
timeout /t 5 /nobreak >nul

echo [3/6] Starting Admin Portal...
start "Admin Portal" cmd /k "cd web-admin && npm start"
timeout /t 5 /nobreak >nul

echo [4/6] Waiting for servers to initialize...
timeout /t 30 /nobreak >nul

echo [5/6] Testing API Connection...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/health' -TimeoutSec 10; Write-Host 'API Status:' $response.StatusCode } catch { Write-Host 'API Error:' $_.Exception.Message }"

echo [6/6] Opening test URLs...
start http://localhost:3000
start http://localhost:3002
start http://localhost:3001/health

echo.
echo ========================================
echo TESTING COMPLETE!
echo ========================================
echo.
echo URLs to test:
echo - Owner Portal: http://localhost:3000
echo - Admin Portal: http://localhost:3002  
echo - API Health: http://localhost:3001/health
echo.
echo Demo Credentials:
echo Owner Portal: owner@demo.com / Demo123456
echo Admin Portal: admin@demo.com / Admin123456
echo.
pause
