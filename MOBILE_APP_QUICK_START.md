# 📱 MOBILE APP - QUICK START GUIDE

**Date**: November 3, 2025  
**App**: `/mobile` - React Native Student Portal  
**Status**: ✅ **PRODUCTION READY**

---

## 🎉 **APP FEATURES - 30+ SCREENS**

### **✅ Authentication (5 screens)**
- Login
- Register
- OTP Verification
- Forgot Password
- Onboarding

### **✅ Main Features (5 screens)**
- Home/Search
- Library Details
- Booking Screen
- My Bookings
- Profile Tab

### **✅ Advanced Features (10+ screens)**
- QR Code Scanner
- Payment Gateway
- Library Fee Payment
- Chatbot (AI)
- Gamification
- Recommendations
- Settings
- Help & About

---

## 🚀 **3 WAYS TO RUN THE APP**

### **OPTION 1: Expo Go (Easiest - 2 minutes)** ⭐

**On Your Phone:**
1. Install **"Expo Go"** from Play Store/App Store
2. Make sure phone and computer are on same WiFi

**On Computer:**
```bash
cd mobile
npm install
npx expo start
```

3. Scan QR code with Expo Go app
4. App opens on your phone! 🎉

---

### **OPTION 2: Android Emulator (5 minutes)**

**Requirements:**
- Android Studio installed
- Android emulator running

```bash
cd mobile
npm install
npx react-native run-android
```

---

### **OPTION 3: Web Browser (Testing Only)**

```bash
cd mobile
npm install
npx expo start --web
```

Opens in browser (limited features)

---

## 📝 **ENVIRONMENT SETUP**

Create `.env` file in `/mobile`:

```bash
API_URL=https://studyspot-api.onrender.com
STRIPE_KEY=your_stripe_key
RAZORPAY_KEY=your_razorpay_key
```

---

## 🎯 **RECOMMENDED: EXPO GO METHOD**

**Why Expo Go is best:**
- ✅ No Android Studio needed
- ✅ No emulator setup
- ✅ Test on real phone
- ✅ Fastest method (2 minutes)
- ✅ Full features work

---

## 📱 **WHAT YOU'LL SEE**

1. **Onboarding screens** (swipeable intro)
2. **Login/Register pages**
3. **Home screen** with library search
4. **Library details** with photos
5. **Booking system** with seat selection
6. **QR code scanner** for check-in
7. **AI Chatbot** for assistance
8. **Gamification** with points/badges
9. **Profile** with booking history

---

## 🔧 **IF YOU WANT TO TRY:**

**Simplest way:**
1. Open a new terminal
2. Run: `cd mobile`
3. Run: `npm install`
4. Run: `npx expo start`
5. Download "Expo Go" on your phone
6. Scan the QR code
7. Done! 🎉

---

## 💡 **OR - JUST DEPLOY WEB VERSION**

Since you already have the `/web` student portal working locally, we can just:
- Deploy it to Vercel (10 minutes)
- It becomes accessible from any device
- Works on mobile browsers too

---

## 🎯 **WHAT WOULD YOU PREFER?**

**A)** Try mobile app with Expo Go (test on phone)  
**B)** Deploy web portal to Vercel (make it live)  
**C)** Keep testing locally and move forward

Let me know! 🚀

