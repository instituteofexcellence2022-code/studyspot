# StudySpot Student Portal - Feature Testing Checklist

This document provides a systematic approach to testing all features in the student portal.

## Prerequisites

- ✅ Student portal deployed on Netlify
- ✅ Backend services running on Render:
  - `studyspot-api.onrender.com` (API Gateway)
  - `studyspot-auth.onrender.com` (Auth Service)
- ✅ Test account credentials ready

---

## 🔐 **1. Authentication Features**

### 1.1 Registration
- [ ] Navigate to `/register`
- [ ] Fill in registration form:
  - First Name
  - Last Name
  - Email (unique)
  - Password (meets requirements: 8+ chars, uppercase, lowercase, number, special char)
- [ ] Submit registration
- [ ] **Expected**: Success message, auto-login, redirect to dashboard
- [ ] **Verify**: User data stored in localStorage

### 1.2 Login
- [ ] Navigate to `/login`
- [ ] Enter credentials:
  - Email: `demo@studyspot.com`
  - Password: `Demo@123`
- [ ] Submit login
- [ ] **Expected**: Success, redirect to dashboard
- [ ] **Verify**: Token stored, user data loaded

### 1.3 Logout
- [ ] Click logout button (usually in profile or menu)
- [ ] **Expected**: Redirect to login, tokens cleared
- [ ] **Verify**: Cannot access protected routes

### 1.4 Session Persistence
- [ ] Login successfully
- [ ] Refresh the page (F5)
- [ ] **Expected**: Still logged in, dashboard loads
- [ ] **Verify**: User data persists

---

## 🏠 **2. Dashboard Features**

### 2.1 Dashboard Overview
- [ ] Navigate to `/dashboard`
- [ ] **Verify**:
  - [ ] User greeting/name displayed
  - [ ] Quick stats visible (bookings, attendance, etc.)
  - [ ] Recent activity shown
  - [ ] Navigation menu accessible

### 2.2 Dashboard Widgets
- [ ] Check all dashboard sections:
  - [ ] Upcoming bookings
  - [ ] Recent announcements
  - [ ] Quick actions
  - [ ] Study statistics (if available)

---

## 📚 **3. Library Features**

### 3.1 Library List
- [ ] Navigate to `/libraries`
- [ ] **Verify**:
  - [ ] List of libraries displayed
  - [ ] Library cards show:
    - Name
    - Location
    - Available seats
    - Rating (if available)
  - [ ] Search/filter functionality works

### 3.2 Library Details
- [ ] Click on a library card
- [ ] Navigate to `/libraries/:id`
- [ ] **Verify**:
  - [ ] Library details page loads
  - [ ] Images/photos displayed
  - [ ] Amenities listed
  - [ ] Seat map/availability shown
  - [ ] Reviews visible
  - [ ] "Book Now" button present

### 3.3 Library Search & Filter
- [ ] Use search bar
- [ ] Apply filters (location, amenities, etc.)
- [ ] **Verify**: Results update correctly

### 3.4 Favorites
- [ ] Navigate to `/favorites`
- [ ] Add a library to favorites (from library details page)
- [ ] **Verify**: Library appears in favorites list
- [ ] Remove from favorites
- [ ] **Verify**: Library removed from list

---

## 📅 **4. Booking Features**

### 4.1 Create Booking
- [ ] Navigate to library details page
- [ ] Click "Book Now" or "Book Seat"
- [ ] **Verify**:
  - [ ] Booking form opens
  - [ ] Date picker works
  - [ ] Time slots available
  - [ ] Seat selection (if applicable)
- [ ] Fill booking form:
  - [ ] Select date
  - [ ] Select time slot
  - [ ] Select seat (if applicable)
- [ ] Submit booking
- [ ] **Expected**: Success message, booking confirmed
- [ ] **Verify**: Booking appears in bookings list

### 4.2 View Bookings
- [ ] Navigate to `/bookings`
- [ ] **Verify**:
  - [ ] List of bookings displayed
  - [ ] Booking details shown:
    - Library name
    - Date & time
    - Seat number (if applicable)
    - Status (confirmed, pending, cancelled)

### 4.3 Manage Bookings
- [ ] Navigate to `/manage-bookings`
- [ ] **Verify**:
  - [ ] All bookings listed
  - [ ] Actions available:
    - [ ] Cancel booking
    - [ ] Reschedule booking
    - [ ] View details

### 4.4 Cancel Booking
- [ ] From bookings list, click "Cancel"
- [ ] Confirm cancellation
- [ ] **Expected**: Booking cancelled, status updated
- [ ] **Verify**: Booking removed or marked as cancelled

---

## ✅ **5. Attendance Features**

