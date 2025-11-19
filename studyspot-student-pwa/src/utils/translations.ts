// Translation utilities for English and Hindi

export type Language = 'en' | 'hi';

export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

// Common translations
export const translations: Translations = {
  // Profile
  'profile.title': {
    en: 'Profile',
    hi: 'प्रोफ़ाइल',
  },
  'profile.edit': {
    en: 'Edit Profile',
    hi: 'प्रोफ़ाइल संपादित करें',
  },
  'profile.save': {
    en: 'Save Changes',
    hi: 'परिवर्तन सहेजें',
  },
  'profile.cancel': {
    en: 'Cancel',
    hi: 'रद्द करें',
  },
  'profile.logout': {
    en: 'Logout',
    hi: 'लॉग आउट',
  },
  'profile.share': {
    en: 'Share Profile',
    hi: 'प्रोफ़ाइल साझा करें',
  },
  'profile.notifications': {
    en: 'Notification Settings',
    hi: 'सूचना सेटिंग्स',
  },
  'profile.privacy': {
    en: 'Privacy & Security',
    hi: 'गोपनीयता और सुरक्षा',
  },
  'profile.language': {
    en: 'Language',
    hi: 'भाषा',
  },
  'profile.about': {
    en: 'About',
    hi: 'के बारे में',
  },
  'profile.help': {
    en: 'Help & Support',
    hi: 'सहायता और समर्थन',
  },
  // Language
  'language.title': {
    en: 'Language Settings',
    hi: 'भाषा सेटिंग्स',
  },
  'language.subtitle': {
    en: 'Choose your preferred language',
    hi: 'अपनी पसंदीदा भाषा चुनें',
  },
  'language.english': {
    en: 'English',
    hi: 'अंग्रेजी',
  },
  'language.hindi': {
    en: 'Hindi',
    hi: 'हिंदी',
  },
  'language.current': {
    en: 'Current Language',
    hi: 'वर्तमान भाषा',
  },
  'language.save': {
    en: 'Save Language',
    hi: 'भाषा सहेजें',
  },
  // Common
  'common.save': {
    en: 'Save',
    hi: 'सहेजें',
  },
  'common.cancel': {
    en: 'Cancel',
    hi: 'रद्द करें',
  },
  'common.close': {
    en: 'Close',
    hi: 'बंद करें',
  },
  'common.loading': {
    en: 'Loading...',
    hi: 'लोड हो रहा है...',
  },
  'common.success': {
    en: 'Success',
    hi: 'सफल',
  },
  'common.error': {
    en: 'Error',
    hi: 'त्रुटि',
  },
  // Navigation
  'nav.dashboard': {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
  },
  'nav.libraries': {
    en: 'Libraries',
    hi: 'पुस्तकालय',
  },
  'nav.bookings': {
    en: 'Bookings',
    hi: 'बुकिंग',
  },
  'nav.profile': {
    en: 'Profile',
    hi: 'प्रोफ़ाइल',
  },
  'nav.rewards': {
    en: 'Rewards',
    hi: 'इनाम',
  },
  // Actions
  'action.view': {
    en: 'View',
    hi: 'देखें',
  },
  'action.edit': {
    en: 'Edit',
    hi: 'संपादित करें',
  },
  'action.delete': {
    en: 'Delete',
    hi: 'हटाएं',
  },
  'action.cancel': {
    en: 'Cancel',
    hi: 'रद्द करें',
  },
  'action.confirm': {
    en: 'Confirm',
    hi: 'पुष्टि करें',
  },
  'action.submit': {
    en: 'Submit',
    hi: 'जमा करें',
  },
  'action.search': {
    en: 'Search',
    hi: 'खोजें',
  },
  'action.filter': {
    en: 'Filter',
    hi: 'फ़िल्टर',
  },
  // Status
  'status.loading': {
    en: 'Loading...',
    hi: 'लोड हो रहा है...',
  },
  'status.success': {
    en: 'Success',
    hi: 'सफल',
  },
  'status.failed': {
    en: 'Failed',
    hi: 'असफल',
  },
  'status.pending': {
    en: 'Pending',
    hi: 'लंबित',
  },
  'status.completed': {
    en: 'Completed',
    hi: 'पूर्ण',
  },
  // Navigation & Menu
  'nav.home': {
    en: 'Home',
    hi: 'होम',
  },
  'nav.myBookings': {
    en: 'My Bookings',
    hi: 'मेरी बुकिंग',
  },
  'nav.favorites': {
    en: 'Favorites',
    hi: 'पसंदीदा',
  },
  'nav.studyTools': {
    en: 'Study Tools',
    hi: 'अध्ययन उपकरण',
  },
  'nav.attendance': {
    en: 'Attendance',
    hi: 'उपस्थिति',
  },
  'nav.studyTimer': {
    en: 'Study Timer',
    hi: 'अध्ययन टाइमर',
  },
  'nav.tasksGoals': {
    en: 'Tasks & Goals',
    hi: 'कार्य और लक्ष्य',
  },
  'nav.community': {
    en: 'Community',
    hi: 'समुदाय',
  },
  'nav.referEarn': {
    en: 'Refer & Earn',
    hi: 'रेफर करें और कमाएं',
  },
  'nav.account': {
    en: 'Account',
    hi: 'खाता',
  },
  'nav.payments': {
    en: 'Payments',
    hi: 'भुगतान',
  },
  'nav.myReviews': {
    en: 'My Reviews',
    hi: 'मेरी समीक्षा',
  },
  'nav.manageBookings': {
    en: 'Manage Bookings',
    hi: 'बुकिंग प्रबंधित करें',
  },
  'nav.resources': {
    en: 'Resources',
    hi: 'संसाधन',
  },
  'nav.issues': {
    en: 'Issues',
    hi: 'समस्याएं',
  },
  'nav.support': {
    en: 'Support',
    hi: 'सहायता',
  },
  'nav.announcements': {
    en: 'Announcements',
    hi: 'घोषणाएं',
  },
  'nav.qrScanner': {
    en: 'QR Scanner',
    hi: 'QR स्कैनर',
  },
  'nav.logout': {
    en: 'Logout',
    hi: 'लॉग आउट',
  },
  'nav.main': {
    en: 'Main',
    hi: 'मुख्य',
  },
  'nav.communityRewards': {
    en: 'Community & Rewards',
    hi: 'समुदाय और इनाम',
  },
  'nav.more': {
    en: 'More',
    hi: 'अधिक',
  },
  'nav.analytics': {
    en: 'Analytics',
    hi: 'विश्लेषण',
  },
  // Dashboard
  'dashboard.welcome': {
    en: 'Welcome back',
    hi: 'वापसी पर स्वागत है',
  },
  'dashboard.greeting': {
    en: 'Hello',
    hi: 'नमस्ते',
  },
  'dashboard.quickActions': {
    en: 'Quick Actions',
    hi: 'त्वरित कार्य',
  },
  'dashboard.recentBookings': {
    en: 'Recent Bookings',
    hi: 'हाल की बुकिंग',
  },
  'dashboard.upcoming': {
    en: 'Upcoming',
    hi: 'आगामी',
  },
  'dashboard.statistics': {
    en: 'Statistics',
    hi: 'आंकड़े',
  },
  'dashboard.viewAll': {
    en: 'View All',
    hi: 'सभी देखें',
  },
  'dashboard.browse': {
    en: 'Browse',
    hi: 'ब्राउज़ करें',
  },
  'dashboard.scanQR': {
    en: 'Scan QR',
    hi: 'QR स्कैन करें',
  },
  'dashboard.timer': {
    en: 'Timer',
    hi: 'टाइमर',
  },
  'dashboard.sessions': {
    en: 'Sessions',
    hi: 'सत्र',
  },
  'dashboard.all': {
    en: 'All',
    hi: 'सभी',
  },
  // Libraries
  'libraries.title': {
    en: 'Libraries',
    hi: 'पुस्तकालय',
  },
  'libraries.search': {
    en: 'Search libraries...',
    hi: 'पुस्तकालय खोजें...',
  },
  'libraries.filter': {
    en: 'Filter',
    hi: 'फ़िल्टर',
  },
  'libraries.viewDetails': {
    en: 'View Details',
    hi: 'विवरण देखें',
  },
  'libraries.bookNow': {
    en: 'Book Now',
    hi: 'अभी बुक करें',
  },
  'libraries.available': {
    en: 'Available',
    hi: 'उपलब्ध',
  },
  'libraries.full': {
    en: 'Full',
    hi: 'भरा हुआ',
  },
  'libraries.placesToStudy': {
    en: 'amazing places to study',
    hi: 'अध्ययन के लिए अद्भुत स्थान',
  },
  'libraries.filterAll': {
    en: 'All',
    hi: 'सभी',
  },
  'libraries.filterFeatured': {
    en: 'Featured',
    hi: 'विशेष',
  },
  'libraries.filterTopRated': {
    en: 'Top Rated',
    hi: 'शीर्ष रेटेड',
  },
  'libraries.noLibrariesFound': {
    en: 'No libraries found',
    hi: 'कोई पुस्तकालय नहीं मिला',
  },
  'libraries.tryAdjusting': {
    en: 'Try adjusting your search or filters',
    hi: 'अपनी खोज या फ़िल्टर को समायोजित करने का प्रयास करें',
  },
  'libraries.live': {
    en: 'Live',
    hi: 'लाइव',
  },
  // Bookings
  'bookings.title': {
    en: 'My Bookings',
    hi: 'मेरी बुकिंग',
  },
  'bookings.active': {
    en: 'Active',
    hi: 'सक्रिय',
  },
  'bookings.upcoming': {
    en: 'Upcoming',
    hi: 'आगामी',
  },
  'bookings.past': {
    en: 'Past',
    hi: 'पिछली',
  },
  'bookings.cancelled': {
    en: 'Cancelled',
    hi: 'रद्द',
  },
  'bookings.noBookings': {
    en: 'No bookings found',
    hi: 'कोई बुकिंग नहीं मिली',
  },
  'bookings.cancel': {
    en: 'Cancel Booking',
    hi: 'बुकिंग रद्द करें',
  },
  'bookings.subtitle': {
    en: 'Manage your study sessions',
    hi: 'अपने अध्ययन सत्र प्रबंधित करें',
  },
  'bookings.other': {
    en: 'Other',
    hi: 'अन्य',
  },
  'bookings.loading': {
    en: 'Loading your bookings...',
    hi: 'आपकी बुकिंग लोड हो रही है...',
  },
  'bookings.noBookingsInCategory': {
    en: "You don't have any bookings in this category.",
    hi: 'इस श्रेणी में आपकी कोई बुकिंग नहीं है।',
  },
  'bookings.browseLibraries': {
    en: 'Browse Libraries',
    hi: 'पुस्तकालय ब्राउज़ करें',
  },
  'bookings.date': {
    en: 'Date',
    hi: 'तारीख',
  },
  'bookings.seat': {
    en: 'Seat',
    hi: 'सीट',
  },
  'bookings.time': {
    en: 'Time',
    hi: 'समय',
  },
  'bookings.amount': {
    en: 'Amount',
    hi: 'राशि',
  },
  'bookings.qrCode': {
    en: 'QR Code',
    hi: 'QR कोड',
  },
  'bookings.receipt': {
    en: 'Receipt',
    hi: 'रसीद',
  },
  'bookings.leaveReview': {
    en: 'Leave a Review',
    hi: 'समीक्षा लिखें',
  },
  // Common UI
  'ui.back': {
    en: 'Back',
    hi: 'वापस',
  },
  'ui.next': {
    en: 'Next',
    hi: 'अगला',
  },
  'ui.previous': {
    en: 'Previous',
    hi: 'पिछला',
  },
  'ui.more': {
    en: 'More',
    hi: 'अधिक',
  },
  'ui.less': {
    en: 'Less',
    hi: 'कम',
  },
  'ui.select': {
    en: 'Select',
    hi: 'चुनें',
  },
  'ui.choose': {
    en: 'Choose',
    hi: 'चुनें',
  },
  'ui.continue': {
    en: 'Continue',
    hi: 'जारी रखें',
  },
  'ui.finish': {
    en: 'Finish',
    hi: 'समाप्त करें',
  },
  'ui.close': {
    en: 'Close',
    hi: 'बंद करें',
  },
  'ui.open': {
    en: 'Open',
    hi: 'खोलें',
  },
  'ui.yes': {
    en: 'Yes',
    hi: 'हाँ',
  },
  'ui.no': {
    en: 'No',
    hi: 'नहीं',
  },
  // Time & Date
  'time.today': {
    en: 'Today',
    hi: 'आज',
  },
  'time.tomorrow': {
    en: 'Tomorrow',
    hi: 'कल',
  },
  'time.yesterday': {
    en: 'Yesterday',
    hi: 'कल',
  },
  'time.thisWeek': {
    en: 'This Week',
    hi: 'इस सप्ताह',
  },
  'time.thisMonth': {
    en: 'This Month',
    hi: 'इस महीने',
  },
  'time.hours': {
    en: 'Hours',
    hi: 'घंटे',
  },
  'time.minutes': {
    en: 'Minutes',
    hi: 'मिनट',
  },
  'time.days': {
    en: 'Days',
    hi: 'दिन',
  },
  // Messages
  'message.success': {
    en: 'Success',
    hi: 'सफल',
  },
  'message.error': {
    en: 'Error',
    hi: 'त्रुटि',
  },
  'message.warning': {
    en: 'Warning',
    hi: 'चेतावनी',
  },
  'message.info': {
    en: 'Info',
    hi: 'जानकारी',
  },
  'message.saved': {
    en: 'Saved successfully',
    hi: 'सफलतापूर्वक सहेजा गया',
  },
  'message.deleted': {
    en: 'Deleted successfully',
    hi: 'सफलतापूर्वक हटाया गया',
  },
  'message.updated': {
    en: 'Updated successfully',
    hi: 'सफलतापूर्वक अपडेट किया गया',
  },
  'message.failed': {
    en: 'Operation failed',
    hi: 'ऑपरेशन विफल',
  },
  'message.tryAgain': {
    en: 'Please try again',
    hi: 'कृपया पुनः प्रयास करें',
  },
  // Profile Section
  'profile.editProfile': {
    en: 'Edit Profile',
    hi: 'प्रोफ़ाइल संपादित करें',
  },
  'profile.share': {
    en: 'Share',
    hi: 'साझा करें',
  },
  'profile.shareProfile': {
    en: 'Share Profile',
    hi: 'प्रोफ़ाइल साझा करें',
  },
  'profile.account': {
    en: 'Account',
    hi: 'खाता',
  },
  'profile.settings': {
    en: 'Settings',
    hi: 'सेटिंग्स',
  },
  'profile.support': {
    en: 'Support',
    hi: 'सहायता',
  },
  'profile.paymentMethods': {
    en: 'Payment Methods',
    hi: 'भुगतान विधियां',
  },
  'profile.managePaymentOptions': {
    en: 'Manage your payment options',
    hi: 'अपने भुगतान विकल्प प्रबंधित करें',
  },
  'profile.viewBookingHistory': {
    en: 'View booking history',
    hi: 'बुकिंग इतिहास देखें',
  },
  'profile.reviewsWritten': {
    en: "Reviews you've written",
    hi: 'आपकी लिखी गई समीक्षाएं',
  },
  'profile.manageNotificationPreferences': {
    en: 'Manage your notification preferences',
    hi: 'अपनी सूचना प्राथमिकताएं प्रबंधित करें',
  },
  'profile.controlPrivacySettings': {
    en: 'Control your privacy settings',
    hi: 'अपनी गोपनीयता सेटिंग्स नियंत्रित करें',
  },
  'profile.helpCenter': {
    en: 'Help Center',
    hi: 'सहायता केंद्र',
  },
  'profile.getHelpWithAccount': {
    en: 'Get help with your account',
    hi: 'अपने खाते के साथ सहायता प्राप्त करें',
  },
  'profile.shareApp': {
    en: 'Share App',
    hi: 'ऐप साझा करें',
  },
  'profile.inviteFriends': {
    en: 'Invite friends to StudySpot',
    hi: 'दोस्तों को StudySpot में आमंत्रित करें',
  },
  'profile.about': {
    en: 'About',
    hi: 'के बारे में',
  },
  'profile.version': {
    en: 'Version',
    hi: 'संस्करण',
  },
  'profile.bookings': {
    en: 'Bookings',
    hi: 'बुकिंग',
  },
  'profile.reviews': {
    en: 'Reviews',
    hi: 'समीक्षाएं',
  },
  'profile.points': {
    en: 'Points',
    hi: 'अंक',
  },
  'profile.days': {
    en: 'Days',
    hi: 'दिन',
  },
  'profile.firstName': {
    en: 'First Name',
    hi: 'पहला नाम',
  },
  'profile.lastName': {
    en: 'Last Name',
    hi: 'अंतिम नाम',
  },
  'profile.email': {
    en: 'Email',
    hi: 'ईमेल',
  },
  'profile.phone': {
    en: 'Phone',
    hi: 'फ़ोन',
  },
  'profile.city': {
    en: 'City',
    hi: 'शहर',
  },
  'profile.saving': {
    en: 'Saving...',
    hi: 'सहेजा जा रहा है...',
  },
  'profile.saveChanges': {
    en: 'Save Changes',
    hi: 'परिवर्तन सहेजें',
  },
  'profile.aadhaarKyc': {
    en: 'Aadhaar KYC Verification',
    hi: 'आधार KYC सत्यापन',
  },
  'profile.verifyIdentity': {
    en: 'Verify your identity with Aadhaar',
    hi: 'आधार के साथ अपनी पहचान सत्यापित करें',
  },
  'kyc.title': {
    en: 'Aadhaar KYC Verification',
    hi: 'आधार KYC सत्यापन',
  },
  'kyc.subtitle': {
    en: 'Verify your identity to complete enrollment. This information may be shared with libraries when you enroll.',
    hi: 'नामांकन पूरा करने के लिए अपनी पहचान सत्यापित करें। यह जानकारी नामांकन के समय पुस्तकालयों के साथ साझा की जा सकती है।',
  },
  'kyc.aadhaarNumber': {
    en: 'Aadhaar Number',
    hi: 'आधार नंबर',
  },
  'kyc.aadhaarNumberPlaceholder': {
    en: 'Enter 12-digit Aadhaar number',
    hi: '12 अंकों का आधार नंबर दर्ज करें',
  },
  'kyc.fullName': {
    en: 'Full Name (as per Aadhaar)',
    hi: 'पूरा नाम (आधार के अनुसार)',
  },
  'kyc.fullNamePlaceholder': {
    en: 'Enter name exactly as on Aadhaar',
    hi: 'आधार पर जैसा नाम है वैसा ही दर्ज करें',
  },
  'kyc.dateOfBirth': {
    en: 'Date of Birth',
    hi: 'जन्म तिथि',
  },
  'kyc.gender': {
    en: 'Gender',
    hi: 'लिंग',
  },
  'kyc.address': {
    en: 'Address (as per Aadhaar)',
    hi: 'पता (आधार के अनुसार)',
  },
  'kyc.addressPlaceholder': {
    en: 'Enter address as on Aadhaar',
    hi: 'आधार पर जैसा पता है वैसा ही दर्ज करें',
  },
  'kyc.pincode': {
    en: 'PIN Code',
    hi: 'पिन कोड',
  },
  'kyc.pincodePlaceholder': {
    en: 'Enter 6-digit PIN code',
    hi: '6 अंकों का पिन कोड दर्ज करें',
  },
  'kyc.status': {
    en: 'Verification Status',
    hi: 'सत्यापन स्थिति',
  },
  'kyc.statusPending': {
    en: 'Pending Verification',
    hi: 'सत्यापन लंबित',
  },
  'kyc.statusVerified': {
    en: 'Verified',
    hi: 'सत्यापित',
  },
  'kyc.statusRejected': {
    en: 'Rejected',
    hi: 'अस्वीकृत',
  },
  'kyc.verifyNow': {
    en: 'Verify Now',
    hi: 'अभी सत्यापित करें',
  },
  'kyc.updateKyc': {
    en: 'Update KYC',
    hi: 'KYC अपडेट करें',
  },
  'kyc.submit': {
    en: 'Submit for Verification',
    hi: 'सत्यापन के लिए सबमिट करें',
  },
  'kyc.submitting': {
    en: 'Submitting...',
    hi: 'सबमिट किया जा रहा है...',
  },
  'kyc.kycSubmitted': {
    en: 'KYC submitted successfully! Verification will be completed within 24-48 hours.',
    hi: 'KYC सफलतापूर्वक सबमिट किया गया! सत्यापन 24-48 घंटों के भीतर पूरा हो जाएगा।',
  },
  'kyc.kycUpdated': {
    en: 'KYC updated successfully!',
    hi: 'KYC सफलतापूर्वक अपडेट किया गया!',
  },
  'kyc.failedToSubmit': {
    en: 'Failed to submit KYC. Please try again.',
    hi: 'KYC सबमिट करने में विफल। कृपया पुनः प्रयास करें।',
  },
  'kyc.whyVerify': {
    en: 'Why verify?',
    hi: 'क्यों सत्यापित करें?',
  },
  'kyc.whyVerifyDesc': {
    en: 'Aadhaar verification helps libraries verify student identity and ensures secure enrollment. Your data is encrypted and securely stored.',
    hi: 'आधार सत्यापन पुस्तकालयों को छात्र पहचान सत्यापित करने में मदद करता है और सुरक्षित नामांकन सुनिश्चित करता है। आपका डेटा एन्क्रिप्टेड और सुरक्षित रूप से संग्रहीत है।',
  },
  'kyc.male': {
    en: 'Male',
    hi: 'पुरुष',
  },
  'kyc.female': {
    en: 'Female',
    hi: 'महिला',
  },
  'kyc.other': {
    en: 'Other',
    hi: 'अन्य',
  },
  'kyc.required': {
    en: 'This field is required',
    hi: 'यह फ़ील्ड आवश्यक है',
  },
  'kyc.invalidAadhaar': {
    en: 'Please enter a valid 12-digit Aadhaar number',
    hi: 'कृपया एक वैध 12 अंकों का आधार नंबर दर्ज करें',
  },
  'kyc.invalidPincode': {
    en: 'Please enter a valid 6-digit PIN code',
    hi: 'कृपया एक वैध 6 अंकों का पिन कोड दर्ज करें',
  },
  'kyc.enterAadhaar': {
    en: 'Enter your 12-digit Aadhaar number',
    hi: 'अपना 12 अंकों का आधार नंबर दर्ज करें',
  },
  'kyc.sendOtp': {
    en: 'Send OTP',
    hi: 'OTP भेजें',
  },
  'kyc.sendingOtp': {
    en: 'Sending OTP...',
    hi: 'OTP भेजा जा रहा है...',
  },
  'kyc.enterOtp': {
    en: 'Enter OTP',
    hi: 'OTP दर्ज करें',
  },
  'kyc.otpSent': {
    en: 'OTP sent to your Aadhaar-linked mobile number',
    hi: 'OTP आपके Aadhaar से जुड़े मोबाइल नंबर पर भेजा गया है',
  },
  'kyc.verifyOtp': {
    en: 'Verify OTP',
    hi: 'OTP सत्यापित करें',
  },
  'kyc.verifyingOtp': {
    en: 'Verifying OTP...',
    hi: 'OTP सत्यापित किया जा रहा है...',
  },
  'kyc.invalidOtp': {
    en: 'Please enter a valid 6-digit OTP',
    hi: 'कृपया वैध 6 अंकों का OTP दर्ज करें',
  },
  'kyc.changeAadhaar': {
    en: 'Change Aadhaar Number',
    hi: 'आधार नंबर बदलें',
  },
  // Notification Settings
  'notifications.title': {
    en: 'Notification Settings',
    hi: 'सूचना सेटिंग्स',
  },
  'notifications.manageHowYouReceive': {
    en: 'Manage how you receive notifications',
    hi: 'प्रबंधित करें कि आप सूचनाएं कैसे प्राप्त करते हैं',
  },
  'notifications.allEnabled': {
    en: 'All Enabled',
    hi: 'सभी सक्षम',
  },
  'notifications.enableAll': {
    en: 'Enable All',
    hi: 'सभी सक्षम करें',
  },
  'notifications.disableAll': {
    en: 'Disable All',
    hi: 'सभी अक्षम करें',
  },
  'notifications.channels': {
    en: 'Notification Channels',
    hi: 'सूचना चैनल',
  },
  'notifications.emailNotifications': {
    en: 'Email Notifications',
    hi: 'ईमेल सूचनाएं',
  },
  'notifications.receiveViaEmail': {
    en: 'Receive notifications via email',
    hi: 'ईमेल के माध्यम से सूचनाएं प्राप्त करें',
  },
  'notifications.pushNotifications': {
    en: 'Push Notifications',
    hi: 'पुश सूचनाएं',
  },
  'notifications.receiveOnDevice': {
    en: 'Receive notifications on your device',
    hi: 'अपने डिवाइस पर सूचनाएं प्राप्त करें',
  },
  'notifications.smsNotifications': {
    en: 'SMS Notifications',
    hi: 'SMS सूचनाएं',
  },
  'notifications.receiveViaSMS': {
    en: 'Receive notifications via SMS',
    hi: 'SMS के माध्यम से सूचनाएं प्राप्त करें',
  },
  'notifications.types': {
    en: 'Notification Types',
    hi: 'सूचना प्रकार',
  },
  'notifications.bookingReminders': {
    en: 'Booking Reminders',
    hi: 'बुकिंग अनुस्मारक',
  },
  'notifications.paymentReminders': {
    en: 'Payment Reminders',
    hi: 'भुगतान अनुस्मारक',
  },
  'notifications.promotionalOffers': {
    en: 'Promotional Offers',
    hi: 'प्रचारक ऑफ़र',
  },
  'notifications.achievementAlerts': {
    en: 'Achievement Alerts',
    hi: 'उपलब्धि अलर्ट',
  },
  'notifications.libraryUpdates': {
    en: 'Library Updates',
    hi: 'पुस्तकालय अपडेट',
  },
  'notifications.communityUpdates': {
    en: 'Community Updates',
    hi: 'समुदाय अपडेट',
  },
  'notifications.advancedSettings': {
    en: 'Advanced Settings',
    hi: 'उन्नत सेटिंग्स',
  },
  'notifications.frequency': {
    en: 'Notification Frequency',
    hi: 'सूचना आवृत्ति',
  },
  'notifications.realTime': {
    en: 'Real-time',
    hi: 'वास्तविक समय',
  },
  'notifications.hourly': {
    en: 'Hourly',
    hi: 'प्रति घंटा',
  },
  'notifications.daily': {
    en: 'Daily',
    hi: 'दैनिक',
  },
  'notifications.quietHours': {
    en: 'Quiet Hours',
    hi: 'शांत घंटे',
  },
  'notifications.soundVibration': {
    en: 'Sound & Vibration',
    hi: 'ध्वनि और कंपन',
  },
  'notifications.priorityOnly': {
    en: 'Priority Only',
    hi: 'केवल प्राथमिकता',
  },
  'notifications.save': {
    en: 'Save Settings',
    hi: 'सेटिंग्स सहेजें',
  },
  // Privacy & Security
  'privacy.title': {
    en: 'Privacy & Security',
    hi: 'गोपनीयता और सुरक्षा',
  },
  'privacy.changePassword': {
    en: 'Change Password',
    hi: 'पासवर्ड बदलें',
  },
  'privacy.currentPassword': {
    en: 'Current Password',
    hi: 'वर्तमान पासवर्ड',
  },
  'privacy.newPassword': {
    en: 'New Password',
    hi: 'नया पासवर्ड',
  },
  'privacy.confirmPassword': {
    en: 'Confirm Password',
    hi: 'पासवर्ड की पुष्टि करें',
  },
  'privacy.securitySettings': {
    en: 'Security Settings',
    hi: 'सुरक्षा सेटिंग्स',
  },
  'privacy.twoFactorAuth': {
    en: 'Two-Factor Authentication',
    hi: 'दो-कारक प्रमाणीकरण',
  },
  'privacy.loginAlerts': {
    en: 'Login Alerts',
    hi: 'लॉगिन अलर्ट',
  },
  'privacy.suspiciousActivityAlerts': {
    en: 'Suspicious Activity Alerts',
    hi: 'संदिग्ध गतिविधि अलर्ट',
  },
  'privacy.privacySettings': {
    en: 'Privacy Settings',
    hi: 'गोपनीयता सेटिंग्स',
  },
  'privacy.profileVisibility': {
    en: 'Profile Visibility',
    hi: 'प्रोफ़ाइल दृश्यता',
  },
  'privacy.public': {
    en: 'Public',
    hi: 'सार्वजनिक',
  },
  'privacy.friends': {
    en: 'Friends',
    hi: 'दोस्त',
  },
  'privacy.private': {
    en: 'Private',
    hi: 'निजी',
  },
  'privacy.showEmail': {
    en: 'Show Email',
    hi: 'ईमेल दिखाएं',
  },
  'privacy.showPhone': {
    en: 'Show Phone',
    hi: 'फ़ोन दिखाएं',
  },
  'privacy.showLocation': {
    en: 'Show Location',
    hi: 'स्थान दिखाएं',
  },
  'privacy.accountActions': {
    en: 'Account Actions',
    hi: 'खाता क्रियाएं',
  },
  'privacy.downloadData': {
    en: 'Download Data',
    hi: 'डेटा डाउनलोड करें',
  },
  'privacy.activeSessions': {
    en: 'Active Sessions',
    hi: 'सक्रिय सत्र',
  },
  'privacy.loginHistory': {
    en: 'Login History',
    hi: 'लॉगिन इतिहास',
  },
  'privacy.deleteAccount': {
    en: 'Delete Account',
    hi: 'खाता हटाएं',
  },
  'privacy.deleteAccountWarning': {
    en: 'This action cannot be undone. All your data will be permanently deleted.',
    hi: 'यह क्रिया पूर्ववत नहीं की जा सकती। आपका सभी डेटा स्थायी रूप से हटा दिया जाएगा।',
  },
  'privacy.typeToConfirm': {
    en: 'Type "DELETE" to confirm',
    hi: 'पुष्टि करने के लिए "DELETE" टाइप करें',
  },
  'privacy.warningPermanent': {
    en: 'Warning: This action is permanent',
    hi: 'चेतावनी: यह क्रिया स्थायी है',
  },
  'privacy.deletingAccountWarning': {
    en: 'Deleting your account will permanently remove all your data, bookings, reviews, and account information. This cannot be undone.',
    hi: 'अपना खाता हटाने से आपका सभी डेटा, बुकिंग, समीक्षा और खाता जानकारी स्थायी रूप से हटा दी जाएगी। इसे पूर्ववत नहीं किया जा सकता।',
  },
  'privacy.waitBeforeConfirming': {
    en: 'Please wait before confirming deletion...',
    hi: 'हटाने की पुष्टि करने से पहले कृपया प्रतीक्षा करें...',
  },
  'privacy.toConfirmTypeDelete': {
    en: 'To confirm, please type DELETE in the box below:',
    hi: 'पुष्टि करने के लिए, कृपया नीचे दिए गए बॉक्स में DELETE टाइप करें:',
  },
  'privacy.typeDeleteToConfirm': {
    en: 'Type DELETE to confirm',
    hi: 'पुष्टि करने के लिए DELETE टाइप करें',
  },
  'privacy.typeDeleteExactly': {
    en: 'Please type DELETE exactly as shown',
    hi: 'कृपया DELETE को बिल्कुल वैसा ही टाइप करें जैसा दिखाया गया है',
  },
  'privacy.whatWillBeDeleted': {
    en: 'What will be deleted:',
    hi: 'क्या हटाया जाएगा:',
  },
  'privacy.allPersonalInfo': {
    en: 'All your personal information',
    hi: 'आपकी सभी व्यक्तिगत जानकारी',
  },
  'privacy.bookingHistory': {
    en: 'Booking history and records',
    hi: 'बुकिंग इतिहास और रिकॉर्ड',
  },
  'privacy.reviewsRatings': {
    en: 'Reviews and ratings',
    hi: 'समीक्षा और रेटिंग',
  },
  'privacy.paymentInfo': {
    en: 'Payment information',
    hi: 'भुगतान जानकारी',
  },
  'privacy.achievementsPoints': {
    en: 'Achievements and points',
    hi: 'उपलब्धियां और अंक',
  },
  'privacy.messagesConversations': {
    en: 'Messages and conversations',
    hi: 'संदेश और बातचीत',
  },
  'privacy.deletingAccount': {
    en: 'Deleting Account...',
    hi: 'खाता हटाया जा रहा है...',
  },
  'privacy.confirmDeletion': {
    en: 'Confirm Deletion',
    hi: 'हटाने की पुष्टि करें',
  },
  'privacy.accountDeletedSuccess': {
    en: 'Account deleted successfully',
    hi: 'खाता सफलतापूर्वक हटा दिया गया',
  },
  'privacy.failedToDeleteAccount': {
    en: 'Failed to delete account. Please try again.',
    hi: 'खाता हटाने में विफल। कृपया पुनः प्रयास करें।',
  },
  'privacy.areYouSureLogout': {
    en: 'Are you sure you want to logout?',
    hi: 'क्या आप वाकई लॉग आउट करना चाहते हैं?',
  },
  // Auth Pages
  'auth.welcomeBack': {
    en: 'Welcome Back',
    hi: 'वापसी पर स्वागत है',
  },
  'auth.signInToStudySpot': {
    en: 'Sign in to StudySpot',
    hi: 'StudySpot में साइन इन करें',
  },
  'auth.login': {
    en: 'Login',
    hi: 'लॉग इन',
  },
  'auth.rememberMe': {
    en: 'Remember me',
    hi: 'मुझे याद रखें',
  },
  'auth.forgotPassword': {
    en: 'Forgot Password?',
    hi: 'पासवर्ड भूल गए?',
  },
  'auth.dontHaveAccount': {
    en: "Don't have an account?",
    hi: 'खाता नहीं है?',
  },
  'auth.createAccount': {
    en: 'Create Account',
    hi: 'खाता बनाएं',
  },
  'auth.signUp': {
    en: 'Sign Up',
    hi: 'साइन अप',
  },
  'auth.joinStudySpot': {
    en: 'Join StudySpot today',
    hi: 'आज StudySpot में शामिल हों',
  },
  'auth.alreadyHaveAccount': {
    en: 'Already have an account?',
    hi: 'पहले से खाता है?',
  },
  'auth.signIn': {
    en: 'Sign In',
    hi: 'साइन इन',
  },
  'auth.password': {
    en: 'Password',
    hi: 'पासवर्ड',
  },
  'auth.confirmPassword': {
    en: 'Confirm Password',
    hi: 'पासवर्ड की पुष्टि करें',
  },
  'auth.demoAccount': {
    en: 'Demo Account',
    hi: 'डेमो खाता',
  },
  'auth.registrationSuccessful': {
    en: 'Registration successful! Redirecting...',
    hi: 'पंजीकरण सफल! पुनर्निर्देशित किया जा रहा है...',
  },
  'auth.registrationSuccessfulMessage': {
    en: 'Registration successful! Please login.',
    hi: 'पंजीकरण सफल! कृपया लॉग इन करें।',
  },
  'auth.loggedOutSuccessfully': {
    en: 'Logged out successfully',
    hi: 'सफलतापूर्वक लॉग आउट किया गया',
  },
  // Help & Support
  'support.title': {
    en: 'Help & Support',
    hi: 'सहायता और समर्थन',
  },
  'support.subtitle': {
    en: 'Find answers to common questions or contact support',
    hi: 'सामान्य प्रश्नों के उत्तर खोजें या सहायता से संपर्क करें',
  },
  'support.callUs': {
    en: 'Call Us',
    hi: 'हमें कॉल करें',
  },
  'support.getImmediateHelp': {
    en: 'Get immediate help',
    hi: 'तत्काल सहायता प्राप्त करें',
  },
  'support.emailUs': {
    en: 'Email Us',
    hi: 'हमें ईमेल करें',
  },
  'support.sendMessage': {
    en: 'Send a message',
    hi: 'एक संदेश भेजें',
  },
  'support.whatsapp': {
    en: 'WhatsApp',
    hi: 'व्हाट्सएप',
  },
  'support.chatWithUs': {
    en: 'Chat with us',
    hi: 'हमसे चैट करें',
  },
  'support.videoTutorials': {
    en: 'Video Tutorials',
    hi: 'वीडियो ट्यूटोरियल',
  },
  'support.watchAndLearn': {
    en: 'Watch and learn',
    hi: 'देखें और सीखें',
  },
  'support.faqs': {
    en: 'FAQs',
    hi: 'अक्सर पूछे जाने वाले प्रश्न',
  },
  'support.contact': {
    en: 'Contact',
    hi: 'संपर्क',
  },
  'support.videos': {
    en: 'Videos',
    hi: 'वीडियो',
  },
  'support.searchForHelp': {
    en: 'Search for help...',
    hi: 'सहायता खोजें...',
  },
  'support.all': {
    en: 'All',
    hi: 'सभी',
  },
  'support.booking': {
    en: 'Booking',
    hi: 'बुकिंग',
  },
  'support.payment': {
    en: 'Payment',
    hi: 'भुगतान',
  },
  'support.account': {
    en: 'Account',
    hi: 'खाता',
  },
  'support.attendance': {
    en: 'Attendance',
    hi: 'उपस्थिति',
  },
  'support.rewards': {
    en: 'Rewards',
    hi: 'पुरस्कार',
  },
  'support.helpful': {
    en: 'helpful',
    hi: 'उपयोगी',
  },
  'support.notHelpful': {
    en: 'Not Helpful',
    hi: 'उपयोगी नहीं',
  },
  'support.noFaqsFound': {
    en: 'No FAQs found',
    hi: 'कोई FAQ नहीं मिला',
  },
  'support.tryDifferentSearch': {
    en: 'Try different search terms or contact support',
    hi: 'अलग खोज शब्द आज़माएं या सहायता से संपर्क करें',
  },
  'support.libraryContactInfo': {
    en: 'Library Contact Information',
    hi: 'पुस्तकालय संपर्क जानकारी',
  },
  'support.phone': {
    en: 'Phone',
    hi: 'फोन',
  },
  'support.email': {
    en: 'Email',
    hi: 'ईमेल',
  },
  'support.operatingHours': {
    en: 'Operating Hours:',
    hi: 'काम के घंटे:',
  },
  'support.contactLibrary': {
    en: 'Contact Library',
    hi: 'पुस्तकालय से संपर्क करें',
  },
  'support.callNow': {
    en: 'Call Now',
    hi: 'अभी कॉल करें',
  },
  'support.chat': {
    en: 'Chat',
    hi: 'चैट',
  },
  'support.close': {
    en: 'Close',
    hi: 'बंद करें',
  },
  'support.sendMessageToSupport': {
    en: 'Send Message to Support',
    hi: 'सहायता को संदेश भेजें',
  },
  'support.subject': {
    en: 'Subject',
    hi: 'विषय',
  },
  'support.message': {
    en: 'Message',
    hi: 'संदेश',
  },
  'support.send': {
    en: 'Send',
    hi: 'भेजें',
  },
  'support.messageSentSuccess': {
    en: 'Message sent successfully! We will get back to you within 24 hours.',
    hi: 'संदेश सफलतापूर्वक भेजा गया! हम 24 घंटों के भीतर आपसे संपर्क करेंगे।',
  },
  'support.failedToSend': {
    en: 'Failed to send message',
    hi: 'संदेश भेजने में विफल',
  },
  'support.reportIssue': {
    en: 'Report Issue',
    hi: 'समस्या रिपोर्ट करें',
  },
  'support.liveChat': {
    en: 'Live Chat',
    hi: 'लाइव चैट',
  },
  'support.startChat': {
    en: 'Start Chat',
    hi: 'चैट शुरू करें',
  },
  'support.quickHelp': {
    en: 'Quick Help',
    hi: 'त्वरित सहायता',
  },
  'support.commonIssues': {
    en: 'Common Issues',
    hi: 'सामान्य समस्याएं',
  },
  'support.knowledgeBase': {
    en: 'Knowledge Base',
    hi: 'ज्ञान आधार',
  },
  'support.ticketSystem': {
    en: 'Ticket System',
    hi: 'टिकट प्रणाली',
  },
  'support.createTicket': {
    en: 'Create Ticket',
    hi: 'टिकट बनाएं',
  },
  // Common
  'common.cancel': {
    en: 'Cancel',
    hi: 'रद्द करें',
  },
};

// Get translation for a key
export const getTranslation = (key: string, language: Language = 'en'): string => {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  return translation[language] || translation.en;
};

// Get all translations for a language
export const getTranslations = (language: Language): Record<string, string> => {
  const result: Record<string, string> = {};
  Object.keys(translations).forEach((key) => {
    result[key] = translations[key][language] || translations[key].en;
  });
  return result;
};

