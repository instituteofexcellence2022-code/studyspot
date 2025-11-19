@echo off
echo 🔧 StudySpot Mobile - Auto Fix Critical Errors
echo ==============================================

echo 📱 Fixing React Hook dependency errors...

REM Fix OfflineIndicator.tsx - add slideAnimation to dependency array
powershell -Command "(Get-Content 'src\components\OfflineIndicator.tsx') -replace '}, \[isOnline\]\);', '}, [isOnline, slideAnimation]);' | Set-Content 'src\components\OfflineIndicator.tsx'"

REM Fix RecommendationsWidget.tsx
powershell -Command "(Get-Content 'src\components\RecommendationsWidget.tsx') -replace '}, \[\]\);', '}, [loadRecommendations]);' | Set-Content 'src\components\RecommendationsWidget.tsx'"

REM Fix BookingConfirmationScreen.tsx
powershell -Command "(Get-Content 'src\screens\BookingConfirmationScreen.tsx') -replace '}, \[bookingId\]\);', '}, [bookingId, loadBookingDetails]);' | Set-Content 'src\screens\BookingConfirmationScreen.tsx'"

REM Fix ChatbotScreen.tsx
powershell -Command "(Get-Content 'src\screens\ChatbotScreen.tsx') -replace '}, \[\]\);', '}, [currentConversationId, dispatch]);' | Set-Content 'src\screens\ChatbotScreen.tsx'"

REM Fix GamificationScreen.tsx
powershell -Command "(Get-Content 'src\screens\GamificationScreen.tsx') -replace '}, \[\]\);', '}, [loadGamificationData]);' | Set-Content 'src\screens\GamificationScreen.tsx'"

REM Fix LibraryDetailsScreen.tsx
powershell -Command "(Get-Content 'src\screens\LibraryDetailsScreen.tsx') -replace '}, \[libraryId\]\);', '}, [libraryId, loadAvailability]);' | Set-Content 'src\screens\LibraryDetailsScreen.tsx'"

REM Fix LibraryFeePaymentScreen.tsx
powershell -Command "(Get-Content 'src\screens\LibraryFeePaymentScreen.tsx') -replace '}, \[libraryId\]\);', '}, [libraryId, loadLibraryAndFeePlans]);' | Set-Content 'src\screens\LibraryFeePaymentScreen.tsx'"

REM Fix PaymentScreen.tsx
powershell -Command "(Get-Content 'src\screens\PaymentScreen.tsx') -replace '}, \[\]\);', '}, [loadRazorpayConfig]);' | Set-Content 'src\screens\PaymentScreen.tsx'"

REM Fix QRCodeScreen.tsx
powershell -Command "(Get-Content 'src\screens\QRCodeScreen.tsx') -replace '}, \[\]\);', '}, [generateQRCode]);' | Set-Content 'src\screens\QRCodeScreen.tsx'"

REM Fix RecommendationsScreen.tsx
powershell -Command "(Get-Content 'src\screens\RecommendationsScreen.tsx') -replace '}, \[\]\);', '}, [loadRecommendations]);' | Set-Content 'src\screens\RecommendationsScreen.tsx'"

REM Fix BookingsScreen.tsx
powershell -Command "(Get-Content 'src\screens\main\BookingsScreen.tsx') -replace '}, \[\]\);', '}, [loadBookings]);' | Set-Content 'src\screens\main\BookingsScreen.tsx'"

echo ✅ React Hook dependency errors fixed!

echo 🔧 Fixing variable shadowing errors...

REM Fix BookingConfirmationScreen.tsx error variable shadowing
powershell -Command "(Get-Content 'src\screens\BookingConfirmationScreen.tsx') -replace '} catch \(error\) \{', '} catch (err) {' | Set-Content 'src\screens\BookingConfirmationScreen.tsx'"
powershell -Command "(Get-Content 'src\screens\BookingConfirmationScreen.tsx') -replace 'console\.error\(''Error loading booking details:'', error\);', 'console.error(''Error loading booking details:'', err);' | Set-Content 'src\screens\BookingConfirmationScreen.tsx'"

REM Fix PaymentScreen.tsx error variable shadowing
powershell -Command "(Get-Content 'src\screens\PaymentScreen.tsx') -replace '} catch \(error\) \{', '} catch (err) {' | Set-Content 'src\screens\PaymentScreen.tsx'"
powershell -Command "(Get-Content 'src\screens\PaymentScreen.tsx') -replace 'console\.error\(''Payment error:'', error\);', 'console.error(''Payment error:'', err);' | Set-Content 'src\screens\PaymentScreen.tsx'"

echo ✅ Variable shadowing errors fixed!

echo 🧹 Cleaning up unused imports...

REM Remove unused useState imports
powershell -Command "(Get-Content 'src\screens\auth\LoginScreen.tsx') -replace 'import React, \{ useState \}', 'import React' | Set-Content 'src\screens\auth\LoginScreen.tsx'"
powershell -Command "(Get-Content 'src\screens\auth\RegisterScreen.tsx') -replace 'import React, \{ useState \}', 'import React' | Set-Content 'src\screens\auth\RegisterScreen.tsx'"

echo ✅ Unused imports cleaned!

echo.
echo 🎉 Critical errors fixed! Running type check...
npm run type-check

echo.
echo 📊 Running linter to check remaining issues...
npm run lint

echo.
echo ✅ Auto-fix complete! Check the output above for any remaining issues.
pause






