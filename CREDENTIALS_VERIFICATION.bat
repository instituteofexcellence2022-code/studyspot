@echo off
cls
echo.
echo ========================================
echo 🔐 CREDENTIALS VERIFICATION
echo ========================================
echo.

echo 📍 Checking API .env file...
if exist api\.env (
    echo ✅ api\.env exists
    echo.
    echo Content preview:
    findstr /C:"DATABASE_URL" /C:"DB_HOST" /C:"DB_USER" api\.env 2>nul
) else (
    echo ❌ api\.env NOT FOUND!
)
echo.

echo 📍 Checking web-owner .env file...
if exist web-owner\.env (
    echo ✅ web-owner\.env exists
    echo.
    echo Content preview:
    findstr /C:"REACT_APP_API_URL" web-owner\.env 2>nul
) else (
    echo ❌ web-owner\.env NOT FOUND!
    echo Creating web-owner\.env...
    (
        echo REACT_APP_API_URL=http://localhost:3001
        echo REACT_APP_API_TIMEOUT=30000
        echo REACT_APP_PORTAL_TYPE=owner
        echo REACT_APP_PORTAL_NAME=Library Owner Portal
        echo REACT_APP_VERSION=1.0.0
        echo REACT_APP_ENABLE_DEMO=true
        echo REACT_APP_ENABLE_SOCIAL_LOGIN=false
        echo REACT_APP_DEBUG=true
        echo NODE_ENV=development
    ) > web-owner\.env
    echo ✅ Created!
)
echo.

echo 📍 Checking web-admin .env file...
if exist web-admin\.env (
    echo ✅ web-admin\.env exists
    echo.
    echo Content preview:
    findstr /C:"REACT_APP_API_URL" web-admin\.env 2>nul
) else (
    echo ❌ web-admin\.env NOT FOUND!
    echo Creating web-admin\.env...
    (
        echo REACT_APP_API_URL=http://localhost:3001
        echo REACT_APP_API_TIMEOUT=30000
        echo REACT_APP_PORTAL_TYPE=admin
        echo REACT_APP_PORTAL_NAME=Platform Administrator
        echo REACT_APP_VERSION=1.0.0
        echo REACT_APP_ENABLE_DEMO=true
        echo REACT_APP_ENABLE_SOCIAL_LOGIN=false
        echo REACT_APP_DEBUG=true
        echo NODE_ENV=development
    ) > web-admin\.env
    echo ✅ Created!
)
echo.

echo ========================================
echo 📋 DEMO ACCOUNT CREDENTIALS
echo ========================================
echo.
echo Owner Portal:
echo   Email: owner@demo.com
echo   Password: Demo123456
echo   Role: library_owner
echo.
echo Admin Portal:
echo   Email: admin@demo.com
echo   Password: Admin123456
echo   Role: super_admin
echo.

echo ========================================
echo 🔗 API ENDPOINTS
echo ========================================
echo.
echo Local:
echo   API: http://localhost:3001
echo   Owner Portal: http://localhost:3000
echo   Admin Portal: http://localhost:3002
echo.
echo Production:
echo   API: https://studyspot-api.onrender.com
echo   Owner Portal: https://studyspot-owner.vercel.app
echo   Admin Portal: https://studyspot-admin.vercel.app
echo.

echo ========================================
echo ✅ VERIFICATION COMPLETE
echo ========================================
echo.
echo Next steps:
echo 1. Check if API .env has correct database credentials
echo 2. Restart all servers if .env files were created
echo 3. Test demo account login
echo.
pause


