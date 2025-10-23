@echo off
color 0B
cls
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo           🚀 OPENING DEPLOYMENT TOOLS 🚀
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📝 Opening deployment guides...
echo 🌐 Opening Render Dashboard...
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Open deployment guides
start "" "%~dp0START_DEPLOYMENT.md"
timeout /t 1 /nobreak >nul

start "" "%~dp0api\.env"
timeout /t 1 /nobreak >nul

REM Open Render dashboard
start "" "https://dashboard.render.com"

echo.
echo ✅ Opened:
echo    • START_DEPLOYMENT.md (step-by-step guide)
echo    • api\.env (environment variables to copy)
echo    • Render Dashboard (deployment platform)
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 👉 NEXT STEPS:
echo    1. Follow START_DEPLOYMENT.md step by step
echo    2. Copy values from api\.env to Render
echo    3. Deploy!
echo.
echo 💡 TIP: Keep this window open for reference!
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause








