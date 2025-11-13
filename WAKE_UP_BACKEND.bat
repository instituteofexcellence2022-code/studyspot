@echo off
echo ========================================
echo   WAKING UP BACKEND SERVICES
echo ========================================
echo.
echo This will wake up Render services if they're sleeping...
echo Please wait 30-60 seconds for first response.
echo.
echo ========================================

echo.
echo [1/3] Waking up API Gateway...
powershell -Command "try { Invoke-WebRequest -Uri 'https://studyspot-api.onrender.com/health' -TimeoutSec 60 | Out-Null; Write-Host 'API Gateway: AWAKE' -ForegroundColor Green } catch { Write-Host 'API Gateway: Still waking up...' -ForegroundColor Yellow }"

echo.
echo [2/3] Waking up Auth Service...
powershell -Command "try { Invoke-WebRequest -Uri 'https://studyspot-auth.onrender.com/health' -TimeoutSec 60 | Out-Null; Write-Host 'Auth Service: AWAKE' -ForegroundColor Green } catch { Write-Host 'Auth Service: Still waking up...' -ForegroundColor Yellow }"

echo.
echo [3/3] Testing with database check...
powershell -Command "try { Invoke-WebRequest -Uri 'https://studyspot-auth.onrender.com/health?checkDb=true' -TimeoutSec 60 | Out-Null; Write-Host 'Database: CONNECTED' -ForegroundColor Green } catch { Write-Host 'Database: Check failed' -ForegroundColor Yellow }"

echo.
echo ========================================
echo   BACKEND SERVICES STATUS
echo ========================================
echo.
echo All services should now be awake and ready!
echo.
echo You can now:
echo 1. Start the student portal (START_STUDENT_PORTAL.bat)
echo 2. Test authentication (TEST_STUDENT_AUTH.html)
echo.
echo ========================================

pause

