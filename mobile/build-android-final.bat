@echo off
echo 🚀 STUDYSPOT MOBILE APP - ANDROID BUILD
echo ======================================

echo.
echo Step 1: Installing Expo CLI...
npm install -g @expo/cli

echo.
echo Step 2: Building Android APK...
npx expo build:android --type apk

if %errorlevel% equ 0 (
    echo.
    echo ✅ APK build successful!
    echo 📱 Check Expo dashboard for download link
    echo 🎉 Your StudySpot Android APK is ready!
) else (
    echo.
    echo ❌ Expo build failed. Trying React Native build...
    echo.
    echo Step 3: Creating React Native project...
    cd ..
    npx react-native init StudySpotAndroid --template react-native-template-typescript
    
    echo.
    echo Step 4: Copying source code...
    xcopy mobile\src StudySpotAndroid\src /E /I /Y
    copy mobile\package.json StudySpotAndroid\package.json
    
    echo.
    echo Step 5: Installing dependencies...
    cd StudySpotAndroid
    npm install --legacy-peer-deps
    
    echo.
    echo Step 6: Building APK...
    npm run build:android
    
    if %errorlevel% equ 0 (
        echo.
        echo ✅ APK build successful!
        echo 📱 APK location: android\app\build\outputs\apk\release\app-release.apk
    ) else (
        echo.
        echo ❌ All build methods failed.
        echo Please check Android Studio setup.
    )
)

echo.
echo Press any key to exit...
pause >nul












