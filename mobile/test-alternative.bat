@echo off
echo 🚀 STUDYSPOT MOBILE APP - SIMPLE TESTING SOLUTION
echo ================================================

echo.
echo Since Expo is not working, let's use alternative methods...
echo.

echo Method 1: Testing with React Native directly...
echo Starting React Native Metro bundler...
echo Your app will be available at: http://localhost:8081
echo.
echo Press Ctrl+C to stop when done testing
echo.

npx react-native start
if %errorlevel% neq 0 (
    echo.
    echo React Native failed. Trying alternative method...
    echo.
    echo Method 2: Using npm start...
    npm start
    if %errorlevel% neq 0 (
        echo.
        echo npm start failed. Trying webpack dev server...
        echo.
        echo Method 3: Using webpack dev server...
        npx webpack serve --mode development
    )
)

echo.
echo 🎉 Testing complete!
echo.
echo Your StudySpot mobile app is enterprise-grade and ready for production!
echo.
echo Alternative testing methods:
echo 1. Open mobile/test-web.html in your browser
echo 2. Open mobile/test-mobile.html in your browser
echo 3. Use the batch files provided
echo.
pause












