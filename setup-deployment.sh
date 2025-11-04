#!/bin/bash

# ============================================
# STUDYSPOT DEPLOYMENT SETUP SCRIPT
# ============================================

set -e

echo "🚀 StudySpot Deployment Setup"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm --version) detected${NC}"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
echo ""

echo "Installing backend dependencies..."
cd api
npm install
cd ..

echo "Installing student PWA dependencies..."
cd studyspot-student-pwa
npm install
cd ..

echo "Installing owner portal dependencies..."
cd web-owner
npm install
cd ..

echo "Installing admin portal dependencies..."
cd web-admin-new/frontend
npm install
cd ../../..

echo -e "${GREEN}✅ All dependencies installed${NC}"
echo ""

# Step 2: Database setup
echo "🗄️  Step 2: Database Setup"
echo ""
echo -e "${YELLOW}⚠️  Please ensure you have:${NC}"
echo "  1. Created a Neon.tech account and database"
echo "  2. Copied your DATABASE_URL"
echo ""
read -p "Have you set up your database? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Skipping database setup. Please run migrations manually later.${NC}"
else
    echo "Running database migrations..."
    cd api
    npm run db:migrate
    cd ..
    echo -e "${GREEN}✅ Database migrations completed${NC}"
fi
echo ""

# Step 3: Environment variables
echo "⚙️  Step 3: Environment Variables"
echo ""
echo -e "${YELLOW}📝 Please create the following .env files:${NC}"
echo "  - api/.env (copy from api/env.production.template)"
echo "  - studyspot-student-pwa/.env (copy from studyspot-student-pwa/.env.example)"
echo "  - web-owner/.env (if needed)"
echo "  - web-admin-new/frontend/.env (if needed)"
echo ""
read -p "Have you created all .env files? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please create .env files before deploying.${NC}"
fi
echo ""

# Step 4: Build check
echo "🔨 Step 4: Testing Builds"
echo ""

echo "Building student PWA..."
cd studyspot-student-pwa
npm run build
cd ..
echo -e "${GREEN}✅ Student PWA builds successfully${NC}"

echo "Building owner portal..."
cd web-owner
npm run build
cd ..
echo -e "${GREEN}✅ Owner portal builds successfully${NC}"

echo "Building admin portal..."
cd web-admin-new/frontend
npm run build
cd ../../..
echo -e "${GREEN}✅ Admin portal builds successfully${NC}"
echo ""

# Step 5: Deployment instructions
echo "🚀 Step 5: Deployment Instructions"
echo ""
echo -e "${GREEN}✅ Setup complete! Next steps:${NC}"
echo ""
echo "1. Backend (Railway):"
echo "   - Go to https://railway.app"
echo "   - New Project → Deploy from GitHub"
echo "   - Select repo → api folder"
echo "   - Add environment variables from api/env.production.template"
echo ""
echo "2. Frontend (Vercel):"
echo "   - Install Vercel CLI: npm i -g vercel"
echo "   - cd studyspot-student-pwa && vercel --prod"
echo "   - cd web-owner && vercel --prod"
echo "   - cd web-admin-new/frontend && vercel --prod"
echo ""
echo "3. Database (Neon.tech):"
echo "   - Already configured in Step 2"
echo ""
echo "4. Redis (Railway):"
echo "   - Add Redis service in Railway"
echo "   - Copy REDIS_URL to backend env"
echo ""
echo "5. Cloudflare:"
echo "   - Add your domain"
echo "   - Update DNS records"
echo "   - Enable SSL/TLS"
echo ""
echo -e "${GREEN}🎉 Ready to deploy!${NC}"

