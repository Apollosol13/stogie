# Stogie Social - Web App

The web version of Stogie Social, built with Next.js 15 and matching the mobile app's design.

## Features

- ✅ Same authentication system as mobile app
- ✅ Same Supabase database (shared data!)
- ✅ Same backend API
- ✅ Premium dark cigar lounge theme
- ✅ Responsive design
- ✅ Real-time data sync with mobile app

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root of the web app:

```bash
cp .env.example .env.local
```

Update the `NEXT_PUBLIC_API_URL` to point to your Railway backend:

```
NEXT_PUBLIC_API_URL=https://stogie-production.up.railway.app
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication

The web app uses the **exact same authentication** as the mobile app:

- Sign up/Sign in with email and password
- JWT tokens stored in localStorage
- Same Supabase Auth backend
- Shared user accounts between mobile and web

### Testing Auth

1. **Sign Up** - Click "Sign Up" button in header
2. **Sign In** - Click "Sign In" button in header
3. **Sign Out** - Click "Sign Out" when authenticated

Accounts created on mobile work on web and vice versa!

## Project Structure

```
apps/web/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Auth pages (signin, signup)
│   ├── layout.tsx         # Root layout (includes AuthModal)
│   └── page.tsx           # Home page
├── components/
│   ├── auth/              # Auth components (AuthForm, AuthModal)
│   ├── StarRating.tsx     # Star rating component (from mobile)
│   └── ProtectedRoute.tsx # Wrapper for protected pages
├── lib/
│   ├── auth/              # Auth store and hooks
│   │   ├── store.ts       # Zustand auth state (matches mobile)
│   │   └── hooks.ts       # useAuth, useRequireAuth
│   ├── api.ts             # API client functions
│   └── constants/
│       └── colors.ts      # Color palette (from mobile app)
└── .env.local             # Environment variables (create from .env.example)
```

## Shared with Mobile App

The following are shared between mobile and web:

- ✅ **Backend API** - Same Railway backend
- ✅ **Supabase Database** - All tables (users, profiles, cigars, reviews, etc.)
- ✅ **Color Theme** - Exact same colors (`#0F0F0F`, `#D4B896`, etc.)
- ✅ **Auth Flow** - Same sign in/sign up logic
- ✅ **User Data** - Same accounts, profiles, and content

## Building for Production

```bash
npm run build
npm start
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy!

### Custom Domain

After deploying to Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Done! Your web app is live.

## Apple Submission

**Important:** The web app does NOT affect your iOS app submission to Apple!

- Apple only reviews the iOS build from `apps/mobile/`
- They never see the `apps/web/` folder
- Both apps share the same backend, but are deployed separately
- You can update the web app without affecting the iOS app

## API Endpoints Used

All endpoints point to your Railway backend:

- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/signout` - Sign out
- `POST /api/auth/refresh` - Refresh token
- (More endpoints as you build features)

## Next Steps

- [ ] Add profile page
- [ ] Add humidor page
- [ ] Add feed/social features
- [ ] Add map/venue search
- [ ] Add cigar review functionality
- [ ] Connect all backend API endpoints

## Need Help?

- Check mobile app code in `apps/mobile/` for reference
- Backend API in `backend/`
- All apps share the same Supabase database
