@echo off
echo ====================================
echo STARTING PLATFORM ADMIN PORTAL
echo ====================================
echo.
echo Port: 3002
echo Theme: Red
echo Users: Super Admins
echo.
echo Opening portal...
echo.

cd /d "%~dp0web-admin"
set PORT=3002
npm start

pause






