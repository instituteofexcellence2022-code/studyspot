@echo off
echo ====================================
echo STARTING LIBRARY OWNER PORTAL
echo ====================================
echo.
echo Port: 3000
echo Theme: Blue
echo Users: Library Owners, Staff
echo.
echo Opening portal...
echo.

cd /d "%~dp0web-owner"
npm start

pause








