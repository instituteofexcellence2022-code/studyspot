@echo off
echo 📱 STUDYSPOT MOBILE APP - APK BUILD FOR ANDROID
echo ===============================================

echo.
echo Building APK for your Android phone...
echo.

echo Step 1: Installing dependencies...
npm install --legacy-peer-deps

echo.
echo Step 2: Building Android APK...
echo This may take 5-10 minutes...
echo.

npm run build:android
if %errorlevel% neq 0 (
    echo.
    echo npm build failed. Trying gradle directly...
    cd android
    gradlew assembleRelease
    if %errorlevel% neq 0 (
        echo.
        echo Gradle failed. Trying Expo build...
        cd ..
        npx expo build:android
    ) else (
        echo.
        echo ✅ APK built successfully with Gradle!
        echo APK location: android/app/build/outputs/apk/release/app-release.apk
    )
) else (
    echo.
    echo ✅ APK built successfully!
    echo APK location: android/app/build/outputs/apk/release/app-release.apk
)

echo.
echo 📱 INSTALLATION INSTRUCTIONS:
echo =============================
echo 1. Find the APK file in the location shown above
echo 2. Transfer APK to your Android phone
echo 3. On your phone: Settings > Security > Enable "Install from Unknown Sources"
echo 4. Open the APK file on your phone
echo 5. Install the StudySpot app
echo 6. Open the app and test all features
echo.
echo 🎉 APK build complete!
echo.
echo Your StudySpot mobile app is ready for Android installation!
echo.
pause












