@echo off
echo ============================================
echo STUDYSPOT BACKEND - START ALL SERVICES
echo ============================================
echo.

echo Starting services...
echo.

REM Start API Gateway (Port 3000)
start cmd /k "cd /d %~dp0 && echo Starting API Gateway (Port 3000)... && npm run start:gateway"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Auth Service (Port 3001)
start cmd /k "cd /d %~dp0 && echo Starting Auth Service (Port 3001)... && npm run start:auth"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start User Service (Port 3002)
start cmd /k "cd /d %~dp0 && echo Starting User Service (Port 3002)... && npm run start:user"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Tenant Service (Port 3003)
start cmd /k "cd /d %~dp0 && echo Starting Tenant Service (Port 3003)... && npm run start:tenant"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Student Service (Port 3004)
start cmd /k "cd /d %~dp0 && echo Starting Student Service (Port 3004)... && npm run start:student"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Library Service (Port 3005)
start cmd /k "cd /d %~dp0 && echo Starting Library Service (Port 3005)... && npm run start:library"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Payment Service (Port 3006)
start cmd /k "cd /d %~dp0 && echo Starting Payment Service (Port 3006)... && npm run start:payment"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Credit Service (Port 3008)
start cmd /k "cd /d %~dp0 && echo Starting Credit Service (Port 3008)... && npm run start:credit"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Subscription Service (Port 3009)
start cmd /k "cd /d %~dp0 && echo Starting Subscription Service (Port 3009)... && npm run start:subscription"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Messaging Service (Port 3011)
start cmd /k "cd /d %~dp0 && echo Starting Messaging Service (Port 3011)... && npm run start:messaging"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Start Analytics Service (Port 3013)
start cmd /k "cd /d %~dp0 && echo Starting Analytics Service (Port 3013)... && npm run start:analytics"

echo.
echo ============================================
echo All services started!
echo ============================================
echo.
echo API Gateway:         http://localhost:3000
echo Auth Service:        http://localhost:3001
echo User Service:        http://localhost:3002
echo Tenant Service:      http://localhost:3003
echo Student Service:     http://localhost:3004
echo Library Service:     http://localhost:3005
echo Payment Service:     http://localhost:3006
echo Credit Service:      http://localhost:3008
echo Subscription Service: http://localhost:3009
echo Messaging Service:   http://localhost:3011
echo Analytics Service:   http://localhost:3013
echo.
echo Total: 11 microservices running!
echo.
echo Press any key to continue...
pause >nul

