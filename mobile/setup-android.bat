@echo off
echo 🚀 StudySpot React Native - Android Setup
echo =========================================

echo 📱 Checking Android Studio installation...

REM Check if Android Studio is installed
if exist "C:\Program Files\Android\Android Studio\bin\studio64.exe" (
    echo ✅ Android Studio found!
) else if exist "C:\Users\%USERNAME%\AppData\Local\Android\Sdk" (
    echo ✅ Android SDK found!
) else (
    echo ❌ Android Studio not found. Please install it first.
    echo 📥 Download from: https://developer.android.com/studio
    pause
    exit /b 1
)

echo.
echo 🔧 Setting up environment variables...

REM Set ANDROID_HOME
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
echo ANDROID_HOME=%ANDROID_HOME%

REM Add to PATH
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
echo PATH updated with Android tools

echo.
echo 📱 Checking React Native setup...

REM Check if we're in mobile directory
if not exist "package.json" (
    echo ❌ Please run this from the mobile directory
    pause
    exit /b 1
)

echo ✅ React Native project found!

echo.
echo 🚀 Next steps:
echo 1. Open Android Studio
echo 2. Go to Tools → SDK Manager
echo 3. Install Android 13 (API 33) or Android 14 (API 34)
echo 4. Go to Tools → AVD Manager
echo 5. Create a new virtual device
echo 6. Run: npx react-native run-android

echo.
echo 📱 For physical device testing:
echo 1. Enable Developer Options on your Android phone
echo 2. Enable USB Debugging
echo 3. Connect phone via USB
echo 4. Run: npx react-native run-android

echo.
echo 🎉 Ready to test your StudySpot app!
pause






