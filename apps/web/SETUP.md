# Web App Setup Complete! 🎉

Your Stogie Social web app is now ready with full authentication!

## ✅ What's Been Built

### Authentication System
- ✅ Zustand auth store (matches mobile app)
- ✅ Sign in/Sign up forms
- ✅ Auth modal system
- ✅ Protected routes
- ✅ JWT token storage (localStorage)
- ✅ Session management

### Pages
- ✅ Home page with auth buttons
- ✅ Sign in page (`/auth/signin`)
- ✅ Sign up page (`/auth/signup`)
- ✅ Profile page (protected, example)

### Components
- ✅ AuthForm (email/password)
- ✅ AuthModal (popup)
- ✅ StarRating (from mobile)
- ✅ ProtectedRoute wrapper

### Integration
- ✅ Same backend API as mobile
- ✅ Same Supabase database
- ✅ Same color theme
- ✅ Shared user accounts

## 🚀 Quick Start

### 1. Start the Dev Server

```bash
cd /Users/brennenstudenc/Downloads/Stogie/apps/web
npm run dev
```

### 2. Open Browser

Go to: http://localhost:3000

### 3. Test Authentication

**Try this flow:**

1. Click "Sign Up" in header
2. Fill in:
   - Email: `test@example.com`
   - Password: `password123`
   - Full Name: `Test User`
   - Username: `testuser`
3. Accept terms
4. Click "Create Account"
5. You'll be signed in! ✅

**The account is now in Supabase!** You can:
- Sign out and sign back in on web
- Open the mobile app and sign in with same email/password
- Data syncs between both!

## 📱 Test With Mobile App

1. **Sign up on web** with email `web@test.com`
2. **Open mobile app** and sign in with `web@test.com`
3. **Same account!** Same Supabase database!

OR reverse:
1. **Sign up on mobile** app
2. **Open web** and sign in
3. **Works!**

## 🔗 API Connection

The web app connects to your Railway backend:

```
https://stogie-production.up.railway.app
```

All auth requests go through:
- `/api/auth/signin` - Sign in
- `/api/auth/signup` - Sign up
- `/api/auth/signout` - Sign out

## 🎨 Theme

Your premium dark cigar lounge theme is applied:
- Background: `#0F0F0F`
- Gold accent: `#D4B896`
- Same as mobile app!

## 📄 Pages Available

| Page | URL | Auth Required |
|------|-----|---------------|
| Home | `/` | No |
| Sign In | `/auth/signin` | No |
| Sign Up | `/auth/signup` | No |
| Profile | `/profile` | **Yes** |

## 🛡️ Using Auth in New Pages

### Option 1: Protected Page (Redirect if not signed in)

```typescript
'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth/hooks';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <MyPageContent />
    </ProtectedRoute>
  );
}

function MyPageContent() {
  const { user } = useAuth();
  
  return <div>Hello {user?.name}!</div>;
}
```

### Option 2: Optional Auth (Show different content)

```typescript
'use client';

import { useAuth } from '@/lib/auth/hooks';

export default function MyPage() {
  const { isAuthenticated, user, signIn } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <div>
        <p>Please sign in to continue</p>
        <button onClick={signIn}>Sign In</button>
      </div>
    );
  }
  
  return <div>Welcome back, {user?.name}!</div>;
}
```

### Option 3: Make Authenticated API Calls

```typescript
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth/hooks';

function MyComponent() {
  const { jwt } = useAuth();
  
  const loadData = async () => {
    const data = await apiRequest('/api/cigars', {
      method: 'GET'
    }, jwt);
    
    console.log('My cigars:', data);
  };
  
  return <button onClick={loadData}>Load My Cigars</button>;
}
```

## 🌐 Deploy to Vercel

When you're ready to deploy:

```bash
# Push to GitHub
git add .
git commit -m "Add web app with authentication"
git push

# Then in Vercel:
1. Import your GitHub repo
2. Set Root Directory: apps/web
3. Add Environment Variable:
   - NEXT_PUBLIC_API_URL = https://stogie-production.up.railway.app
4. Deploy!
```

Your web app will be live at `https://your-project.vercel.app`

## 🎯 Next Steps

Now that auth is working, you can build:

1. **Profile Page** - Edit profile, upload avatar
2. **Humidor Page** - View cigar collection
3. **Feed Page** - Social posts from community
4. **Map Page** - Find nearby cigar lounges
5. **Cigar Details** - View and rate cigars

All using the same backend API and Supabase database as your mobile app!

## 🍎 Apple Submission

**Don't worry!** This web app:
- ✅ Does NOT affect iOS app submission
- ✅ Lives in separate folder (`apps/web/`)
- ✅ Deploys separately to Vercel
- ✅ Apple never sees it

You can submit the mobile app to Apple while developing the web app simultaneously!

## 📊 Current Status

| Feature | Status |
|---------|--------|
| Authentication | ✅ Working |
| Sign Up | ✅ Working |
| Sign In | ✅ Working |
| Sign Out | ✅ Working |
| Protected Routes | ✅ Working |
| Shared Database | ✅ Working |
| Dark Theme | ✅ Applied |
| Responsive Design | ✅ Mobile-friendly |

## Need Help?

Check the main README.md for more details or see the mobile app code for reference on how features are implemented there.

Happy coding! 🚀

