# AI Removal & Manual Entry Implementation

## Changes Made

### Frontend Changes ✅

1. **Tab Name Updated**
   - Changed "IDENTIFY" → "CAPTURE" in tab bar
   - File: `apps/mobile/src/app/(tabs)/_layout.jsx`

2. **New Manual Entry Flow**
   - Replaced AI scanner with manual photo + form entry
   - File: `apps/mobile/src/app/(tabs)/scan.jsx`
   - Features:
     - Photo capture (camera or library)
     - Manual entry form (Brand, Line/Name, Vitola, Notes)
     - Humidor selection modal (Collection, Wishlist, Smoked)
     - Image upload integration

3. **Landing Page Updated**
   - Changed "Product Identification" → "Manual Documentation"
   - Updated description: "Photograph and manually catalog your collection"
   - File: `apps/mobile/src/app/(tabs)/home.jsx`

### Backend Changes ✅

1. **Removed AI Endpoints**
   - Deleted `/test-openai` endpoint
   - Deleted `/test-analyze` endpoint
   - Deleted `/analyze-v2` (OpenAI Vision) endpoint
   - File: `backend/routes/cigars.js`

2. **Updated Rate Limiting**
   - Renamed `scanLimiter` → `apiLimiter`
   - Changed limits to standard API rates

### Manual Entry API Endpoint

The app now uses the **existing humidor endpoint** for adding cigars:

```
POST /api/humidor
{
  "brand": "string (required)",
  "name": "string",
  "vitola": "string",
  "image_url": "string",
  "personal_notes": "string",
  "status": "collection|wishlist|smoked"
}
```

## Next Steps - IMPORTANT! ⚠️

### 1. Remove OpenAI API Key from Railway

**You MUST do this to save money and comply with App Store:**

1. Go to Railway dashboard: https://railway.app
2. Navigate to your Stogie backend project
3. Go to **Variables** tab
4. Find and **DELETE** the `OPENAI_API_KEY` variable
5. **Redeploy** the backend (Railway will auto-redeploy when you delete the variable)

### 2. Remove OpenAI Package (Optional - for later)

To clean up the backend completely:

```bash
cd backend
npm uninstall openai
git add package.json package-lock.json
git commit -m "Remove OpenAI dependency"
git push
```

## What Users Will Experience

### Old Flow (AI - REMOVED):
1. Tap "Identify" → Camera → AI analyzes → Show matches → Add to humidor

### New Flow (Manual Entry):
1. Tap "Capture" → Bottom sheet (Take Photo / Choose from Library)
2. Select/take photo → Manual entry form
3. Fill in: Brand (required), Line/Name, Vitola, Notes
4. Tap "Add to Humidor" → Choose: Collection, Wishlist, or Smoked
5. Done! ✅

## Benefits for App Store Review

✅ **No AI "encouraging" tobacco use**  
✅ **Manual documentation = informational tool**  
✅ **No expensive OpenAI API calls**  
✅ **Cleaner, simpler code**  
✅ **Faster user experience (no API delays)**  
✅ **Better for Apple's guidelines**  

## Files Modified

### Frontend:
- `apps/mobile/src/app/(tabs)/_layout.jsx` - Tab name change
- `apps/mobile/src/app/(tabs)/scan.jsx` - Complete rewrite with manual entry
- `apps/mobile/src/app/(tabs)/home.jsx` - Landing page feature text

### Backend:
- `backend/routes/cigars.js` - Removed AI endpoints

## Testing Checklist

- [ ] Tab shows "CAPTURE" instead of "IDENTIFY"
- [ ] Tapping CAPTURE button shows empty state with "Get Started" button
- [ ] "Get Started" opens bottom sheet with Camera/Library options
- [ ] Camera option takes photo and shows entry form
- [ ] Library option selects photo and shows entry form
- [ ] Entry form has: Brand (required), Line/Name, Vitola, Notes
- [ ] "Add to Humidor" button shows selection modal
- [ ] Can add to: Collection, Wishlist, or Smoked
- [ ] Successfully adds to humidor and shows success message
- [ ] Returns to empty capture screen after successful add

## Ready for App Store!

This removes ALL AI functionality that Apple could flag as "encouraging tobacco use."  
The app is now purely a **manual documentation tool** for existing cigar enthusiasts.

