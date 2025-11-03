@echo off
echo 📱 STUDYSPOT MOBILE APP - ANDROID APK BUILD
echo ===========================================

echo.
echo Checking prerequisites...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm first.
    pause
    exit /b 1
)
echo ✅ npm found

REM Check if we're in the mobile directory
if not exist package.json (
    echo ❌ Not in mobile directory. Please run this from the mobile folder.
    pause
    exit /b 1
)
echo ✅ In mobile directory

echo.
echo Installing dependencies...
npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo Checking for Android build options...

REM Check if Expo CLI is available
npx expo --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Expo CLI available
    echo.
    echo 🚀 Building APK with Expo...
    npx expo build:android --type apk
    if %errorlevel% equ 0 (
        echo ✅ APK build successful!
        echo 📱 APK will be available in Expo dashboard
        pause
        exit /b 0
    ) else (
        echo ❌ Expo build failed
    )
)

REM Check if React Native CLI is available
npx react-native --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ React Native CLI available
    echo.
    echo 🚀 Building APK with React Native...
    
    REM Check if Android directory exists
    if exist android (
        echo ✅ Android directory found
        cd android
        call gradlew assembleRelease
        if %errorlevel% equ 0 (
            echo ✅ APK build successful!
            echo 📱 APK location: android\app\build\outputs\apk\release\app-release.apk
            pause
            exit /b 0
        ) else (
            echo ❌ Gradle build failed
        )
    ) else (
        echo ❌ Android directory not found
    )
)

echo.
echo ❌ No suitable build method found
echo.
echo Please choose one of the following options:
echo.
echo 1. Install Android Studio and set up Android SDK
echo 2. Use Expo build service (requires Expo account)
echo 3. Use EAS build service (cloud build)
echo.
echo For quick setup, run:
echo   npm install -g @expo/cli
echo   npx expo build:android
echo.
pause












