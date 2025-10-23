@echo off
cls
echo.
echo ========================================
echo 🔧 CREATING ENVIRONMENT FILES
echo ========================================
echo.

echo 📍 Creating web-owner/.env...
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

echo ✅ Owner Portal .env created!
echo.

echo 📍 Creating web-admin/.env...
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

echo ✅ Admin Portal .env created!
echo.

echo ========================================
echo ✅ ENVIRONMENT FILES CREATED
echo ========================================
echo.
echo Next steps:
echo 1. Stop all running servers
echo 2. Clear cache: rmdir /s web-owner\node_modules\.cache
echo 3. Start Owner Portal: cd web-owner && npm start
echo 4. Start Admin Portal: cd web-admin && npm start
echo.
pause


