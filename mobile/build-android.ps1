# StudySpot Mobile App - Android APK Build Script
# PowerShell version for Windows

Write-Host "📱 STUDYSPOT MOBILE APP - ANDROID APK BUILD" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if we're in the mobile directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Not in mobile directory. Please run this from the mobile folder." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ In mobile directory" -ForegroundColor Green

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
try {
    npm install --legacy-peer-deps
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Checking for Android build options..." -ForegroundColor Yellow

# Check if Expo CLI is available
try {
    $expoVersion = npx expo --version 2>$null
    Write-Host "✅ Expo CLI available" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Building APK with Expo..." -ForegroundColor Cyan
    
    npx expo build:android --type apk
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ APK build successful!" -ForegroundColor Green
        Write-Host "📱 APK will be available in Expo dashboard" -ForegroundColor Cyan
        Read-Host "Press Enter to continue"
        exit 0
    } else {
        Write-Host "❌ Expo build failed" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️ Expo CLI not available" -ForegroundColor Yellow
}

# Check if React Native CLI is available
try {
    $rnVersion = npx react-native --version 2>$null
    Write-Host "✅ React Native CLI available" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Building APK with React Native..." -ForegroundColor Cyan
    
    # Check if Android directory exists
    if (Test-Path "android") {
        Write-Host "✅ Android directory found" -ForegroundColor Green
        Set-Location android
        ./gradlew assembleRelease
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ APK build successful!" -ForegroundColor Green
            Write-Host "📱 APK location: android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Cyan
            Read-Host "Press Enter to continue"
            exit 0
        } else {
            Write-Host "❌ Gradle build failed" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Android directory not found" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️ React Native CLI not available" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "❌ No suitable build method found" -ForegroundColor Red
Write-Host ""
Write-Host "Please choose one of the following options:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Install Android Studio and set up Android SDK" -ForegroundColor White
Write-Host "2. Use Expo build service (requires Expo account)" -ForegroundColor White
Write-Host "3. Use EAS build service (cloud build)" -ForegroundColor White
Write-Host ""
Write-Host "For quick setup, run:" -ForegroundColor Cyan
Write-Host "  npm install -g @expo/cli" -ForegroundColor White
Write-Host "  npx expo build:android" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"












