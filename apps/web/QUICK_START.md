# 🚀 Web App Quick Start

## Current Issue: CORS Error ❌

Your web app can't connect to the backend because of CORS restrictions.

## ✅ Fix It Now (Choose One):

### **Option A: Update Railway** (5 minutes, uses production backend)

See: `/RAILWAY_CORS_FIX.md` in project root

Quick summary:
1. Go to Railway dashboard
2. Add variables:
   - `NODE_ENV=development`
   - `CORS_ORIGINS=http://localhost:3000,http://localhost:19006`
3. Wait for deploy
4. Refresh web app → Works! ✅

### **Option B: Run Backend Locally** (Instant, better for development)

```bash
# Terminal 1: Backend
cd backend
# Create .env file with your Supabase keys
npm run dev

# Terminal 2: Web App  
cd apps/web
# Update .env.local: NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev

# Open: http://localhost:3000
```

---

## 🎯 After CORS is Fixed

Your web app will work just like the mobile app:

1. **Sign Up** - Creates account in Supabase ✅
2. **Sign In** - Authenticates with JWT ✅
3. **Same Data** - Shares database with mobile app ✅
4. **Real-time Sync** - Changes appear everywhere ✅

---

## 📚 Full Documentation

- `README.md` - Complete web app docs
- `SETUP.md` - Setup instructions
- `../../RAILWAY_CORS_FIX.md` - CORS fix guide

