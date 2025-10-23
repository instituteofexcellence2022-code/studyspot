@echo off
:: Run the database update script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0UPDATE_DATABASE.ps1"
pause


