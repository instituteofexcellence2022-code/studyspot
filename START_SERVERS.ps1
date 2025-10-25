Write-Host "========================================" -ForegroundColor Green
Write-Host "STUDYSPOT - Starting Servers" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Kill any existing Node.js processes
Write-Host "Stopping existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start API Server
Write-Host "Starting API Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd api; node src/index-simple.js"

# Wait for API server to start
Write-Host "Waiting for API server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Frontend Server
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd web-owner; npm start"

# Wait for frontend to start
Write-Host "Waiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test servers
Write-Host "Testing servers..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing
    Write-Host "✅ API Server: Running" -ForegroundColor Green
} catch {
    Write-Host "❌ API Server: Not responding" -ForegroundColor Red
}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    Write-Host "✅ Frontend Server: Running" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend Server: Not responding" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "🚀 Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host "API Server: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
