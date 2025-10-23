@echo off
echo.
echo ========================================
echo 🧪 TESTING API CONNECTION
echo ========================================
echo.

echo 📍 Step 1: Testing API Health Endpoint...
echo.
curl http://localhost:3001/health
echo.
echo.

echo 📍 Step 2: Testing API Auth Endpoint (should fail without credentials)...
echo.
curl http://localhost:3001/api/auth/profile
echo.
echo.

echo ========================================
echo 📋 RESULTS:
echo ========================================
echo.
echo If you saw JSON responses above, the API is working! ✅
echo.
echo Next: Open your browser to http://localhost:3000/login
echo       Press Ctrl+Shift+R to hard refresh
echo       Then click "Try Demo Account"
echo.
pause


