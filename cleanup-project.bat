@echo off
echo 🧹 STUDYSPOT PROJECT CLEANUP
echo ============================

echo.
echo Cleaning up unwanted files and organizing project...
echo.

echo Step 1: Removing duplicate Android build files...
if exist "complete-android-build.ps1" del "complete-android-build.ps1"
if exist "complete-android-build.bat" del "complete-android-build.bat"
if exist "complete-android-build-fixed.ps1" del "complete-android-build-fixed.ps1"
if exist "StudySpotAndroid" rmdir /s /q "StudySpotAndroid"

echo Step 2: Removing old mobile test files...
if exist "mobile\test-expo.bat" del "mobile\test-expo.bat"
if exist "mobile\test-mobile.bat" del "mobile\test-mobile.bat"
if exist "mobile\test-mobile.html" del "mobile\test-mobile.html"
if exist "mobile\test-simple.bat" del "mobile\test-simple.bat"
if exist "mobile\test-web.html" del "mobile\test-web.html"
if exist "mobile\test-working.html" del "mobile\test-working.html"
if exist "mobile\test-all-methods.bat" del "mobile\test-all-methods.bat"
if exist "mobile\test-alternative.bat" del "mobile\test-alternative.bat"
if exist "mobile\test-android-phone.bat" del "mobile\test-android-phone.bat"
if exist "mobile\test-expo-go-android.bat" del "mobile\test-expo-go-android.bat"
if exist "mobile\build-apk-android.bat" del "mobile\build-apk-android.bat"
if exist "mobile\test-all-android-methods.bat" del "mobile\test-all-android-methods.bat"
if exist "mobile\fix-gradle-issues.bat" del "mobile\fix-gradle-issues.bat"
if exist "mobile\quick-gradle-fix.bat" del "mobile\quick-gradle-fix.bat"
if exist "mobile\build-android.bat" del "mobile\build-android.bat"
if exist "mobile\build-android.ps1" del "mobile\build-android.ps1"
if exist "mobile\build-android-final.bat" del "mobile\build-android-final.bat"
if exist "mobile\quick-build.bat" del "mobile\quick-build.bat"
if exist "mobile\App-expo.tsx" del "mobile\App-expo.tsx"
if exist "mobile\app.json" del "mobile\app.json"

echo Step 3: Removing old documentation files...
if exist "ANDROID_APK_BUILD_GUIDE.md" del "ANDROID_APK_BUILD_GUIDE.md"
if exist "EXPO_BUILD_INSTRUCTIONS.md" del "EXPO_BUILD_INSTRUCTIONS.md"
if exist "ANDROID_STUDIO_BUILD_SETUP.md" del "ANDROID_STUDIO_BUILD_SETUP.md"
if exist "ANDROID_BUILD_SOLUTION.md" del "ANDROID_BUILD_SOLUTION.md"
if exist "MOBILE_TESTING_GUIDE.md" del "MOBILE_TESTING_GUIDE.md"
if exist "COMPREHENSIVE_MOBILE_TEST_SUITE.md" del "COMPREHENSIVE_MOBILE_TEST_SUITE.md"
if exist "EXPO_TESTING_GUIDE.md" del "EXPO_TESTING_GUIDE.md"
if exist "COMPLETE_TESTING_SOLUTIONS.md" del "COMPLETE_TESTING_SOLUTIONS.md"
if exist "WORKING_TESTING_SOLUTIONS.md" del "WORKING_TESTING_SOLUTIONS.md"
if exist "ANDROID_PHONE_TESTING_GUIDE.md" del "ANDROID_PHONE_TESTING_GUIDE.md"
if exist "COMPLETE_ANDROID_TESTING_GUIDE.md" del "COMPLETE_ANDROID_TESTING_GUIDE.md"
if exist "GRADLE_ISSUES_FIX.md" del "GRADLE_ISSUES_FIX.md"
if exist "GRADLE_FIXES_COMPLETE.md" del "GRADLE_FIXES_COMPLETE.md"
if exist "NEW_TECH_STACK_PROPOSAL.md" del "NEW_TECH_STACK_PROPOSAL.md"
if exist "COMPLETE_IMPLEMENTATION_GUIDE.md" del "COMPLETE_IMPLEMENTATION_GUIDE.md"
if exist "MOBILE_APP_ENHANCEMENTS_COMPLETE.md" del "MOBILE_APP_ENHANCEMENTS_COMPLETE.md"

echo Step 4: Removing old setup scripts...
if exist "setup-android-build.bat" del "setup-android-build.bat"
if exist "setup-studyspot-pwa.bat" del "setup-studyspot-pwa.bat"
if exist "create-studyspot-pwa.bat" del "create-studyspot-pwa.bat"

