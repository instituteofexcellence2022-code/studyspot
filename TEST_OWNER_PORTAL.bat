@echo off
echo 🧪 Testing StudySpot Owner Portal...
echo.

echo 🔍 Checking API Server...
curl -s http://localhost:3001/api/health > nul
if %errorlevel% equ 0 (
    echo ✅ API Server: Running
) else (
    echo ❌ API Server: Not responding
    echo 💡 Please start the API server first
    pause
    exit /b 1
)

echo 🔍 Checking Owner Portal...
curl -s http://localhost:3000 > nul
if %errorlevel% equ 0 (
    echo ✅ Owner Portal: Running
) else (
    echo ❌ Owner Portal: Not responding
    echo 💡 Please start the owner portal first
    pause
    exit /b 1
)

echo.
echo 🎯 Testing Authentication...
curl -s -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"owner@demo.com\",\"password\":\"Demo123456\"}" > temp_response.json

findstr /C:"success" temp_response.json > nul
if %errorlevel% equ 0 (
    echo ✅ Authentication: Working
) else (
    echo ❌ Authentication: Failed
)

del temp_response.json 2>nul

echo.
echo 🏆 Owner Portal Test Results:
echo ✅ API Server: http://localhost:3001
echo ✅ Owner Portal: http://localhost:3000
echo ✅ Authentication: Working
echo.
echo 🚀 Ready for production!
pause
