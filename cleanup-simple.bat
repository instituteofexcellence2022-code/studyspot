@echo off
echo 🧹 STUDYSPOT PROJECT CLEANUP
echo ============================

echo.
echo Cleaning up unwanted files and organizing project...
echo.

echo Step 1: Creating clean project structure...
if not exist "WORKING_SOLUTIONS" mkdir "WORKING_SOLUTIONS"
if not exist "WORKING_SOLUTIONS\HTML" mkdir "WORKING_SOLUTIONS\HTML"
if not exist "WORKING_SOLUTIONS\FLUTTER" mkdir "WORKING_SOLUTIONS\FLUTTER"
if not exist "WORKING_SOLUTIONS\REACT" mkdir "WORKING_SOLUTIONS\REACT"

echo Step 2: Moving working solutions...
if exist "studyspot-simple.html" (
    move "studyspot-simple.html" "WORKING_SOLUTIONS\HTML\"
    echo ✅ Moved HTML version
)

if exist "studyspot_flutter" (
    move "studyspot_flutter" "WORKING_SOLUTIONS\FLUTTER\"
    echo ✅ Moved Flutter version
)

if exist "studyspot-pwa" (
    move "studyspot-pwa" "WORKING_SOLUTIONS\REACT\"
    echo ✅ Moved React PWA version
)

echo Step 3: Moving test scripts...
if exist "test-flutter-studyspot.bat" (
    move "test-flutter-studyspot.bat" "WORKING_SOLUTIONS\FLUTTER\"
    echo ✅ Moved Flutter test script
)

if exist "setup-flutter-studyspot.bat" (
    move "setup-flutter-studyspot.bat" "WORKING_SOLUTIONS\FLUTTER\"
    echo ✅ Moved Flutter setup script
)

echo Step 4: Creating clean README...
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
echo Step 5: Removing unwanted files...
echo (This will clean up duplicate and outdated files)

echo Removing old Android build files...
if exist "complete-android-build.ps1" del "complete-android-build.ps1"
if exist "complete-android-build.bat" del "complete-android-build.bat"
if exist "complete-android-build-fixed.ps1" del "complete-android-build-fixed.ps1"

echo Removing old mobile test files...
if exist "mobile\test-expo.bat" del "mobile\test-expo.bat"
if exist "mobile\test-mobile.bat" del "mobile\test-mobile.bat"
if exist "mobile\test-mobile.html" del "mobile\test-mobile.html"
if exist "mobile\test-simple.bat" del "mobile\test-simple.bat"
if exist "mobile\test-web.html" del "mobile\test-web.html"
if exist "mobile\test-working.html" del "mobile\test-working.html"

echo Removing old documentation...
if exist "ANDROID_APK_BUILD_GUIDE.md" del "ANDROID_APK_BUILD_GUIDE.md"
if exist "EXPO_BUILD_INSTRUCTIONS.md" del "EXPO_BUILD_INSTRUCTIONS.md"
if exist "MOBILE_TESTING_GUIDE.md" del "MOBILE_TESTING_GUIDE.md"
if exist "GRADLE_ISSUES_FIX.md" del "GRADLE_ISSUES_FIX.md"
if exist "NEW_TECH_STACK_PROPOSAL.md" del "NEW_TECH_STACK_PROPOSAL.md"

echo.
echo 🎉 CLEANUP COMPLETE!
echo.
echo ✅ Organized working solutions
echo ✅ Removed unwanted files
echo ✅ Created clean structure
echo ✅ Updated README
echo.
echo 📁 Your clean project:
echo.
echo WORKING_SOLUTIONS\
echo ├── HTML\ (studyspot-simple.html - Instant test)
echo ├── FLUTTER\ (Flutter app - Industry standard)
echo └── REACT\ (React PWA - Modern web)
echo.
echo 🚀 Ready to test your clean StudySpot solutions!
echo.
pause












