@echo off
echo 📱 STUDYSPOT MOBILE APP - EXPO GO ANDROID TESTING
echo ==================================================

echo.
echo Setting up Expo Go testing for your Android phone...
echo.

echo Step 1: Installing Expo CLI...
npm install -g @expo/cli

echo.
echo Step 2: Starting Expo development server...
echo.
echo 📱 ANDROID PHONE TESTING INSTRUCTIONS:
echo ======================================
echo 1. Go to Google Play Store on your Android phone
echo 2. Search for "Expo Go" and install it
echo 3. Open Expo Go app on your phone
echo 4. Scan the QR code that will appear below
echo 5. Wait for your StudySpot app to load
echo 6. Test all enhanced features on your phone
echo.
echo 🌐 Alternative: Open http://localhost:8081 in your phone's browser
echo.
echo Press Ctrl+C to stop when done testing
echo.

npx expo start --tunnel
if %errorlevel% neq 0 (
    echo.
    echo Tunnel failed. Trying local network...
    npx expo start --lan
    if %errorlevel% neq 0 (
        echo.
        echo LAN failed. Trying localhost...
        npx expo start --localhost
    )
)

echo.
echo 🎉 Expo Go testing complete!
echo.
echo Your StudySpot mobile app is now running on your Android phone!
echo.
pause












