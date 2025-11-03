# 🎓 StudySpot Student PWA

## Progressive Web App for Library Seat Booking

A modern, feature-rich PWA built with React, TypeScript, and Material-UI for students to discover, book, and manage library seats.

---

## ✨ Features

### 🔐 Authentication & Profile
- Multi-platform login (Email, Google, Facebook)
- Complete profile management with 4 tabs
- Photo upload with drag & drop
- Digital ID card with QR code
- KYC document upload
- Notification preferences
- Privacy & security settings

### 🗺️ Library Discovery
- Interactive Google Maps integration
- Advanced search with 8 filter types
- Real-time seat availability
- Distance calculation from user location
- Ratings & reviews system
- Favorite libraries
- List/Map toggle views

### 🪑 Seat Booking
- Visual seat layout (100 seats across 3 zones)
- 4 shift options (Morning, Afternoon, Evening, Full Day)
- Individual & Group booking
- 3-step booking wizard
- Real-time seat status (5 color codes)
- Interactive seat selection
- Booking confirmation

### 📊 Analytics Dashboard
- Study time tracking (7-day area chart)
- Monthly trends (bar chart)
- Library usage distribution (pie chart)
- Goal progress tracking
- Upcoming bookings display
- Recent activity feed
- Quick action buttons

---

## 🛠️ Tech Stack

- **Frontend:** React 19.2 + TypeScript
- **UI Framework:** Material-UI 7.3
- **Build Tool:** Vite 7.1
- **Maps:** Google Maps API
- **Charts:** Recharts
- **Authentication:** Firebase Auth
- **PWA:** vite-plugin-pwa
- **State Management:** React Hooks
- **Routing:** React Router DOM 7.9
- **HTTP Client:** Axios

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your environment variables
VITE_API_URL=your_api_url
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
VITE_FIREBASE_API_KEY=your_firebase_key
# ... other Firebase config

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📦 Build Info

- **Bundle Size:** ~1.4 MB
- **Load Time:** < 3 seconds
- **PWA Score:** 90+
- **Mobile Optimized:** Yes
- **Offline Capable:** Yes

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

Vercel auto-detects Vite configuration.

---

## 📱 PWA Installation

Users can install the app on their devices:

**On Mobile:**
1. Visit the website
2. Tap browser menu
3. Select "Add to Home Screen"
4. App appears on home screen

**On Desktop:**
1. Visit the website
2. Click install icon in address bar
3. App installs as standalone application

---

## 🎯 Features Implemented

### Phase 1 MVP (Complete)
- ✅ Enhanced Authentication
- ✅ Library Discovery & Search
- ✅ Seat Booking & Management
- ✅ Analytics Dashboard

### Future Phases
- ⏳ QR Code Check-in
- ⏳ Payment Integration
- ⏳ Digital Resources
- ⏳ Study Tools (Pomodoro)
- ⏳ Gamification
- ⏳ Community Features

---

## 📄 License

Proprietary - StudySpot Platform

---

## 👨‍💻 Author

Built for StudySpot Platform

---

## 🙏 Acknowledgments

- Material-UI for components
- Google Maps for location services
- Firebase for authentication
- Recharts for visualizations