### 5.1 QR Code Scanner
- [ ] Navigate to `/qr-scanner` or `/attendance`
- [ ] **Verify**:
  - [ ] Camera permission requested
  - [ ] QR scanner interface loads
  - [ ] Scanner can read QR codes
- [ ] Scan a valid QR code
- [ ] **Expected**: Attendance marked, success message
- [ ] **Verify**: Attendance recorded in system

### 5.2 Attendance History
- [ ] Navigate to `/attendance` (if separate page)
- [ ] **Verify**:
  - [ ] Attendance history displayed
  - [ ] Dates and times shown
  - [ ] Library/location recorded

---

## 💳 **6. Payment Features**

### 6.1 Payment Page
- [ ] Navigate to `/payments`
- [ ] **Verify**:
  - [ ] Payment history displayed
  - [ ] Outstanding balances shown (if any)
  - [ ] Payment methods listed

### 6.2 Make Payment
- [ ] Click "Pay Now" or "Add Payment"
- [ ] **Verify**:
  - [ ] Payment form opens
  - [ ] Amount field
  - [ ] Payment method selection
- [ ] Fill payment form
- [ ] Submit payment
- [ ] **Expected**: Payment processed, receipt generated
- [ ] **Verify**: Payment appears in history

### 6.3 Payment History
- [ ] View payment history
- [ ] **Verify**:
  - [ ] Past payments listed
  - [ ] Receipts downloadable (if available)
  - [ ] Payment status shown

---

## 📊 **7. Analytics & Reports**

### 7.1 Analytics Dashboard
- [ ] Navigate to `/analytics`
- [ ] **Verify**:
  - [ ] Charts/graphs displayed
  - [ ] Study hours tracked
  - [ ] Attendance statistics
  - [ ] Booking trends
  - [ ] Performance metrics

### 7.2 Study Patterns
- [ ] Check analytics for:
  - [ ] Most visited libraries
  - [ ] Peak study times
  - [ ] Study duration trends

---

## 🎯 **8. Tasks & Goals**

### 8.1 Tasks Page
- [ ] Navigate to `/tasks-goals`
- [ ] **Verify**:
  - [ ] Task list displayed
  - [ ] Add task button works
- [ ] Create a new task:
  - [ ] Enter task name
  - [ ] Set due date
  - [ ] Set priority
  - [ ] Submit
- [ ] **Expected**: Task added to list
- [ ] **Verify**: Task appears in list

### 8.2 Goals Management
- [ ] Create a goal
- [ ] **Verify**: Goal tracking works
- [ ] Mark goal as complete
- [ ] **Verify**: Status updated

---

## ⏱️ **9. Study Timer**

### 9.1 Timer Page
- [ ] Navigate to `/study-timer`
- [ ] **Verify**:
  - [ ] Timer interface loads
  - [ ] Start/Stop buttons work
  - [ ] Timer displays correctly
- [ ] Start timer
- [ ] **Verify**: Timer counts up/down
- [ ] Stop timer
- [ ] **Verify**: Session saved

### 9.2 Study Sessions
- [ ] View study session history
- [ ] **Verify**: Past sessions recorded

---

## 💬 **10. Messaging & Communication**

### 10.1 Messages Page
- [ ] Navigate to `/messages`
- [ ] **Verify**:
  - [ ] Message list loads
  - [ ] Conversations displayed
  - [ ] Unread count shown (if applicable)

### 10.2 Send Message
- [ ] Click on a conversation or start new
- [ ] **Verify**: Chat interface opens
- [ ] Type a message
- [ ] Send message
- [ ] **Expected**: Message sent, appears in chat
- [ ] **Verify**: Real-time updates (if WebSocket enabled)

### 10.3 Announcements
- [ ] Navigate to `/announcements`
- [ ] **Verify**:
  - [ ] Announcements list displayed
  - [ ] Latest announcements shown
  - [ ] Can mark as read

---

## 👥 **11. Community Features**

### 11.1 Community Page
- [ ] Navigate to `/community`
- [ ] **Verify**:
  - [ ] Community groups/forums listed
  - [ ] Can join/leave groups
  - [ ] Posts visible

### 11.2 Create Post
- [ ] Create a new post
- [ ] **Verify**: Post appears in feed

---

## ⭐ **12. Reviews & Ratings**

### 12.1 Reviews Page
- [ ] Navigate to `/reviews`
- [ ] **Verify**:
  - [ ] Reviews list displayed
  - [ ] Can filter by library

### 12.2 Write Review
- [ ] Click "Write Review"
- [ ] **Verify**: Review form opens
- [ ] Fill review:
  - [ ] Select library
  - [ ] Rating (1-5 stars)
  - [ ] Review text
- [ ] Submit review
- [ ] **Expected**: Review posted
- [ ] **Verify**: Review appears in list

---

