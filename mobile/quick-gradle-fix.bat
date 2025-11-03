@echo off
echo 🔧 STUDYSPOT MOBILE APP - QUICK GRADLE FIX
echo ===========================================

echo.
echo Quick fix for Gradle build issues...
echo.

echo Step 1: Stopping Gradle daemon...
cd android
gradlew --stop
cd ..

echo.
echo Step 2: Cleaning Gradle cache...
cd android
gradlew clean
cd ..

echo.
echo Step 3: Fixing permissions...
cd android
gradlew wrapper --gradle-version=8.0
cd ..

echo.
echo Step 4: Testing build...
npm run android
if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed. Trying Expo build...
    npx expo build:android
    if %errorlevel% neq 0 (
        echo.
        echo ❌ Expo build failed. Trying React Native CLI...
        npx react-native run-android
    ) else (
        echo.
        echo ✅ Expo build successful!
    )
) else (
    echo.
    echo ✅ Android build successful!
)

echo.
echo 🎉 Quick Gradle fix complete!
echo.
pause












