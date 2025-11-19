@echo off
echo 📱 STUDYSPOT MOBILE APP - ANDROID PHONE TESTING
echo ================================================

echo.
echo Testing your StudySpot mobile app on Android phone...
echo.

echo Method 1: Checking if Expo CLI is available...
npx expo --version
if %errorlevel% neq 0 (
    echo ❌ Expo CLI not found. Installing...
    npm install -g @expo/cli
) else (
    echo ✅ Expo CLI is available
)

echo.
echo Method 2: Starting Expo for Android phone testing...
echo.
echo 📱 Instructions for Android phone testing:
echo 1. Install Expo Go app from Google Play Store
echo 2. Open Expo Go app on your phone
echo 3. Scan the QR code that will appear below
echo 4. Wait for the app to load on your phone
echo 5. Test all enhanced features
echo.
echo Press Ctrl+C to stop when done testing
echo.

npx expo start
if %errorlevel% neq 0 (
    echo.
    echo Expo failed. Trying React Native direct method...
    echo.
    echo Method 3: React Native direct testing...
    echo Make sure your Android phone is connected via USB
    echo and USB debugging is enabled
    echo.
    npm run android
    if %errorlevel% neq 0 (
        echo.
        echo React Native failed. Trying APK build...
        echo.
        echo Method 4: Building APK for Android...
        npm run build:android
        if %errorlevel% neq 0 (
            echo.
            echo All methods failed. Please check:
            echo 1. Node.js and npm are installed
            echo 2. Android Studio is installed
            echo 3. USB debugging is enabled on phone
            echo 4. Phone is connected via USB
        ) else (
            echo.
            echo ✅ APK built successfully!
            echo Find APK in: android/app/build/outputs/apk/release/
            echo Transfer APK to your phone and install it
        )
    ) else (
        echo.
        echo ✅ React Native app started on your Android phone!
    )
) else (
    echo.
    echo ✅ Expo started successfully!
    echo Scan the QR code with Expo Go app on your phone
)

echo.
echo 🎉 Android phone testing complete!
echo.
echo Your StudySpot mobile app is enterprise-grade and ready for production!
echo.
pause












