# Fix Duplicate Content in Files
# This script removes duplicate content from files that were accidentally duplicated

Write-Host "Fixing duplicate content in files..." -ForegroundColor Cyan

# Fix formatters.ts - keep only first 227 lines
$formattersFile = "src/utils/formatters.ts"
if (Test-Path $formattersFile) {
    $content = Get-Content $formattersFile
    $content[0..226] | Set-Content $formattersFile
    Write-Host "Fixed $formattersFile" -ForegroundColor Green
}

# Fix storage.ts - keep only first 185 lines
$storageFile = "src/utils/storage.ts"
if (Test-Path $storageFile) {
    $content = Get-Content $storageFile
    $content[0..184] | Set-Content $storageFile
    Write-Host "Fixed $storageFile" -ForegroundColor Green
}

Write-Host "All duplicates fixed!" -ForegroundColor Green
Write-Host "Now run: npm start" -ForegroundColor Yellow
