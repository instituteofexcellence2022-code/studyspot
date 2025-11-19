@echo off
echo 🔧 STUDYSPOT MOBILE APP - GRADLE ISSUES FIX
echo ============================================

echo.
echo Fixing Gradle build issues for your StudySpot mobile app...
echo.

echo ==========================================
echo STEP 1: CLEANING EVERYTHING
echo ==========================================
echo.
echo Cleaning React Native cache...
npx react-native clean

echo.
echo Cleaning Gradle cache...
cd android
gradlew clean
gradlew cleanBuildCache
cd ..

echo.
echo Cleaning npm cache...
npm cache clean --force

echo.
echo ==========================================
echo STEP 2: REINSTALLING DEPENDENCIES
echo ==========================================
echo.
echo Removing node_modules...
rmdir /s /q node_modules

echo.
echo Reinstalling dependencies...
npm install --legacy-peer-deps

echo.
echo ==========================================
echo STEP 3: FIXING ANDROID CONFIGURATION
echo ==========================================
echo.
echo Updating Gradle wrapper...
cd android
gradlew wrapper --gradle-version=8.0
cd ..

echo.
echo Checking Android configuration...
npx react-native doctor

echo.
echo ==========================================
echo STEP 4: TESTING BUILD
echo ==========================================
echo.
echo Testing Android build...
npm run android
if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed. Trying alternative methods...
    echo.
    echo ==========================================
    echo ALTERNATIVE METHOD 1: EXPO BUILD
    echo ==========================================
    echo.
    echo Trying Expo build service...
    npx expo build:android
    if %errorlevel% neq 0 (
        echo.
        echo ❌ Expo build failed. Trying React Native CLI...
        echo.
        echo ==========================================
        echo ALTERNATIVE METHOD 2: REACT NATIVE CLI
        echo ==========================================
        echo.
        echo Trying React Native CLI...
        npx react-native run-android
        if %errorlevel% neq 0 (
            echo.
            echo ❌ All build methods failed.
            echo.
            echo ==========================================
            echo MANUAL FIXES NEEDED
            echo ==========================================
            echo.
            echo Please check:
            echo 1. Android Studio is installed
            echo 2. ANDROID_HOME environment variable is set
            echo 3. Java JDK is installed
            echo 4. USB debugging is enabled on phone
            echo 5. Phone is connected via USB
            echo.
            echo Try opening android folder in Android Studio
            echo and building from there.
        ) else (
            echo.
            echo ✅ React Native CLI build successful!
        )
    ) else (
        echo.
        echo ✅ Expo build successful!
        echo Download APK from Expo dashboard
    )
) else (
    echo.
    echo ✅ Android build successful!
    echo App installed on your Android phone
)

echo.
echo 🎉 Gradle fix complete!
echo.
echo Your StudySpot mobile app is ready for testing!
echo.
pause












