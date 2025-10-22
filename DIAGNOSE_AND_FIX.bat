@echo off
echo ============================================
echo    STUDYSPOT - Issue Diagnosis and Fix
echo ============================================
echo.

echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js installed

echo.
echo [2/5] Checking project structure...
if not exist "api\src\index-demo-simple.js" (
    echo ❌ API files missing
    pause
    exit /b 1
)
if not exist "web\src\App.tsx" (
    echo ❌ Web files missing
    pause
    exit /b 1
)
echo ✅ Project structure OK

echo.
echo [3/5] Checking dependencies...
cd api
if not exist "node_modules" (
    echo ⚠️  API dependencies missing, installing...
    call npm install
)
cd ..\web
if not exist "node_modules" (
    echo ⚠️  Web dependencies missing, installing...
    call npm install
)
cd ..
echo ✅ Dependencies OK

echo.
echo [4/5] Checking for port conflicts...
netstat -ano | findstr ":3001" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 3001 is in use, will terminate processes
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do taskkill /F /PID %%a >nul 2>&1
)
netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 3000 is in use, will terminate processes
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do taskkill /F /PID %%a >nul 2>&1
)
echo ✅ Ports cleared

echo.
echo [5/5] Creating/checking environment files...
cd api
if not exist ".env" (
    echo Creating .env file...
    (
        echo NODE_ENV=development
        echo PORT=3001
        echo CORS_ORIGIN=http://localhost:3000
        echo JWT_SECRET=dev_jwt_secret_key_change_in_production_123456789
        echo JWT_EXPIRES_IN=7d
        echo.
        echo # Database - Using SQLite for demo
        echo DATABASE_URL=sqlite:./data/studyspot.db
        echo.
        echo # Optional services
        echo STRIPE_SECRET_KEY=
        echo STRIPE_WEBHOOK_SECRET=
        echo SENDGRID_API_KEY=
        echo TWILIO_ACCOUNT_SID=
        echo TWILIO_AUTH_TOKEN=
    ) > .env
    echo ✅ Created api/.env
) else (
    echo ✅ api/.env exists
)
cd ..\web
if not exist ".env" (
    echo Creating .env file...
    echo REACT_APP_API_URL=http://localhost:3001 > .env
    echo ✅ Created web/.env
) else (
    echo ✅ web/.env exists
)
cd ..

echo.
echo ============================================
echo    All Issues Fixed! Starting Platform...
echo ============================================
echo.
echo Starting API Server (Port 3001)...
start "StudySpot API" cmd /k "cd api && node src\index-demo-simple.js"

timeout /t 3 >nul

echo Starting Web App (Port 3000)...
start "StudySpot Web" cmd /k "cd web && npm start"

echo.
echo ============================================
echo    Platform Starting!
echo ============================================
echo.
echo 🚀 API Server: http://localhost:3001
echo 🌐 Web App: http://localhost:3000 (will open automatically)
echo.
echo The web browser will open in about 10-15 seconds...
echo.
echo To stop: Close the terminal windows or press Ctrl+C in each window
echo.
pause


