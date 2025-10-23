@echo off
echo.
echo ========================================
echo  RELOAD NEW PAYMENT FEATURES
echo ========================================
echo.
echo Step 1: Clearing React cache...
cd web-owner
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo   [OK] Cache cleared!
) else (
    echo   [OK] No cache to clear
)
echo.
echo Step 2: Starting development server...
echo.
echo   Please open: http://localhost:3000/payments
echo   Then press: Ctrl+Shift+R to hard refresh
echo.
echo Starting server now...
echo.
npm start

