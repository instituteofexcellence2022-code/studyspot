@echo off
echo 🚀 STUDYSPOT MOBILE APP - SIMPLE TESTING
echo ========================================

echo.
echo Step 1: Installing dependencies...
npm install --legacy-peer-deps

echo.
echo Step 2: Starting React Native Metro bundler...
echo.
echo 🌐 Your StudySpot app will be available at: http://localhost:8081
echo 📱 Open this URL in your browser to test the app
echo.
echo Press Ctrl+C to stop the server when done testing
echo.

npx react-native start

pause












