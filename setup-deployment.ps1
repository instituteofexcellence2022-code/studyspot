# ============================================
# STUDYSPOT DEPLOYMENT SETUP SCRIPT (PowerShell)
# ============================================

Write-Host "🚀 StudySpot Deployment Setup" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 1: Install dependencies
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location api
npm install
Set-Location ..

Write-Host "Installing student PWA dependencies..." -ForegroundColor Cyan
Set-Location studyspot-student-pwa
npm install
Set-Location ..

Write-Host "Installing owner portal dependencies..." -ForegroundColor Cyan
Set-Location web-owner
npm install
Set-Location ..

Write-Host "Installing admin portal dependencies..." -ForegroundColor Cyan
Set-Location web-admin-new\frontend
npm install
Set-Location ..\..\..

Write-Host "✅ All dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Database setup
Write-Host "🗄️  Step 2: Database Setup" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Please ensure you have:" -ForegroundColor Yellow
Write-Host "  1. Created a Neon.tech account and database"
Write-Host "  2. Copied your DATABASE_URL"
Write-Host ""
$dbSetup = Read-Host "Have you set up your database? (y/n)"
if ($dbSetup -eq "y" -or $dbSetup -eq "Y") {
    Write-Host "Running database migrations..." -ForegroundColor Cyan
    Set-Location api
    npm run db:migrate
    Set-Location ..
    Write-Host "✅ Database migrations completed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Skipping database setup. Please run migrations manually later." -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Environment variables
Write-Host "⚙️  Step 3: Environment Variables" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Please create the following .env files:" -ForegroundColor Yellow
Write-Host "  - api\.env (copy from api\env.production.template)"
Write-Host "  - studyspot-student-pwa\.env (copy from studyspot-student-pwa\.env.example)"
Write-Host "  - web-owner\.env (if needed)"
Write-Host "  - web-admin-new\frontend\.env (if needed)"
Write-Host ""
$envSetup = Read-Host "Have you created all .env files? (y/n)"
if ($envSetup -ne "y" -and $envSetup -ne "Y") {
    Write-Host "⚠️  Please create .env files before deploying." -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Build check
Write-Host "🔨 Step 4: Testing Builds" -ForegroundColor Yellow
Write-Host ""

Write-Host "Building student PWA..." -ForegroundColor Cyan
Set-Location studyspot-student-pwa
npm run build
Set-Location ..
Write-Host "✅ Student PWA builds successfully" -ForegroundColor Green

Write-Host "Building owner portal..." -ForegroundColor Cyan
Set-Location web-owner
npm run build
Set-Location ..
Write-Host "✅ Owner portal builds successfully" -ForegroundColor Green

Write-Host "Building admin portal..." -ForegroundColor Cyan
Set-Location web-admin-new\frontend
npm run build
Set-Location ..\..\.
Write-Host "✅ Admin portal builds successfully" -ForegroundColor Green
Write-Host ""

# Step 5: Deployment instructions
Write-Host "🚀 Step 5: Deployment Instructions" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Setup complete! Next steps:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Backend (Railway):"
Write-Host "   - Go to https://railway.app"
Write-Host "   - New Project → Deploy from GitHub"
Write-Host "   - Select repo → api folder"
Write-Host "   - Add environment variables from api\env.production.template"
Write-Host ""
Write-Host "2. Frontend (Vercel):"
Write-Host "   - Install Vercel CLI: npm i -g vercel"
Write-Host "   - cd studyspot-student-pwa && vercel --prod"
Write-Host "   - cd web-owner && vercel --prod"
Write-Host "   - cd web-admin-new\frontend && vercel --prod"
Write-Host ""
Write-Host "3. Database (Neon.tech):"
Write-Host "   - Already configured in Step 2"
Write-Host ""
Write-Host "4. Redis (Railway):"
Write-Host "   - Add Redis service in Railway"
Write-Host "   - Copy REDIS_URL to backend env"
Write-Host ""
Write-Host "5. Cloudflare:"
Write-Host "   - Add your domain"
Write-Host "   - Update DNS records"
Write-Host "   - Enable SSL/TLS"
Write-Host ""
Write-Host "🎉 Ready to deploy!" -ForegroundColor Green

