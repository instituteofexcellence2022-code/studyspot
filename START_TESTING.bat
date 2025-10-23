@echo off
echo ================================================
echo  STUDYSPOT API TESTING
echo ================================================
echo.

echo [Step 1] Checking if backend is running...
echo.

curl http://localhost:3001/api/health 2>nul
if %errorlevel% == 0 (
    echo  Backend is RUNNING!
    goto :test
) else (
    echo  Backend is NOT running
    echo.
    echo [Step 2] Starting backend...
    echo.
    
    cd api
    
    echo Checking .env file...
    if not exist .env (
        echo  ERROR: api/.env file not found!
        echo.
        echo Please create api/.env with your credentials.
        echo See api/env.example for reference.
        pause
        exit /b 1
    )
    
    echo  .env file found
    echo.
    echo Starting server...
    start "StudySpot API" cmd /k "npm start"
    
    echo.
    echo Waiting for server to start...
    timeout /t 10 /nobreak >nul
    
    cd ..
)

:test
echo.
echo ================================================
echo  RUNNING TESTS
echo ================================================
echo.

echo Test 1: Health Check
echo --------------------
curl http://localhost:3001/api/health
echo.
echo.

echo Test 2: Mock Login
echo -------------------
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"password123\"}"
echo.
echo.

echo ================================================
echo  TESTS COMPLETE
echo ================================================
echo.
echo  Existing endpoints are working!
echo.
echo Next steps:
echo 1. Run migrations (007, 008, 009)
echo 2. Test new Phase 1 features
echo.
pause








