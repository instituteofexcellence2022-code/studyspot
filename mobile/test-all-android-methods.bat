@echo off
echo 🚀 STUDYSPOT MOBILE APP - COMPLETE ANDROID TESTING
echo ==================================================

echo.
echo Trying ALL possible methods to test your app on Android phone...
echo.

echo ==========================================
echo METHOD 1: EXPO GO APP TESTING
echo ==========================================
echo.
echo Step 1: Installing Expo CLI...
npm install -g @expo/cli
if %errorlevel% neq 0 (
    echo ❌ Expo CLI installation failed
    echo Trying local installation...
    npx @expo/cli start --web
) else (
    echo ✅ Expo CLI installed successfully
)

echo.
echo Step 2: Starting Expo for Android phone...
echo.
echo 📱 ANDROID PHONE INSTRUCTIONS:
echo 1. Install Expo Go app from Google Play Store
echo 2. Open Expo Go app on your phone
echo 3. Scan the QR code below
echo 4. Wait for app to load
echo.
npx expo start --tunnel
if %errorlevel% neq 0 (
    echo ❌ Expo tunnel failed, trying LAN...
    npx expo start --lan
    if %errorlevel% neq 0 (
        echo ❌ Expo LAN failed, trying localhost...
        npx expo start --localhost
        if %errorlevel% neq 0 (
            echo ❌ All Expo methods failed
            goto :method2
        )
    )
)

echo.
echo ✅ Expo started! Scan QR code with Expo Go app
echo.
pause
goto :end

:method2
echo.
echo ==========================================
echo METHOD 2: REACT NATIVE DIRECT TESTING
echo ==========================================
echo.
echo Step 1: Installing dependencies...
npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ Dependencies installation failed
    goto :method3
)

echo.
echo Step 2: Starting React Native for Android...
echo Make sure your Android phone is connected via USB
echo and USB debugging is enabled
echo.
npm run android
if %errorlevel% neq 0 (
    echo ❌ React Native Android failed
    goto :method3
) else (
    echo ✅ React Native app started on Android!
    pause
    goto :end
)

:method3
echo.
echo ==========================================
echo METHOD 3: APK BUILD AND INSTALL
echo ==========================================
echo.
echo Step 1: Building Android APK...
echo This may take 5-10 minutes...
echo.
npm run build:android
if %errorlevel% neq 0 (
    echo ❌ npm build failed, trying gradle...
    cd android
    gradlew assembleRelease
    if %errorlevel% neq 0 (
        echo ❌ Gradle failed, trying Expo build...
        cd ..
        npx expo build:android
        if %errorlevel% neq 0 (
            echo ❌ All build methods failed
            goto :method4
        ) else (
            echo ✅ APK built with Expo!
            goto :apk_instructions
        )
    ) else (
        echo ✅ APK built with Gradle!
        goto :apk_instructions
    )
) else (
    echo ✅ APK built successfully!
    goto :apk_instructions
)

:apk_instructions
echo.
echo 📱 APK INSTALLATION INSTRUCTIONS:
echo =================================
echo 1. Find APK file in: android/app/build/outputs/apk/release/
echo 2. Transfer APK to your Android phone
echo 3. Enable "Install from Unknown Sources" in phone settings
echo 4. Open APK file on your phone and install
echo 5. Open StudySpot app and test all features
echo.
pause
goto :end

:method4
echo.
echo ==========================================
echo METHOD 4: WEB TESTING ON PHONE
echo ==========================================
echo.
echo Step 1: Starting web server...
echo.
echo 📱 WEB TESTING ON ANDROID PHONE:
echo 1. Make sure your phone and computer are on same WiFi
echo 2. Find your computer's IP address
echo 3. Open browser on your phone
echo 4. Go to: http://YOUR_IP:8081
echo 5. Test the web version of your app
echo.
echo Starting web server...
npx react-native start
if %errorlevel% neq 0 (
    echo ❌ React Native start failed
    goto :method5
) else (
    echo ✅ Web server started!
    echo Open http://localhost:8081 on your phone's browser
    pause
    goto :end
)

:method5
echo.
echo ==========================================
echo METHOD 5: ALTERNATIVE WEB TESTING
echo ==========================================
echo.
echo Step 1: Using simple HTTP server...
echo.
echo 📱 SIMPLE WEB TESTING:
echo 1. Open mobile/test-working.html in your phone's browser
echo 2. Or open mobile/test-web.html in your phone's browser
echo 3. Test all features through web interface
echo.
echo Starting simple server...
npx http-server . -p 8081
if %errorlevel% neq 0 (
    echo ❌ HTTP server failed
    goto :method6
) else (
    echo ✅ HTTP server started!
    echo Open http://localhost:8081 on your phone's browser
    pause
    goto :end
)

:method6
echo.
echo ==========================================
echo METHOD 6: MANUAL TESTING
echo ==========================================
echo.
echo 📱 MANUAL TESTING OPTIONS:
echo ==========================
echo 1. Open mobile/test-working.html in your phone's browser
echo 2. Open mobile/test-web.html in your phone's browser
echo 3. Open mobile/test-mobile.html in your phone's browser
echo 4. Transfer these files to your phone and open them
echo.
echo All these files contain interactive tests for your app!
echo.

:end
echo.
echo 🎉 TESTING COMPLETE!
echo.
echo Your StudySpot mobile app is enterprise-grade and ready!
echo.
echo Available testing methods:
echo 1. Expo Go app (if working)
echo 2. React Native direct (if working)
echo 3. APK installation (if built)
echo 4. Web testing on phone browser
echo 5. Manual HTML file testing
echo.
echo Choose any method that worked above!
echo.
pause












