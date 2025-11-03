# StudySpot Flutter App - Cross-Platform Mobile Application

A comprehensive cross-platform mobile application built with Flutter for the StudySpot library management platform.

## 🚀 Features

### Core Features
- **Cross-Platform Support**: Android, iOS, and Web
- **Modern UI/UX**: Material Design 3 with custom theming
- **State Management**: Riverpod for reactive state management
- **Navigation**: GoRouter for declarative routing
- **Authentication**: Complete auth flow with social login support
- **Library Management**: Browse, search, and book library spaces
- **QR Code Integration**: Scan QR codes for quick library entry
- **Payment Processing**: Integrated payment system
- **Real-time Updates**: Live library availability and notifications
- **Offline Support**: Offline-first architecture with local storage

### Advanced Features
- **Gamification**: Points, badges, and achievements
- **Recommendations**: AI-powered library recommendations
- **Analytics**: User behavior tracking and insights
- **Multi-language Support**: Internationalization ready
- **Dark Mode**: Complete dark theme support
- **Animations**: Smooth animations with flutter_animate
- **Charts & Analytics**: Data visualization with fl_chart

## 📱 Screenshots

*Screenshots will be added here*

## 🛠️ Tech Stack

### Frontend
- **Flutter**: 3.10.0+
- **Dart**: 3.0.0+
- **State Management**: Riverpod
- **Navigation**: GoRouter
- **UI Components**: Material Design 3
- **Animations**: flutter_animate
- **Charts**: fl_chart, syncfusion_flutter_charts

### Backend Integration
- **HTTP Client**: Dio
- **API Integration**: RESTful APIs
- **Authentication**: JWT tokens
- **Real-time**: WebSocket support

### Storage & Persistence
- **Local Storage**: Hive, SharedPreferences
- **Caching**: cached_network_image
- **Offline Sync**: Custom offline service

### Platform Features
- **Camera**: QR code scanning
- **Location**: GPS and maps integration
- **Notifications**: Firebase Cloud Messaging
- **Payments**: Razorpay integration
- **Social Login**: Google, Facebook

## 📋 Prerequisites

- Flutter SDK 3.10.0 or higher
- Dart SDK 3.0.0 or higher
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- VS Code or Android Studio (recommended IDEs)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd studyspot_flutter
```

### 2. Install Dependencies
```bash
flutter pub get
```

### 3. Configure Environment
Create a `.env` file in the root directory:
```env
API_BASE_URL=https://your-api-url.com/api
GOOGLE_MAPS_API_KEY=your_google_maps_key
RAZORPAY_KEY_ID=your_razorpay_key
FIREBASE_PROJECT_ID=your_firebase_project_id
```

### 4. Run the App
```bash
# Debug mode
flutter run

# Release mode
flutter run --release

# Specific platform
flutter run -d android
flutter run -d ios
flutter run -d web
```

## 🏗️ Build Instructions

### Android
```bash
# Debug APK
flutter build apk --debug

# Release APK
flutter build apk --release

# App Bundle (for Play Store)
flutter build appbundle --release
```

### iOS
```bash
# iOS App
flutter build ios --release

# iOS Archive (for App Store)
flutter build ipa --release
```

### Web
```bash
# Web App
flutter build web
```

### Cross-Platform Build Scripts
```bash
# Linux/macOS
chmod +x build-flutter.sh
./build-flutter.sh

# Windows
build-flutter.bat
```

## 📁 Project Structure

```
lib/
├── main.dart                 # App entry point
├── providers/               # State management
│   ├── auth_provider.dart
│   ├── library_provider.dart
│   ├── booking_provider.dart
│   ├── payment_provider.dart
│   └── notification_provider.dart
├── screens/                 # UI screens
│   ├── auth/               # Authentication screens
│   ├── main/               # Main app screens
│   ├── library/            # Library-related screens
│   ├── payment/            # Payment screens
│   ├── qr/                 # QR code screens
│   ├── profile/            # Profile screens
│   ├── settings/           # Settings screens
│   ├── help/               # Help screens
│   ├── recommendations/     # Recommendation screens
│   ├── gamification/       # Gamification screens
│   └── chatbot/            # Chatbot screens
├── utils/                   # Utilities
│   ├── app_theme.dart      # Theme configuration
│   └── app_router.dart     # Navigation configuration
└── models/                  # Data models
    ├── user.dart
    ├── library.dart
    └── booking.dart
```

## 🎨 Theming

The app uses a comprehensive theming system with:
- **Light Theme**: Clean, modern light interface
- **Dark Theme**: Eye-friendly dark interface
- **Custom Colors**: Brand-specific color palette
- **Typography**: Google Fonts (Poppins) integration
- **Material Design 3**: Latest Material Design guidelines

## 🔧 Configuration

### API Configuration
Update the API base URL in `lib/providers/booking_provider.dart`:
```dart
final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService(baseUrl: 'https://your-api-url.com/api');
});
```

### Firebase Setup
1. Create a Firebase project
2. Add your app to the project
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
4. Place them in the appropriate directories

### Maps Integration
1. Get a Google Maps API key
2. Add it to your environment variables
3. Configure platform-specific settings

## 🧪 Testing

### Run Tests
```bash
# All tests
flutter test

# Specific test file
flutter test test/widget_test.dart

# Coverage
flutter test --coverage
```

### Test Structure
```
test/
├── unit/                   # Unit tests
├── widget/                 # Widget tests
├── integration/            # Integration tests
└── mocks/                  # Mock objects
```

## 📦 Deployment

### Android (Google Play Store)
1. Build release APK or App Bundle
2. Sign the app with your release key
3. Upload to Google Play Console
4. Configure store listing and pricing

### iOS (App Store)
1. Build iOS app
2. Archive and upload to App Store Connect
3. Configure app information and pricing
4. Submit for review

### Web (Hosting)
1. Build web app
2. Deploy to Firebase Hosting, Vercel, or Netlify
3. Configure custom domain (optional)

## 🔒 Security

- **API Security**: JWT token authentication
- **Data Encryption**: Sensitive data encryption
- **Secure Storage**: Secure local storage
- **Input Validation**: Form validation and sanitization
- **HTTPS**: All API communications over HTTPS

## 🌐 Internationalization

The app supports multiple languages:
- English (default)
- Hindi
- Tamil
- Telugu
- Bengali
- Gujarati
- Marathi

## 📊 Analytics

Integrated analytics for:
- User behavior tracking
- Feature usage statistics
- Performance monitoring
- Error tracking
- Custom events

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0**: Initial release with core features
- **v1.1.0**: Added gamification and recommendations
- **v1.2.0**: Enhanced UI/UX and performance improvements
- **v1.3.0**: Added multi-language support and offline functionality

## 🎯 Roadmap

- [ ] Voice search integration
- [ ] AR library navigation
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support
- [ ] White-label solutions
- [ ] Advanced booking features
- [ ] Integration with calendar apps
- [ ] Social features and reviews

---

**Built with ❤️ by the StudySpot Team**











