@echo off
REM ========================================
REM STUDYSPOT - Create .env Files Script
REM ========================================

echo.
echo ========================================
echo   CREATING .env FILES
echo ========================================
echo.

REM Create API .env file
echo Creating api/.env file...
(
echo # ========================================
echo # STUDYSPOT API - Environment Configuration
echo # ========================================
echo.
echo # Environment
echo NODE_ENV=development
echo.
echo # Server Configuration
echo PORT=3001
echo.
echo # Database Configuration ^(Supabase PostgreSQL^)
echo DATABASE_URL=postgresql://postgres.zgrgryufcxgjbmpjiwbh:duGJFGwRuA3TzcOP@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
echo.
echo # JWT Configuration
echo JWT_SECRET=studyspot-jwt-secret-dev-change-in-production-2025
echo JWT_REFRESH_SECRET=studyspot-jwt-refresh-secret-dev-change-in-production-2025
echo JWT_EXPIRES_IN=24h
echo JWT_REFRESH_EXPIRES_IN=7d
echo.
echo # CORS Configuration
echo CORS_ORIGIN=http://localhost:3000,http://localhost:3002,https://studyspot-librarys.vercel.app,https://studyspot-rose.vercel.app
echo.
echo # Redis Configuration ^(Optional^)
echo REDIS_URL=redis://localhost:6379
echo.
echo # Email Configuration
echo EMAIL_ENABLED=false
echo.
echo # Frontend URL
echo FRONTEND_URL=http://localhost:3000
echo.
echo # Rate Limiting
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX_REQUESTS=100
echo.
echo # Logging
echo LOG_LEVEL=info
) > api\.env

echo ✅ Created: api/.env

REM Create web-owner .env file
echo Creating web-owner/.env file...
(
echo # ========================================
echo # STUDYSPOT - Library Owner Portal
echo # Environment Configuration
echo # ========================================
echo.
echo # API Configuration
echo REACT_APP_API_URL=http://localhost:3001
echo.
echo # Portal Configuration
echo REACT_APP_PORTAL_TYPE=owner
echo REACT_APP_PORTAL_NAME=Library Owner Portal
echo REACT_APP_VERSION=1.0.0
echo.
echo # API Timeout ^(milliseconds^)
echo REACT_APP_API_TIMEOUT=30000
echo.
echo # Feature Flags
echo REACT_APP_ENABLE_DEMO=true
echo REACT_APP_ENABLE_SOCIAL_LOGIN=false
echo.
echo # Debug Mode
echo REACT_APP_DEBUG=true
) > web-owner\.env

echo ✅ Created: web-owner/.env

REM Create web-admin .env file
echo Creating web-admin/.env file...
(
echo # ========================================
echo # STUDYSPOT - Admin Portal
echo # Environment Configuration
echo # ========================================
echo.
echo # API Configuration
echo REACT_APP_API_URL=http://localhost:3001
echo.
echo # Portal Configuration
echo REACT_APP_PORTAL_TYPE=admin
echo REACT_APP_PORTAL_NAME=Admin Portal
echo REACT_APP_VERSION=1.0.0
echo.
echo # API Timeout ^(milliseconds^)
echo REACT_APP_API_TIMEOUT=30000
echo.
echo # Feature Flags
echo REACT_APP_ENABLE_DEMO=true
echo REACT_APP_ENABLE_SOCIAL_LOGIN=false
echo.
echo # Debug Mode
echo REACT_APP_DEBUG=true
) > web-admin\.env

echo ✅ Created: web-admin/.env

echo.
echo ========================================
echo   ✅ ALL .env FILES CREATED!
echo ========================================
echo.
echo Created files:
echo   - api/.env
echo   - web-owner/.env
echo   - web-admin/.env
echo.
echo Next steps:
echo   1. Start API server: cd api ^&^& node src/index-unified.js
echo   2. Start Owner Portal: cd web-owner ^&^& npm start
echo   3. Start Admin Portal: cd web-admin ^&^& npm start
echo.
echo ⚠️  IMPORTANT: These files contain your Supabase credentials
echo    Never commit them to git!
echo.
pause

