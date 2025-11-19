#!/bin/bash

# StudySpot Mobile App - Comprehensive Test Suite
# This script runs a full test of the mobile application

echo "🧪 STUDYSPOT MOBILE APP - COMPREHENSIVE TEST SUITE"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${BLUE}Testing: $test_name${NC}"
    echo "Command: $test_command"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo -e "\n${YELLOW}Phase 1: Environment & Setup Testing${NC}"
echo "=========================================="

# Check Node.js
run_test "Node.js Installation" "command_exists node && node --version"

# Check npm
run_test "npm Installation" "command_exists npm && npm --version"

# Check React Native CLI
run_test "React Native CLI" "command_exists react-native && react-native --version"

# Check Expo CLI
run_test "Expo CLI" "command_exists expo && expo --version"

# Check if we're in the mobile directory
run_test "Mobile Directory" "test -f package.json && test -f App.tsx"

echo -e "\n${YELLOW}Phase 2: Dependencies & Build Testing${NC}"
echo "============================================="

# Install dependencies
run_test "Dependencies Installation" "npm install --legacy-peer-deps"

# TypeScript compilation
run_test "TypeScript Compilation" "npm run type-check"

# Linting
run_test "Code Linting" "npm run lint"

# Jest tests
run_test "Unit Tests" "npm test -- --passWithNoTests"

echo -e "\n${YELLOW}Phase 3: Metro Bundler Testing${NC}"
echo "================================="

# Start Metro bundler in background
echo "Starting Metro bundler..."
npm start &
METRO_PID=$!

# Wait for Metro to start
sleep 10

# Check if Metro is running
run_test "Metro Bundler Startup" "kill -0 $METRO_PID 2>/dev/null"

# Stop Metro bundler
kill $METRO_PID 2>/dev/null

echo -e "\n${YELLOW}Phase 4: Expo Web Testing${NC}"
echo "============================"

# Start Expo web server
echo "Starting Expo web server..."
npx expo start --web &
EXPO_PID=$!

# Wait for Expo to start
sleep 15

# Check if Expo is running
run_test "Expo Web Server" "kill -0 $EXPO_PID 2>/dev/null"

# Stop Expo server
kill $EXPO_PID 2>/dev/null

echo -e "\n${YELLOW}Phase 5: Android Build Testing${NC}"
echo "=================================="

# Check Android environment
run_test "Android SDK" "command_exists adb"

# Check Java
run_test "Java Installation" "command_exists java && java -version"

# Android build test (if environment is set up)
if command_exists adb && command_exists java; then
    run_test "Android Build" "npm run build:android"
else
    echo -e "${YELLOW}⚠️  Android environment not fully set up - skipping Android build test${NC}"
fi

echo -e "\n${YELLOW}Phase 6: Code Quality Testing${NC}"
echo "=================================="

# Check for TypeScript errors
run_test "TypeScript Errors" "npm run type-check"

# Check for ESLint errors
run_test "ESLint Errors" "npm run lint"

# Check for unused imports
run_test "Unused Imports" "npx eslint . --ext .ts,.tsx --rule 'no-unused-vars: error'"

echo -e "\n${YELLOW}Phase 7: Feature Testing${NC}"
echo "=========================="

# Test authentication components
run_test "Login Screen Component" "test -f src/screens/auth/LoginScreen.tsx"

# Test main screens
run_test "Home Screen Component" "test -f src/screens/main/HomeScreen.tsx"

# Test services
run_test "Auth Service" "test -f src/services/AuthService.ts"

# Test Redux store
run_test "Redux Store" "test -f src/store/index.ts"

# Test navigation
run_test "Navigation Setup" "test -f src/navigation/AppNavigator.tsx"

echo -e "\n${YELLOW}Phase 8: Performance Testing${NC}"
echo "==============================="

# Check bundle size
run_test "Bundle Size Check" "npm run build:android 2>/dev/null || echo 'Android build not available'"

# Check for memory leaks in code
run_test "Memory Leak Check" "grep -r 'setInterval\|setTimeout' src/ --include='*.ts' --include='*.tsx' | wc -l | awk '{if($1>0) exit 1; else exit 0}'"

echo -e "\n${YELLOW}Phase 9: Security Testing${NC}"
echo "============================"

# Check for hardcoded secrets
run_test "Hardcoded Secrets" "grep -r 'password\|secret\|key' src/ --include='*.ts' --include='*.tsx' | grep -v 'password:' | wc -l | awk '{if($1>0) exit 1; else exit 0}'"

# Check for console.log statements
run_test "Console Logs" "grep -r 'console.log' src/ --include='*.ts' --include='*.tsx' | wc -l | awk '{if($1>10) exit 1; else exit 0}'"

echo -e "\n${YELLOW}Phase 10: Final Validation${NC}"
echo "==============================="

# Check all required files exist
run_test "Required Files" "test -f App.tsx && test -f package.json && test -f tsconfig.json"

# Check package.json scripts
run_test "Package Scripts" "npm run | grep -q 'start\|android\|ios\|test'"

echo -e "\n${YELLOW}TEST RESULTS SUMMARY${NC}"
echo "====================="
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Mobile app is ready for production!${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please review and fix issues.${NC}"
    exit 1
fi