# Fix Random Images - Replace with College Theme

## Problem
Your gallery currently shows random images (tigers, nature, etc.) from Unsplash placeholders.

## Solution
Run the fix script to replace them with college-themed placeholders.

## Steps:

### 1. Make sure your .env.local has Cloudinary credentials:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="diigktj8x"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 2. Run the fix script:
```bash
node scripts/fix-images.mjs
```

This will:
- Upload 45 college-themed placeholder images to Cloudinary
- Replace all random images with proper labeled placeholders
- Use color-coded themes:
  - 🔵 Blue: Events (Convocation, Freshers Day, etc.)
  - 🟢 Green: Campus (Main Gate, Library, etc.)
  - 🟠 Orange: Sports (Cricket, Basketball, etc.)
  - 🔷 Teal: Academics (Classroom, Labs, etc.)
  - 🟣 Purple: Cultural (Dance, Music, Drama, etc.)
  - 🔵 Cyan: Technical (TechFest, Hackathon, etc.)

### 3. Refresh your gallery:
```bash
# Restart dev server if needed
npm run dev
```

Visit: http://localhost:3000/gallery

## Alternative: Use Real Photos

To use real college photos instead of placeholders:

1. Upload your real photos to Cloudinary
2. Use these exact public IDs:
   - `mlrit/convocation-2024`
   - `mlrit/freshers-day-2024`
   - `mlrit/main-gate`
   - etc. (see scripts/fix-images.mjs for full list)

3. Or update your database with new public IDs

## What the Script Does:

The script uploads images like:
- **Convocation 2024** - Blue background with white text
- **Main Gate** - Green background with white text
- **Cricket Match** - Orange background with white text
- etc.

These are much better than random tiger/nature photos and clearly show what each image represents!
