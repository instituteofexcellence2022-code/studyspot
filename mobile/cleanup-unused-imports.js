#!/usr/bin/env node

/**
 * Cleanup script for removing unused imports and variables
 * This script will automatically remove unused imports and variables
 */

const fs = require('fs');
const path = require('path');

// Files to clean up with their unused imports
const cleanupMap = {
  'App.tsx': ['offlineService'],
  'src/components/OfflineIndicator.tsx': ['Progress', 'lastSyncTime'],
  'src/components/QRScanner.tsx': ['width', 'height', 'handleScan'],
  'src/screens/BookingConfirmationScreen.tsx': ['Spinner', 'clearError', 'isLoading'],
  'src/screens/GamificationScreen.tsx': ['Badge', 'index'],
  'src/screens/LibraryDetailsScreen.tsx': ['Spinner', 'Alert', 'Divider', 'Avatar', 'availability', 'isLoading', 'error', 'setLibrary'],
  'src/screens/LibraryFeePaymentScreen.tsx': ['moment', 'LAYOUT', 'PaymentRequest', 'PaymentResponse', 'dispatch'],
  'src/screens/PaymentScreen.tsx': ['Badge', 'PaymentResponse', 'clearError', 'route', 'currentPayment'],
  'src/screens/QRCodeScreen.tsx': ['Alert', 'Pressable', 'Booking', 'dispatch', 'user', 'tokens'],
  'src/screens/auth/LoginScreen.tsx': ['useState', 'ERROR_MESSAGES'],
  'src/screens/auth/OnboardingScreen.tsx': ['Image'],
  'src/screens/auth/RegisterScreen.tsx': ['useState', 'ERROR_MESSAGES'],
  'src/screens/main/BookingsScreen.tsx': ['clearError', 'user'],
  'src/screens/main/HomeScreen.tsx': ['Alert', 'Divider', 'dispatch', 'nearbyLibraries', 'setNearbyLibraries'],
  'src/screens/main/SearchScreen.tsx': ['Divider', 'value'],
  'src/services/QRCodeService.ts': ['React', 'QRCode'],
  'src/store/slices/authSlice.ts': ['STORAGE_KEYS'],
  'src/store/slices/chatbotSlice.ts': ['ChatbotResponse'],
  'src/store/slices/librariesSlice.ts': ['SeatAvailability'],
  'src/store/slices/notificationsSlice.ts': ['NotificationType'],
  'src/store/slices/paymentsSlice.ts': ['PaymentStatus']
};

function cleanupFile(filePath, unusedItems) {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Remove unused imports
    unusedItems.forEach(item => {
      // Remove from import statements
      const importRegex = new RegExp(`import\\s*{[^}]*\\b${item}\\b[^}]*}\\s*from\\s*['"][^'"]+['"];?\\s*`, 'g');
      if (importRegex.test(content)) {
        content = content.replace(importRegex, (match) => {
          // Remove the specific item from the import
          const cleaned = match.replace(new RegExp(`\\s*,\\s*${item}\\s*`), '').replace(new RegExp(`\\s*${item}\\s*,`), '');
          return cleaned.includes('{') && cleaned.includes('}') ? cleaned : '';
        });
        modified = true;
      }

      // Remove variable declarations
      const varRegex = new RegExp(`\\s*const\\s+${item}\\s*=.*?;\\s*`, 'g');
      if (varRegex.test(content)) {
        content = content.replace(varRegex, '');
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Cleaned up: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
  }
}

console.log('🧹 Starting cleanup of unused imports and variables...\n');

Object.entries(cleanupMap).forEach(([filePath, unusedItems]) => {
  cleanupFile(filePath, unusedItems);
});

console.log('\n✨ Cleanup completed!');






