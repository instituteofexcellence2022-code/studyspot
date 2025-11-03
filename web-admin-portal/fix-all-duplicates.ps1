# Fix ALL Duplicate Content in Files
Write-Host "Fixing all duplicate content..." -ForegroundColor Cyan

# Core files
$fixes = @{
    "src/App.tsx" = 209
    "src/store/index.ts" = 43
    "src/theme/index.ts" = 134
    "src/index.css" = 41
    "src/config/constants.ts" = 299
}

foreach ($file in $fixes.Keys) {
    if (Test-Path $file) {
        $lastLine = $fixes[$file]
        $content = Get-Content $file
        $content[0..($lastLine)] | Set-Content $file
        Write-Host "Fixed $file (kept lines 1-$($lastLine + 1))" -ForegroundColor Green
    }
}

Write-Host "All critical files fixed!" -ForegroundColor Green
Write-Host "Restart the server: npm start" -ForegroundColor Yellow


