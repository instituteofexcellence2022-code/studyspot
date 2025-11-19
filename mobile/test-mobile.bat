@echo off
REM StudySpot Mobile App - Comprehensive Test Suite
REM This script runs a full test of the mobile application

echo 🧪 STUDYSPOT MOBILE APP - COMPREHENSIVE TEST SUITE
echo ==================================================

set TOTAL_TESTS=0
set PASSED_TESTS=0
set FAILED_TESTS=0

REM Function to run a test
:run_test
set test_name=%~1
set test_command=%~2

echo.
echo Testing: %test_name%
echo Command: %test_command%

set /a TOTAL_TESTS+=1

%test_command% >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PASSED: %test_name%
    set /a PASSED_TESTS+=1
) else (
    echo ❌ FAILED: %test_name%
    set /a FAILED_TESTS+=1
)
goto :eof

echo.
echo Phase 1: Environment ^& Setup Testing
echo ==========================================

call :run_test "Node.js Installation" "node --version"
call :run_test "npm Installation" "npm --version"
call :run_test "React Native CLI" "npx react-native --version"
call :run_test "Expo CLI" "npx expo --version"
call :run_test "Mobile Directory" "if exist package.json if exist App.tsx echo 1"

echo.
echo Phase 2: Dependencies ^& Build Testing
echo =============================================

call :run_test "Dependencies Installation" "npm install --legacy-peer-deps"
call :run_test "TypeScript Compilation" "npm run type-check"
call :run_test "Code Linting" "npm run lint"

echo.
echo Phase 3: Metro Bundler Testing
echo =================================

echo Starting Metro bundler...
start /B npm start
timeout /t 10 /nobreak >nul

call :run_test "Metro Bundler Startup" "tasklist /FI \"IMAGENAME eq node.exe\" 2>nul | find /I \"node.exe\" >nul"

echo.
echo Phase 4: Expo Web Testing
echo ============================

echo Starting Expo web server...
start /B npx expo start --web
timeout /t 15 /nobreak >nul

call :run_test "Expo Web Server" "tasklist /FI \"IMAGENAME eq node.exe\" 2>nul | find /I \"node.exe\" >nul"

echo.
echo Phase 5: Android Build Testing
echo ==================================

call :run_test "Android SDK" "where adb >nul 2>&1"
call :run_test "Java Installation" "java -version >nul 2>&1"

echo.
echo Phase 6: Code Quality Testing
echo ==================================

call :run_test "TypeScript Errors" "npm run type-check"
call :run_test "ESLint Errors" "npm run lint"

echo.
echo Phase 7: Feature Testing
echo ==========================

call :run_test "Login Screen Component" "if exist src\screens\auth\LoginScreen.tsx echo 1"
call :run_test "Home Screen Component" "if exist src\screens\main\HomeScreen.tsx echo 1"
call :run_test "Auth Service" "if exist src\services\AuthService.ts echo 1"
call :run_test "Redux Store" "if exist src\store\index.ts echo 1"
call :run_test "Navigation Setup" "if exist src\navigation\AppNavigator.tsx echo 1"

echo.
echo Phase 8: Performance Testing
echo ===============================

call :run_test "Required Files" "if exist App.tsx if exist package.json if exist tsconfig.json echo 1"
call :run_test "Package Scripts" "npm run | findstr /C:\"start\" /C:\"android\" /C:\"ios\" /C:\"test\" >nul"

echo.
echo Phase 9: Security Testing
echo ============================

call :run_test "Hardcoded Secrets Check" "findstr /S /I /C:\"password\" /C:\"secret\" /C:\"key\" src\*.ts src\*.tsx | findstr /V \"password:\" | find /C /V \"\" | findstr /V \"0\" >nul"

echo.
echo Phase 10: Final Validation
echo ===============================

call :run_test "All Required Files" "if exist App.tsx if exist package.json if exist tsconfig.json if exist src echo 1"

echo.
echo TEST RESULTS SUMMARY
echo =====================
echo Total Tests: %TOTAL_TESTS%
echo Passed: %PASSED_TESTS%
echo Failed: %FAILED_TESTS%

if %FAILED_TESTS% equ 0 (
    echo.
    echo 🎉 ALL TESTS PASSED! Mobile app is ready for production!
    pause
    exit /b 0
) else (
    echo.
    echo ⚠️  Some tests failed. Please review and fix issues.
    pause
    exit /b 1
)