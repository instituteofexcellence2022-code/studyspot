@echo off
REM StudySpot Flutter App - Complete Cross-Platform Build Script (Windows)
echo 🚀 STUDYSPOT FLUTTER APP - COMPLETE CROSS-PLATFORM BUILD
echo ========================================================

REM Check if Flutter is installed
echo [INFO] Checking Flutter installation...
flutter --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Flutter is not installed. Please install Flutter first.
    echo [INFO] Visit: https://flutter.dev/docs/get-started/install
    pause
    exit /b 1
)

echo [SUCCESS] Flutter is installed
flutter --version

REM Check Flutter doctor
echo [INFO] Running Flutter doctor...
flutter doctor

echo [WARNING] Please ensure all required dependencies are installed before proceeding.
set /p continue="Do you want to continue? (y/n): "
if /i not "%continue%"=="y" (
    echo [INFO] Build cancelled by user
    pause
    exit /b 0
)

REM Navigate to Flutter project directory
cd studyspot_flutter

REM Clean project
echo [INFO] Cleaning project...
flutter clean

REM Get dependencies
echo [INFO] Getting dependencies...
flutter pub get
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [SUCCESS] Dependencies installed successfully

REM Analyze code
echo [INFO] Analyzing code...
flutter analyze
if %errorlevel% neq 0 (
    echo [WARNING] Code analysis found issues
) else (
    echo [SUCCESS] Code analysis completed successfully
)

REM Run tests
echo [INFO] Running tests...
flutter test
if %errorlevel% neq 0 (
    echo [ERROR] Some tests failed
) else (
    echo [SUCCESS] All tests passed
)

REM Build for Android
echo [INFO] Building Android APK...
flutter doctor | findstr "Android toolchain" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Android toolchain not found. Skipping Android build.
) else (
    echo [INFO] Building debug APK...
    flutter build apk --debug
    if %errorlevel% equ 0 (
        echo [SUCCESS] Debug APK built successfully
        echo [INFO] APK location: build/app/outputs/flutter-apk/app-debug.apk
    ) else (
        echo [ERROR] Failed to build debug APK
    )
    
    echo [INFO] Building release APK...
    flutter build apk --release
    if %errorlevel% equ 0 (
        echo [SUCCESS] Release APK built successfully
        echo [INFO] APK location: build/app/outputs/flutter-apk/app-release.apk
    ) else (
        echo [ERROR] Failed to build release APK
    )
)

REM Build for Web
echo [INFO] Building web app...
flutter build web
if %errorlevel% equ 0 (
    echo [SUCCESS] Web app built successfully
    echo [INFO] Web app location: build/web/
) else (
    echo [ERROR] Failed to build web app
)

REM Generate Android App Bundle
echo [INFO] Generating Android App Bundle...
flutter doctor | findstr "Android toolchain" >nul 2>&1
if %errorlevel% equ 0 (
    flutter build appbundle --release
    if %errorlevel% equ 0 (
        echo [SUCCESS] Android App Bundle generated successfully
        echo [INFO] Bundle location: build/app/outputs/bundle/release/app-release.aab
    ) else (
        echo [ERROR] Failed to generate Android App Bundle
    )
)

echo.
echo [SUCCESS] Build process completed!
echo [INFO] Check the build/ directory for output files
echo ========================================================
pause











