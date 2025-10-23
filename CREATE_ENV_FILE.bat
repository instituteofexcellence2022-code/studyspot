@echo off
echo Creating .env file for Owner Portal...
(
echo REACT_APP_API_URL=http://localhost:3001
echo REACT_APP_PORTAL_TYPE=owner
echo REACT_APP_PORTAL_NAME=Library Owner Portal
echo REACT_APP_VERSION=1.0.0
echo NODE_ENV=development
) > web-owner\.env

echo.
echo ✅ .env file created!
echo.
echo Now RESTART the Owner Portal:
echo 1. Stop the current server (Ctrl+C)
echo 2. Run: cd web-owner
echo 3. Run: npm start
echo.
pause


