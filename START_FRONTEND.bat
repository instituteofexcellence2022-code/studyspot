@echo off
echo ========================================
echo 🎓 STUDYSPOT - Starting Frontend
echo ========================================

cd web-owner

echo Setting environment variables...
set REACT_APP_API_URL=http://localhost:3001
set REACT_APP_PORTAL_TYPE=owner
set REACT_APP_PORTAL_NAME=Library Owner Portal
set REACT_APP_VERSION=1.0.0
set REACT_APP_DEBUG=true
set REACT_APP_ENABLE_DEMO=true
set REACT_APP_ENABLE_SOCIAL_LOGIN=false
set REACT_APP_API_TIMEOUT=30000

echo Starting React development server...
npm start

pause




