#!/bin/bash

# StudySpot Mobile App - Release Preparation Script
# This script prepares the mobile app for release

set -e

echo "🚀 StudySpot - Preparing Release Build"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}Version: $VERSION${NC}"

# 1. Clean previous builds
echo -e "\n${YELLOW}Step 1: Cleaning previous builds...${NC}"
npm run clean
rm -rf node_modules
rm -rf ios/Pods
rm -rf ios/build
rm -rf android/app/build

# 2. Install dependencies
echo -e "\n${YELLOW}Step 2: Installing dependencies...${NC}"
npm install

# 3. Run linter
echo -e "\n${YELLOW}Step 3: Running linter...${NC}"
npm run lint

# 4. Run type check
echo -e "\n${YELLOW}Step 4: Running type check...${NC}"
npm run type-check

# 5. Run tests
echo -e "\n${YELLOW}Step 5: Running tests...${NC}"
npm test -- --coverage

# 6. iOS setup
echo -e "\n${YELLOW}Step 6: Setting up iOS...${NC}"
cd ios
pod install
cd ..

# 7. Check for console.log
echo -e "\n${YELLOW}Step 7: Checking for console.log...${NC}"
CONSOLE_LOGS=$(grep -r "console\.log" src/ --exclude-dir=node_modules || true)
if [ -n "$CONSOLE_LOGS" ]; then
    echo -e "${RED}Warning: Found console.log statements:${NC}"
    echo "$CONSOLE_LOGS"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 8. Check environment configuration
echo -e "\n${YELLOW}Step 8: Checking environment configuration...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${RED}Error: .env.production file not found${NC}"
    exit 1
fi

# 9. Update version numbers
echo -e "\n${YELLOW}Step 9: Updating version numbers...${NC}"
echo "iOS version: $VERSION"
echo "Android version: $VERSION"

# 10. Build summary
echo -e "\n${GREEN}✓ Pre-release checks complete!${NC}"
echo -e "${GREEN}======================================"
echo "Version: $VERSION"
echo "Ready to build for:"
echo "  • iOS: npm run build:ios"
echo "  • Android: npm run build:android"
echo -e "======================================${NC}"

exit 0