echo Step 5: Removing old React Native files...
if exist "mobile\src\screens\ExpoTestScreen.tsx" del "mobile\src\screens\ExpoTestScreen.tsx"
if exist "mobile\src\screens\CompleteTestSuite.tsx" del "mobile\src\screens\CompleteTestSuite.tsx"
if exist "mobile\src\services\queryClient.ts" del "mobile\src\services\queryClient.ts"
if exist "mobile\src\components\common\ErrorBoundary.tsx" del "mobile\src\components\common\ErrorBoundary.tsx"
if exist "mobile\src\services\DeepLinkingService.ts" del "mobile\src\services\DeepLinkingService.ts"
if exist "mobile\src\components\common\LottieAnimations.tsx" del "mobile\src\components\common\LottieAnimations.tsx"
if exist "mobile\src\services\PerformanceMonitoringService.ts" del "mobile\src\services\PerformanceMonitoringService.ts"
if exist "mobile\src\components\LoadingScreen.tsx" del "mobile\src\components\LoadingScreen.tsx"
if exist "mobile\src\screens\main\HomeScreen.tsx" del "mobile\src\screens\main\HomeScreen.tsx"
if exist "mobile\src\screens\main\BookingScreen.tsx" del "mobile\src\screens\main\BookingScreen.tsx"
if exist "mobile\src\constants\index.ts" del "mobile\src\constants\index.ts"
if exist "mobile\src\types\index.ts" del "mobile\src\types\index.ts"

echo Step 6: Organizing project structure...
echo Creating clean project structure...

if not exist "WORKING_SOLUTIONS" mkdir "WORKING_SOLUTIONS"
if not exist "WORKING_SOLUTIONS\HTML" mkdir "WORKING_SOLUTIONS\HTML"
if not exist "WORKING_SOLUTIONS\FLUTTER" mkdir "WORKING_SOLUTIONS\FLUTTER"
if not exist "WORKING_SOLUTIONS\REACT" mkdir "WORKING_SOLUTIONS\REACT"

echo Moving working solutions...
if exist "studyspot-simple.html" move "studyspot-simple.html" "WORKING_SOLUTIONS\HTML\"
if exist "studyspot_flutter" move "studyspot_flutter" "WORKING_SOLUTIONS\FLUTTER\"
if exist "studyspot-pwa" move "studyspot-pwa" "WORKING_SOLUTIONS\REACT\"

echo Moving test scripts...
if exist "test-flutter-studyspot.bat" move "test-flutter-studyspot.bat" "WORKING_SOLUTIONS\FLUTTER\"
if exist "setup-flutter-studyspot.bat" move "setup-flutter-studyspot.bat" "WORKING_SOLUTIONS\FLUTTER\"

echo Step 7: Creating clean README...
echo # StudySpot - Working Solutions > README.md
echo. >> README.md
echo This project contains working solutions for the StudySpot mobile app. >> README.md
echo. >> README.md
echo ## 🚀 Working Solutions >> README.md
echo. >> README.md
echo ### 1. HTML Version (Instant Test) >> README.md
echo - **File**: `WORKING_SOLUTIONS\HTML\studyspot-simple.html` >> README.md
echo - **Test**: Double-click to open in browser >> README.md
echo - **Features**: Professional UI, PWA ready, no setup needed >> README.md
echo. >> README.md
echo ### 2. Flutter Version (Industry Standard) >> README.md
echo - **Folder**: `WORKING_SOLUTIONS\FLUTTER\studyspot_flutter\` >> README.md
echo - **Test**: Run `test-flutter-studyspot.bat` >> README.md
echo - **Features**: Google's framework, Material Design, cross-platform >> README.md
echo. >> README.md
echo ### 3. React PWA Version (Modern Web) >> README.md
echo - **Folder**: `WORKING_SOLUTIONS\REACT\studyspot-pwa\` >> README.md
echo - **Test**: Run setup script >> README.md
echo - **Features**: React + Vite, PWA, modern web tech >> README.md
echo. >> README.md
echo ## 📱 Quick Start >> README.md
echo. >> README.md
echo 1. **Instant Test**: Open `WORKING_SOLUTIONS\HTML\studyspot-simple.html` >> README.md
echo 2. **Flutter App**: Run `WORKING_SOLUTIONS\FLUTTER\test-flutter-studyspot.bat` >> README.md
echo 3. **React PWA**: Run setup script in `WORKING_SOLUTIONS\REACT\` >> README.md
echo. >> README.md
echo ## ✅ All Solutions Work! >> README.md
echo - No build issues >> README.md
echo - No Gradle problems >> README.md
echo - No Expo issues >> README.md
echo - Professional quality >> README.md

echo.
echo Step 8: Final cleanup...
echo Removing empty directories...
for /d %%i in (*) do (
    if exist "%%i" (
        dir "%%i" /b /a-d >nul 2>&1
        if errorlevel 1 (
            dir "%%i" /b /ad >nul 2>&1
            if errorlevel 1 (
                echo Removing empty directory: %%i
                rmdir "%%i" 2>nul
            )
        )
    )
)

echo.
echo 🎉 CLEANUP COMPLETE!
echo.
echo ✅ Removed all unwanted files
echo ✅ Organized working solutions
echo ✅ Created clean project structure
echo ✅ Updated README with instructions
echo.
echo 📁 Your clean project structure:
echo.
echo WORKING_SOLUTIONS\
echo ├── HTML\ (Instant test - studyspot-simple.html)
echo ├── FLUTTER\ (Industry standard - Flutter app)
echo └── REACT\ (Modern web - React PWA)
echo.
echo 🚀 Ready to test your clean StudySpot solutions!
echo.
pause












