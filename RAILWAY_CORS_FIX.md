# 🔧 Fix CORS Issue for Web App

Your web app can't connect to the backend because Railway's CORS settings are blocking localhost requests.

## ✅ Quick Fix (5 minutes)

### **Option 1: Update Railway (Recommended)**

1. **Go to Railway Dashboard**
   - Visit: https://railway.app/dashboard
   - Open your `stogie-production` project
   - Click on your backend service

2. **Add Environment Variables**
   - Click **"Variables"** tab
   - Click **"+ New Variable"**
   - Add these two variables:

   ```
   Variable 1:
   Name: NODE_ENV
   Value: development
   
   Variable 2:
   Name: CORS_ORIGINS
   Value: http://localhost:3000,http://localhost:19006,http://localhost:8081
   ```

3. **Save & Deploy**
   - Railway will automatically redeploy (takes ~1 minute)
   - Watch the deployment logs to confirm it's done

4. **Test Your Web App**
   - Go to http://localhost:3000
   - Click "Sign Up"
   - Fill out the form
   - Should work! ✅

---

### **Option 2: Run Backend Locally (Instant Testing)**

For faster development, run the backend on your machine:

#### **Step 1: Create .env File**

```bash
cd /Users/brennenstudenc/Downloads/Stogie/backend

# Create .env file (copy from .env.example)
cp env.example .env
```

#### **Step 2: Edit .env File**

Open `backend/.env` and set:

```bash
NODE_ENV=development
PORT=3001

# Get these from Railway dashboard → Variables tab
SUPABASE_URL=https://fjfvmhhmqtbrbpgxcrec.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_ANON_KEY=<your-anon-key>

JWT_SECRET=local-dev-secret-key-minimum-32-chars
```

#### **Step 3: Start Local Backend**

```bash
cd backend
npm run dev
```

You should see:
```
✅ Server running on port 3001
🔒 CORS: Development mode - allowing localhost
```

#### **Step 4: Update Web App**

Edit `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### **Step 5: Restart Web App**

```bash
cd apps/web
npm run dev
```

Now your web app talks to local backend - instant testing! ✅

---

## 🎯 Which Option Should I Use?

| Scenario | Recommended Option |
|----------|-------------------|
| Just want it to work | **Option 1** (Railway) |
| Frequent changes to backend | **Option 2** (Local) |
| Testing backend changes | **Option 2** (Local) |
| Testing with production data | **Option 1** (Railway) |

---

## ✅ How to Know It's Fixed

After applying the fix, you should see in browser console:

```
✅ 🔐 Signing up to: http://localhost:3001/api/auth/signup
✅ 🔐 Response status: 201
✅ 🔐 Response data: { success: true, session: {...} }
```

No more CORS errors! 🎉

---

## 🚀 Next Steps After Fix

1. ✅ Test sign up
2. ✅ Test sign in
3. ✅ Build more features
4. ✅ Deploy to production domain later

---

## 🆘 Still Having Issues?

Common problems:

**Problem: "Connection refused"**
- Solution: Make sure backend is running (`npm run dev` in backend folder)

**Problem: "Still getting CORS error"**
- Solution: Clear browser cache, restart dev server, check Railway deployed successfully

**Problem: "Can't find Supabase keys"**
- Solution: In Railway dashboard → Backend service → Variables tab, copy the keys

