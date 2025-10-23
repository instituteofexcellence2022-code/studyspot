@echo off
cls
echo ================================================
echo  STUDYSPOT - TEST AND MIGRATE
echo ================================================
echo.

echo Step 1: Starting Backend Server
echo --------------------------------
echo.
cd api
echo Checking for .env file...
if exist .env (
    echo  .env file found!
) else (
    echo  ERROR: .env file missing!
    echo Please run this first, or the automated setup failed.
    pause
    exit /b 1
)
echo.

echo Starting server in new window...
start "StudySpot API Server" cmd /k "npm start"
echo  Server window opened
cd ..
echo.

echo Waiting 20 seconds for server to start...
timeout /t 20 /nobreak
echo.

echo ================================================
echo Step 2: Testing Existing Endpoints
echo ================================================
echo.

echo Test 1: Health Check
echo ---------------------
curl http://localhost:3001/api/health 2>nul
if %errorlevel% == 0 (
    echo  SUCCESS!
) else (
    echo  FAILED - Server may need more time
    echo Please wait 30 more seconds and try:
    echo curl http://localhost:3001/api/health
    pause
    exit /b 1
)
echo.
echo.

echo Test 2: API Root
echo -----------------
curl http://localhost:3001/api 2>nul
echo.
echo.

echo ================================================
echo Step 3: Running Database Migrations
echo ================================================
echo.

echo  Ready to run migrations for Phase 1 features
echo.
echo Migrations to run:
echo   007_student_groups.sql
echo   008_invoices_expenses.sql
echo   009_audit_security.sql
echo.

choice /C YN /M "Run migrations now"
if errorlevel 2 goto skip_migrations

echo.
echo Running migrations...
echo.

echo Migration 1/3: Student Groups
echo -----------------------------
psql "%DATABASE_URL%" -f api/migrations/007_student_groups.sql
if %errorlevel% == 0 (
    echo  Migration 1 complete
) else (
    echo  Migration 1 failed - psql not found or connection error
    echo.
    echo Manual option:
    echo 1. Connect to Supabase dashboard
    echo 2. Go to SQL Editor
    echo 3. Run each migration file manually
    echo.
    pause
    goto skip_migrations
)
echo.

echo Migration 2/3: Invoices & Expenses
echo -----------------------------------
psql "%DATABASE_URL%" -f api/migrations/008_invoices_expenses.sql
if %errorlevel% == 0 (
    echo  Migration 2 complete
) else (
    echo  Migration 2 failed
)
echo.

echo Migration 3/3: Audit & Security
echo --------------------------------
psql "%DATABASE_URL%" -f api/migrations/009_audit_security.sql
if %errorlevel% == 0 (
    echo  Migration 3 complete
) else (
    echo  Migration 3 failed
)
echo.

echo  All migrations complete!
goto test_new_features

:skip_migrations
echo.
echo Skipping migrations...
echo.

:test_new_features
echo ================================================
echo Step 4: Testing New Phase 1 Features
echo ================================================
echo.

echo Test 3: Dashboard Metrics
echo --------------------------
curl http://localhost:3001/api/dashboard/metrics 2>nul
echo.
echo.

echo Test 4: Audit Logs
echo -------------------
curl http://localhost:3001/api/audit/event-types 2>nul
echo.
echo.

echo ================================================
echo  TESTING COMPLETE!
echo ================================================
echo.
echo Next steps:
echo 1. Check the API server window for any errors
echo 2. Test more endpoints using Postman
echo 3. Deploy to production when ready
echo.
pause








