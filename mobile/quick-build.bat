@echo off
echo 🚀 STUDYSPOT MOBILE APP - EXPO BUILD
echo ====================================

echo.
echo Step 1: Installing Expo CLI...
npm install -g @expo/cli

if %errorlevel% neq 0 (
    echo ❌ Failed to install Expo CLI
    echo Trying alternative method...
    npm install -g expo-cli
)

echo.
echo Step 2: Building Android APK...
npx expo build:android --type apk

if %errorlevel% equ 0 (
    echo.
    echo ✅ APK build successful!
    echo 📱 Check Expo dashboard for download link
) else (
    echo.
    echo ❌ Build failed. Trying alternative...
    npx expo build:android
)

echo.
echo Press any key to exit...
pause >nul












