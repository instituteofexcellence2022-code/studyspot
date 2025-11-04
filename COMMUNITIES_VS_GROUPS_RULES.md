# 📋 Communities vs Groups - Access Rules

## 🎯 Clear Distinction

### **Exam Communities (Open to Everyone)**
- ✅ **Anyone can see** all communities
- ✅ **Anyone can join** without restrictions
- ✅ **No booking required**
- ✅ **National/Global scope**
- Examples: UPSC Aspirants, SSC Warriors, Railway Exams

### **Library Groups (Customers Only)**
- 🔒 **Only visible** to students who booked that library
- 🔒 **Only joinable** by customers (at least 1 booking)
- 🔒 **Booking required** to see or join
- 🔒 **Library-specific scope**
- Examples: Central Study Hub - Students, Knowledge Point Group

---

## 📊 Comparison Table

| Feature | Exam Communities | Library Groups |
|---------|------------------|----------------|
| **Who can see** | Everyone | Customers only (booked library) |
| **Who can join** | Anyone | Customers only (at least 1 booking) |
| **Visibility filter** | None | Filtered by bookings |
| **Join validation** | None | Checks booking table |
| **Add member** | N/A (admin manages) | Owner can add customers only |
| **Search shows** | All communities | Only groups from booked libraries |
| **Created by** | Admin | Library Owner |
| **Scope** | National/Exam-based | Library-specific |
| **Purpose** | Exam preparation | Library community |

---

## 🔧 Backend Implementation

### **GET /api/communities/all?userId=xxx**

#### **Flow for Students:**
```
1. Fetch ALL communities (type='community')
   → Returns every community (UPSC, SSC, Railway, etc.)
   → No filtering, no restrictions

2. Get student's booking history
   → SELECT library_id FROM bookings WHERE user_id = xxx

3. Extract unique library IDs
   → [lib-1, lib-5, lib-9] (libraries student has booked)

4. Fetch ONLY groups from those libraries
   → SELECT * FROM communities 
     WHERE type='group' 
     AND library_id IN (lib-1, lib-5, lib-9)

5. Combine results
   → ALL communities + FILTERED groups
```

#### **Response:**
```json
{
  "success": true,
  "data": [
    // All exam communities (everyone sees these)
    {
      "id": "comm-1",
      "type": "community",
      "name": "UPSC Aspirants 2025",
      "exam_type": "UPSC"
    },
    // Only groups from booked libraries
    {
      "id": "group-1",
      "type": "group",
      "name": "Central Study Hub - Students",
      "library_id": "lib-1" // Student has booked lib-1
    }
  ],
  "stats": {
    "communities": 15,        // Total communities visible
    "eligibleGroups": 3,      // Groups from booked libraries
    "bookedLibraries": 2      // Number of libraries booked
  }
}
```

### **POST /api/communities/:id/join**

#### **Flow:**
```
1. Get community/group details
   → Check 'type' field

2. If type = 'community':
   → Skip validation
   → Add member directly
   → Log: "Joining COMMUNITY (no booking required)"

3. If type = 'group':
   → Check booking table
   → If no bookings: Return 403 error
   → If has bookings: Add member
   → Log: "Customer verified for GROUP join"
```

---

## 🎨 Student Portal UI

### **Community Page Header:**
```
┌─────────────────────────────────────────────┐
│ 👥 Study Community               [Live]     │
│ Join study groups, exam communities, and    │
│ connect with fellow students                │
└─────────────────────────────────────────────┘
```

### **Tabs:**
```
┌─────────────────────────────────────────────┐
│ [My Communities (3)] [Exam Communities (15)] │
│ [Library Groups (2)]                        │
└─────────────────────────────────────────────┘
```

### **Tab 1: Exam Communities (No Restrictions)**
```
┌─────────────────────────────────────────────┐
│ [🎯] UPSC Aspirants 2025                    │
│      15,420 members                         │
│      National UPSC preparation community    │
│                                             │
│      [Join Community]  ← Works for everyone │
└─────────────────────────────────────────────┘
```

### **Tab 2: Library Groups (Customer Only)**

#### **If Student HAS Booked Libraries:**
```
┌─────────────────────────────────────────────┐
│ ✅ Success Alert                            │
│ 🎉 You can access 3 library groups from    │
│    2 libraries you've booked!               │
│ You can only see groups from libraries where│
│ you have bookings. Book more to unlock more!│
└─────────────────────────────────────────────┘

Groups shown:
┌─────────────────────────────────────────────┐
│ [📚] Central Study Hub - Students           │
│      234 members                            │
│      Connect with peers at your library     │
│                                             │
│      [Join Group]                           │
│ ⓘ Only customers who booked this library    │
│   can join                                  │
└─────────────────────────────────────────────┘
```

#### **If Student has NOT Booked Any Library:**
```
┌─────────────────────────────────────────────┐
│ ℹ️ Info Alert                               │
│ 📚 Library Groups are Locked                │
│ Book a library to unlock library groups!    │
│ Only customers can join library-specific    │
│ groups. Browse libraries and make your first│
│ booking.                                    │
└─────────────────────────────────────────────┘

Empty State:
┌─────────────────────────────────────────────┐
│        [Group Icon]                         │
│ No library communities found                │
│ 📖 Book a library to see library groups!    │
└─────────────────────────────────────────────┘
```