## 🎁 **13. Rewards & Referrals**

### 13.1 Rewards Page
- [ ] Navigate to `/rewards`
- [ ] **Verify**:
  - [ ] Rewards catalog displayed
  - [ ] Points balance shown
  - [ ] Available rewards listed

### 13.2 Referral Program
- [ ] Navigate to `/referral`
- [ ] **Verify**:
  - [ ] Referral code displayed
  - [ ] Share functionality works
  - [ ] Referral stats shown

---

## 📚 **14. Resources**

### 14.1 Resources Page
- [ ] Navigate to `/resources`
- [ ] **Verify**:
  - [ ] Resources list displayed
  - [ ] Can filter by category
  - [ ] Download links work (if applicable)

---

## 🐛 **15. Support & Issues**

### 15.1 Support Page
- [ ] Navigate to `/support`
- [ ] **Verify**:
  - [ ] Support options displayed
  - [ ] FAQ section (if available)
  - [ ] Contact form works

### 15.2 Report Issue
- [ ] Navigate to `/issues`
- [ ] **Verify**: Issue form loads
- [ ] Fill issue form:
  - [ ] Issue type
  - [ ] Description
  - [ ] Attach files (if available)
- [ ] Submit issue
- [ ] **Expected**: Issue submitted, ticket created
- [ ] **Verify**: Issue appears in list

---

## 👤 **16. Profile Management**

### 16.1 Profile Page
- [ ] Navigate to `/profile`
- [ ] **Verify**:
  - [ ] User information displayed
  - [ ] Profile picture (if available)
  - [ ] Edit button works

### 16.2 Edit Profile
- [ ] Click "Edit Profile"
- [ ] **Verify**: Edit form opens
- [ ] Update information:
  - [ ] Name
  - [ ] Email
  - [ ] Phone
  - [ ] Profile picture (if available)
- [ ] Save changes
- [ ] **Expected**: Profile updated
- [ ] **Verify**: Changes reflected on profile page

### 16.3 Change Password
- [ ] Navigate to password change section
- [ ] Enter:
  - [ ] Current password
  - [ ] New password
  - [ ] Confirm new password
- [ ] Submit
- [ ] **Expected**: Password changed
- [ ] **Verify**: Can login with new password

---

## 🔍 **17. Navigation & UI/UX**

### 17.1 Navigation Menu
- [ ] **Verify**:
  - [ ] All menu items accessible
  - [ ] Active page highlighted
  - [ ] Mobile menu works (if applicable)
  - [ ] Logout button accessible

### 17.2 Responsive Design
- [ ] Test on different screen sizes:
  - [ ] Desktop (1920x1080)
  - [ ] Tablet (768x1024)
  - [ ] Mobile (375x667)
- [ ] **Verify**: Layout adapts correctly

### 17.3 Loading States
- [ ] **Verify**:
  - [ ] Loading spinners shown during API calls
  - [ ] No blank screens
  - [ ] Error messages displayed appropriately

### 17.4 Error Handling
- [ ] Test error scenarios:
  - [ ] Network offline
  - [ ] Invalid API response
  - [ ] 401 Unauthorized (should redirect to login)
  - [ ] 500 Server Error (should show error message)

---

## 🚀 **18. Performance & Optimization**

### 18.1 Page Load Times
- [ ] **Verify**:
  - [ ] Initial page load < 3 seconds
  - [ ] Navigation between pages is smooth
  - [ ] Images load progressively

### 18.2 API Response Times
- [ ] **Verify**:
  - [ ] API calls complete within reasonable time
  - [ ] No hanging requests
  - [ ] Timeout handling works

---

## 📝 **Testing Notes Template**

For each feature, document:

```
Feature: [Feature Name]
Date: [Date]
Tester: [Your Name]
Status: ✅ Pass / ❌ Fail / ⚠️ Partial

Issues Found:
- [Issue 1]
- [Issue 2]

Screenshots: [Attach if needed]
```

---

## 🎯 **Priority Testing Order**

1. **Critical Path** (Must work):
   - Authentication (Login/Register)
   - Dashboard
   - Library browsing
   - Booking creation
   - Profile management

2. **High Priority**:
   - Attendance (QR Scanner)
   - Payments
   - Bookings management
   - Messages

3. **Medium Priority**:
   - Analytics
   - Tasks & Goals
   - Reviews
   - Community

4. **Low Priority**:
   - Study Timer
   - Resources
   - Support/Issues
   - Referrals

---

## ✅ **Completion Checklist**

- [ ] All authentication features tested
- [ ] All core features (dashboard, libraries, bookings) tested
- [ ] All secondary features tested
- [ ] All bugs/issues documented
- [ ] All screenshots/videos captured (if needed)
- [ ] Test report generated

---

**Happy Testing! 🎉**


