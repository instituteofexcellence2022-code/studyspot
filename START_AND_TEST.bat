@echo off
cls
echo ================================================
echo  STUDYSPOT - START SERVER AND TEST
echo ================================================
echo.

echo Step 1: Check .env file
echo ------------------------
cd api
if not exist .env (
    echo  ERROR: .env file not found!
    echo.
    echo The .env file should have been created automatically.
    echo If you see this, something went wrong.
    pause
    exit /b 1
)
echo  .env file found!
cd ..
echo.

echo Step 2: Starting Backend Server
echo --------------------------------
echo.
echo Opening server in a NEW WINDOW...
echo You'll see server logs in that window.
echo.
echo IMPORTANT: 
echo  - Watch that window for any errors
echo  - Wait for "Server running on port 3001"
echo  - Then come back to THIS window
echo.
pause

start "StudySpot API - Check this window for errors!" cmd /k "cd api && npm start"

echo.
echo  Server window opened!
echo.
echo Now waiting 15 seconds for server to start...
echo (Watch the other window for startup messages)
echo.
timeout /t 15 /nobreak
echo.

echo Step 3: Testing Health Endpoint
echo --------------------------------
echo.
curl http://localhost:3001/api/health
if %errorlevel% == 0 (
    echo.
    echo  SUCCESS! Server is running!
    echo.
    goto next_steps
) else (
    echo.
    echo  Server not responding yet.
    echo.
    echo Possible issues:
    echo 1. Server needs more time (wait 30 more seconds)
    echo 2. There's an error in the server window
    echo 3. Database connection issue
    echo.
    echo Check the server window for error messages!
    echo.
    pause
    exit /b 1
)

:next_steps
echo ================================================
echo  NEXT: Run Database Migrations
echo ================================================
echo.
echo The server is running! Now you need to run migrations.
echo.
echo Option 1: Run migrations via Supabase Dashboard
echo   1. Go to: https://supabase.com/dashboard
echo   2. Open your project
echo   3. Go to SQL Editor
echo   4. Copy/paste each migration file:
echo      - api/migrations/007_student_groups.sql
echo      - api/migrations/008_invoices_expenses.sql
echo      - api/migrations/009_audit_security.sql
echo   5. Run each one
echo.
echo Option 2: If you have psql installed
echo   psql "YOUR_DATABASE_URL" -f api/migrations/007_student_groups.sql
echo   psql "YOUR_DATABASE_URL" -f api/migrations/008_invoices_expenses.sql
echo   psql "YOUR_DATABASE_URL" -f api/migrations/009_audit_security.sql
echo.
echo After migrations, test new endpoints:
echo   curl http://localhost:3001/api/audit/event-types
echo   curl http://localhost:3001/api/dashboard/metrics
echo.
pause