---

## 🔒 Visibility Logic

### **Example Student Journey:**

**Student: Rahul (new user, no bookings)**

```
Tab: Exam Communities
✅ Sees: UPSC (15k), SSC (8k), Railway (6k)
✅ Can join: All of them

Tab: Library Groups
❌ Sees: Nothing (0 groups)
📚 Alert: "Library Groups are Locked"
💡 Message: "Book a library to unlock groups"
```

**Student: Rahul (after booking Central Study Hub)**

```
Tab: Exam Communities
✅ Sees: UPSC (15k), SSC (8k), Railway (6k)
✅ Can join: All of them

Tab: Library Groups
✅ Sees: Central Study Hub - Students (234)
✅ Can join: Yes (he's a customer)
❌ Sees: Knowledge Point Group (NOT visible - he didn't book it)
🎉 Alert: "You can access 1 library group from 1 library"
```

**Student: Rahul (after booking 3 libraries)**

```
Tab: Library Groups
✅ Sees: 
   - Central Study Hub - Students (234)
   - Knowledge Point - Study Circle (156)
   - Elite Library - Community (89)
✅ Can join: All 3 (he's a customer of all)
🎉 Alert: "You can access 3 library groups from 3 libraries!"
```

---

## 🎯 Access Matrix

### **Student A (No Bookings):**
| Type | Can See | Can Join |
|------|---------|----------|
| UPSC Community | ✅ Yes | ✅ Yes |
| SSC Community | ✅ Yes | ✅ Yes |
| Central Hub Group | ❌ No | ❌ No |
| Knowledge Point Group | ❌ No | ❌ No |

### **Student B (Booked Central Hub):**
| Type | Can See | Can Join |
|------|---------|----------|
| UPSC Community | ✅ Yes | ✅ Yes |
| SSC Community | ✅ Yes | ✅ Yes |
| Central Hub Group | ✅ Yes | ✅ Yes |
| Knowledge Point Group | ❌ No | ❌ No |

### **Student C (Booked Both Libraries):**
| Type | Can See | Can Join |
|------|---------|----------|
| UPSC Community | ✅ Yes | ✅ Yes |
| SSC Community | ✅ Yes | ✅ Yes |
| Central Hub Group | ✅ Yes | ✅ Yes |
| Knowledge Point Group | ✅ Yes | ✅ Yes |

---

## 🔐 Security Implementation

### **1. Visibility Filter (Backend)**
```typescript
// Communities: Return ALL
const communities = await supabase
  .from('communities')
  .select('*')
  .eq('type', 'community'); // No filter

// Groups: Return ONLY from booked libraries
const bookedLibraryIds = bookings.map(b => b.library_id);
const groups = await supabase
  .from('communities')
  .select('*')
  .eq('type', 'group')
  .in('library_id', bookedLibraryIds); // FILTER by bookings
```

### **2. Join Validation (Backend)**
```typescript
if (community.type === 'group') {
  // Validate booking exists
  const bookings = await checkBookings(userId, libraryId);
  if (bookings.length === 0) {
    return 403; // Forbidden
  }
} else if (community.type === 'community') {
  // No validation - anyone can join
}
```

### **3. Add Member Validation (Backend)**
```typescript
// Always requires libraryId
// Always checks bookings table
// Always enforces customer-only for groups
```

---

## 📝 Backend Logs

### **Community (Open):**
```
[INFO] Student student-123 can see: 15 communities + 0 eligible groups
[INFO] ✅ Joining COMMUNITY (no booking required): userId=student-123
```

### **Group (Restricted):**
```
[INFO] Student student-456 can see: 15 communities + 3 eligible groups
[INFO] ✅ Customer verified for GROUP join: userId=student-456
```

### **No Bookings:**
```
[INFO] Student student-789 has no bookings → 0 library groups visible
[INFO] Student student-789 can see: 15 communities + 0 eligible groups
```

---

## ✅ Verification Checklist

**Exam Communities:**
- [ ] All students see same communities
- [ ] New students can join immediately
- [ ] No booking check performed
- [ ] Join button always works
- [ ] No "customer only" messages

**Library Groups:**
- [ ] Students only see groups from booked libraries
- [ ] Students with 0 bookings see 0 groups
- [ ] Students with 2 bookings see groups from those 2 libraries
- [ ] Join button checks booking before allowing
- [ ] Info banner shows booking count
- [ ] Non-customers see "Locked" message

---

## 🎉 Summary

**COMMUNITIES (Exam-based):**
- ✅ Open to everyone
- ✅ No restrictions
- ✅ All students see same communities
- ✅ Join anytime

**GROUPS (Library-specific):**
- 🔒 Customer-only
- 🔒 Must book library first
- 🔒 Visibility filtered by bookings
- 🔒 Join requires validation

**Perfect separation of concerns!** 🚀

---

*Rules verified on November 4, 2025*  
*Communities = Open | Groups = Restricted*

