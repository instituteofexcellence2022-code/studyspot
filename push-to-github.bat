@echo off
REM ============================================
REM SAFE GITHUB PUSH SCRIPT
REM Checks for sensitive files before pushing
REM ============================================

echo.
echo ╔════════════════════════════════════════════╗
echo ║     STUDYSPOT - GITHUB PUSH HELPER        ║
echo ╚════════════════════════════════════════════╝
echo.

REM Check if git is initialized
if not exist ".git" (
    echo ❌ ERROR: Git not initialized
    echo.
    echo Run: git init
    echo.
    pause
    exit /b 1
)

echo 📋 Step 1: Checking for sensitive files...
echo.

REM Check for .env files
if exist ".env" (
    echo ⚠️  WARNING: .env file found!
    echo    This file should NOT be pushed to GitHub
    echo.
)

if exist "backend\.env" (
    echo ⚠️  WARNING: backend\.env file found!
    echo    This file should NOT be pushed to GitHub
    echo.
)

if exist "web-admin-new\frontend\.env" (
    echo ⚠️  WARNING: frontend\.env file found!
    echo    This file should NOT be pushed to GitHub
    echo.
)

REM Check .gitignore exists
if not exist ".gitignore" (
    echo ❌ ERROR: .gitignore not found!
    echo    Create .gitignore first to protect sensitive files
    echo.
    pause
    exit /b 1
)

echo ✅ .gitignore found
echo.

echo 📋 Step 2: Checking git status...
echo.
git status

echo.
echo ════════════════════════════════════════════
echo.
echo ⚠️  REVIEW THE FILES ABOVE CAREFULLY!
echo.
echo Make sure you don't see:
echo   - .env files
echo   - credentials.json
echo   - *.pem or *.key files
echo   - node_modules folder
echo   - database dumps
echo.
echo ════════════════════════════════════════════
echo.

set /p CONTINUE="Do you want to continue? (yes/no): "
if /i not "%CONTINUE%"=="yes" (
    echo.
    echo ❌ Push cancelled
    echo.
    pause
    exit /b 0
)

echo.
echo 📋 Step 3: Staging all files...
git add .

echo.
echo 📋 Step 4: Creating commit...
echo.

set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=feat: Backend infrastructure overhaul - Production ready
)

git commit -m "%COMMIT_MSG%"

echo.
echo 📋 Step 5: Pushing to GitHub...
echo.

REM Try to push
git push origin main 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Push to 'main' failed, trying 'master' branch...
    git push origin master 2>nul
    if %errorlevel% neq 0 (
        echo.
        echo ❌ ERROR: Push failed!
        echo.
        echo Possible reasons:
        echo   1. Not connected to internet
        echo   2. Wrong branch name
        echo   3. Need to pull first
        echo.
        echo Try manually:
        echo   git pull origin main --rebase
        echo   git push origin main
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ╔════════════════════════════════════════════╗
echo ║           PUSH SUCCESSFUL! ✅              ║
echo ╚════════════════════════════════════════════╝
echo.
echo 🎉 Your code is now safely backed up on GitHub!
echo.
echo Next steps:
echo   1. Visit your GitHub repository
echo   2. Verify files are visible
echo   3. Check README.md displays correctly
echo.

pause

