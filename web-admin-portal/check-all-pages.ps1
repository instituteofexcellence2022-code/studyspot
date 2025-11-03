# PowerShell script to check all page files for common issues
$ErrorActionPreference = "Continue"

$files = Get-ChildItem -Path "src/modules" -Recurse -Filter "*.tsx" | Where-Object { $_.Directory.Name -eq "pages" }

Write-Host "`n=== Checking $($files.Count) Page Files ===" -ForegroundColor Cyan
Write-Host ""

$issues = @()

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $lines = Get-Content $file.FullName
    $lastLine = $lines[-1]
    
    $hasIssue = $false
    $issueType = @()
    
    # Check if file ends with export
    if ($lastLine -notmatch "export default") {
        $hasIssue = $true
        $issueType += "Missing default export at end"
    }
    
    # Check for unterminated JSX
    if ($content -match "(<[A-Z][a-zA-Z]*[^/>]*>)\s*$") {
        $hasIssue = $true
        $issueType += "Possible unterminated JSX"
    }
    
    # Check for incomplete functions
    if ($content -match "{\s*$") {
        $hasIssue = $true
        $issueType += "Possible incomplete function/block"
    }
    
    if ($hasIssue) {
        $issues += [PSCustomObject]@{
            File = $file.FullName.Replace((Get-Location).Path + "\", "")
            Issues = $issueType -join ", "
            LastLine = $lastLine
        }
        Write-Host "[ISSUE] $($file.Name)" -ForegroundColor Red
        Write-Host "  Issues: $($issueType -join ', ')" -ForegroundColor Yellow
        Write-Host "  Last line: $lastLine" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "[OK] $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Total files: $($files.Count)"
Write-Host "Files with issues: $($issues.Count)" -ForegroundColor $(if ($issues.Count -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($issues.Count -gt 0) {
    Write-Host "Files needing attention:" -ForegroundColor Yellow
    $issues | ForEach-Object {
        Write-Host "  - $($_.File)" -ForegroundColor Yellow
    }
}


