# 🆕 Fresh Student Portal Setup

## What We're Doing

1. **Archive Current Portal** - Backup existing code
2. **Create Fresh Structure** - Clean, minimal setup
3. **Keep Working Parts** - SDK and backend remain intact
4. **Start Clean** - No legacy code or conflicts

---

## Step 1: Archive Current Portal

The current `studyspot-student-pwa` will be backed up before creating fresh structure.

---

## Step 2: Fresh Portal Structure

```
studyspot-student-pwa/
├── src/
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles
│   ├── pages/               # Page components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── DashboardPage.tsx
│   ├── components/          # Reusable components
│   ├── services/            # API services
│   │   ├── api.ts
│   │   └── auth.ts
│   ├── hooks/               # Custom hooks
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   └── types/               # TypeScript types
├── public/                  # Static assets
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .env.example
```

---

## Step 3: Clean Dependencies

**Core:**
- React 18
- Vite
- TypeScript
- React Router

**UI:**
- Material-UI (MUI) - Latest stable
- Emotion (for styling)

**Auth:**
- studyspot-tenant-sdk (from packages/)

**HTTP:**
- Axios

**No:**
- ❌ Firebase (unless needed)
- ❌ Complex state management (start simple)
- ❌ Unused libraries

---

## Step 4: Configuration

### Environment Variables
```env
VITE_API_URL=https://studyspot-api.onrender.com
VITE_AUTH_URL=https://studyspot-auth.onrender.com
VITE_APP_NAME=StudySpot Student Portal
```

### Vite Config
- Clean, minimal setup
- Proper path aliases
- PWA support (optional)

---

## Step 5: Features to Build (Phase 1)

1. ✅ Authentication (Login/Register)
2. ✅ Dashboard (Basic)
3. ✅ Profile Page
4. ✅ Library Discovery
5. ✅ Booking System

---

## Next Steps

After fresh setup:
1. Test authentication
2. Build core features incrementally
3. Add features as needed
4. Keep it simple and maintainable


