#!/bin/bash

echo "🔧 StudySpot Mobile - Auto Fix Critical Errors"
echo "=============================================="

# Fix React Hook dependency errors
echo "📱 Fixing React Hook dependency errors..."

# Fix OfflineIndicator.tsx
sed -i 's/}, \[isOnline\]);/}, [isOnline, slideAnimation]);/' src/components/OfflineIndicator.tsx

# Fix RecommendationsWidget.tsx  
sed -i 's/}, \[\]);/}, [loadRecommendations]);/' src/components/RecommendationsWidget.tsx

# Fix BookingConfirmationScreen.tsx
sed -i 's/}, \[bookingId\]);/}, [bookingId, loadBookingDetails]);/' src/screens/BookingConfirmationScreen.tsx

# Fix ChatbotScreen.tsx
sed -i 's/}, \[\]);/}, [currentConversationId, dispatch]);/' src/screens/ChatbotScreen.tsx

# Fix GamificationScreen.tsx
sed -i 's/}, \[\]);/}, [loadGamificationData]);/' src/screens/GamificationScreen.tsx

# Fix LibraryDetailsScreen.tsx
sed -i 's/}, \[libraryId\]);/}, [libraryId, loadAvailability]);/' src/screens/LibraryDetailsScreen.tsx

# Fix LibraryFeePaymentScreen.tsx
sed -i 's/}, \[libraryId\]);/}, [libraryId, loadLibraryAndFeePlans]);/' src/screens/LibraryFeePaymentScreen.tsx

# Fix PaymentScreen.tsx
sed -i 's/}, \[\]);/}, [loadRazorpayConfig]);/' src/screens/PaymentScreen.tsx

# Fix QRCodeScreen.tsx
sed -i 's/}, \[\]);/}, [generateQRCode]);/' src/screens/QRCodeScreen.tsx

# Fix RecommendationsScreen.tsx
sed -i 's/}, \[\]);/}, [loadRecommendations]);/' src/screens/RecommendationsScreen.tsx

# Fix BookingsScreen.tsx
sed -i 's/}, \[\]);/}, [loadBookings]);/' src/screens/main/BookingsScreen.tsx

echo "✅ React Hook dependency errors fixed!"

# Fix variable shadowing errors
echo "🔧 Fixing variable shadowing errors..."

# Fix BookingConfirmationScreen.tsx error variable shadowing
sed -i 's/} catch (error) {/} catch (err) {/' src/screens/BookingConfirmationScreen.tsx
sed -i 's/console.error('Error loading booking details:', error);/console.error('Error loading booking details:', err);/' src/screens/BookingConfirmationScreen.tsx

# Fix PaymentScreen.tsx error variable shadowing  
sed -i 's/} catch (error) {/} catch (err) {/' src/screens/PaymentScreen.tsx
sed -i 's/console.error('Payment error:', error);/console.error('Payment error:', err);/' src/screens/PaymentScreen.tsx

echo "✅ Variable shadowing errors fixed!"

# Remove unused imports
echo "🧹 Cleaning up unused imports..."

# Remove unused useState imports
sed -i '/import React, { useState }/d' src/screens/auth/LoginScreen.tsx
sed -i '/import React, { useState }/d' src/screens/auth/RegisterScreen.tsx

echo "✅ Unused imports cleaned!"

echo ""
echo "🎉 Critical errors fixed! Running type check..."
npm run type-check

echo ""
echo "📊 Running linter to check remaining issues..."
npm run lint

echo ""
echo "✅ Auto-fix complete! Check the output above for any remaining issues."






