@echo off
echo 🚀 STUDYSPOT MOBILE APP - EXPO TESTING
echo ======================================

echo.
echo Step 1: Installing dependencies...
npm install --legacy-peer-deps

echo.
echo Step 2: Installing Expo CLI globally...
npm install -g @expo/cli

echo.
echo Step 3: Starting Expo web testing...
echo.
echo 🌐 Your StudySpot app will open in the browser at: http://localhost:8081
echo 📱 You can also scan the QR code with Expo Go app on your phone
echo.
echo Press Ctrl+C to stop the server when done testing
echo.

npx expo start --web

pause












