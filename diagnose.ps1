Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🔍 LOGIN ISSUE DIAGNOSTICS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Checking API Status..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ API is responding correctly" -ForegroundColor Green
    Write-Host "   Status: $($health.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "   ❌ API is NOT responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Checking Frontend .env file..." -ForegroundColor Yellow
if (Test-Path web-owner\.env) {
    Write-Host "   ✅ web-owner\.env EXISTS" -ForegroundColor Green
    Write-Host "`n   Content:" -ForegroundColor White
    Get-Content web-owner\.env | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "   ❌ web-owner\.env NOT FOUND" -ForegroundColor Red
    Write-Host "   Run: .\CREATE_ENV_FILES.bat" -ForegroundColor Yellow
}

Write-Host "`n3. Checking API .env file..." -ForegroundColor Yellow
if (Test-Path api\.env) {
    Write-Host "   ✅ api\.env EXISTS" -ForegroundColor Green
    $hasDb = Select-String -Path api\.env -Pattern "DATABASE_URL" -Quiet
    $hasCors = Select-String -Path api\.env -Pattern "CORS_ORIGIN" -Quiet
    
    if ($hasDb) {
        Write-Host "   ✅ DATABASE_URL configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ DATABASE_URL missing" -ForegroundColor Red
    }
    
    if ($hasCors) {
        Write-Host "   ✅ CORS_ORIGIN configured" -ForegroundColor Green
        $corsLine = Select-String -Path api\.env -Pattern "CORS_ORIGIN"
        Write-Host "   $($corsLine.Line)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ CORS_ORIGIN missing" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ api\.env NOT FOUND" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📋 NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "2. Press F12 to open DevTools" -ForegroundColor White
Write-Host "3. Click Console tab" -ForegroundColor White
Write-Host "4. Look for: 'API URL: http://localhost:3001'" -ForegroundColor White
Write-Host "5. Click 'Try Demo Account' button" -ForegroundColor White
Write-Host "6. Watch console for detailed logs" -ForegroundColor White
Write-Host "`n7. Share with me:" -ForegroundColor Yellow
Write-Host "   - Any red errors in console" -ForegroundColor White
Write-Host "   - Error message shown in snackbar" -ForegroundColor White
Write-Host "   - API URL from diagnostic box" -ForegroundColor White

Write-Host "`n========================================`n" -ForegroundColor Cyan


