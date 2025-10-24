@echo off
REM ========================================
REM STUDYSPOT - Test Authentication Setup
REM ========================================

echo.
echo ========================================
echo   TESTING AUTHENTICATION SETUP
echo ========================================
echo.

REM Check if .env files exist
echo [1/5] Checking .env files...
echo.

if exist "api\.env" (
    echo ✅ api/.env exists
) else (
    echo ❌ api/.env MISSING
    echo    Run: CREATE_ENV_FILES_NOW.bat
    goto :error
)

if exist "web-owner\.env" (
    echo ✅ web-owner/.env exists
) else (
    echo ❌ web-owner/.env MISSING
    echo    Run: CREATE_ENV_FILES_NOW.bat
    goto :error
)

if exist "web-admin\.env" (
    echo ✅ web-admin/.env exists
) else (
    echo ❌ web-admin/.env MISSING
    echo    Run: CREATE_ENV_FILES_NOW.bat
    goto :error
)

echo.
echo [2/5] Checking Node.js installation...
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found
    echo    Install from: https://nodejs.org
    goto :error
) else (
    node --version
    echo ✅ Node.js installed
)

echo.
echo [3/5] Checking npm installation...
npm --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found
    goto :error
) else (
    npm --version
    echo ✅ npm installed
)

echo.
echo [4/5] Checking API dependencies...
if exist "api\node_modules" (
    echo ✅ API dependencies installed
) else (
    echo ⚠️  API dependencies not installed
    echo    Run: cd api ^&^& npm install
)

echo.
echo [5/5] Checking Frontend dependencies...
if exist "web-owner\node_modules" (
    echo ✅ Frontend dependencies installed
) else (
    echo ⚠️  Frontend dependencies not installed
    echo    Run: cd web-owner ^&^& npm install
)

echo.
echo ========================================
echo   ✅ SETUP CHECK COMPLETE
echo ========================================
echo.
echo Next steps:
echo   1. Start API: cd api ^&^& node src/index-unified.js
echo   2. Start Frontend: cd web-owner ^&^& npm start
echo   3. Test in browser: http://localhost:3000
echo.
echo For detailed guide, read: COMPLETE_FIX_GUIDE.md
echo For quick start, read: QUICK_START_AUTHENTICATION.md
echo.
goto :end

:error
echo.
echo ========================================
echo   ❌ SETUP CHECK FAILED
echo ========================================
echo.
echo Please fix the errors above and try again.
echo.

:end
pause





