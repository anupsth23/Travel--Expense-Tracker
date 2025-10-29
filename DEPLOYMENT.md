# Deployment Guide

This guide will help you deploy your Travel Expense Tracker app for free using GitHub and Vercel.

## Option 1: Deploy to Vercel (Recommended - Easiest)

Vercel is the best option for Next.js apps and offers a generous free tier.

### Step 1: Push to GitHub

1. **Create a GitHub repository:**
   - Go to [github.com](https://github.com) and sign in
   - Click the "+" icon in the top right → "New repository"
   - Name it `travel-expense-tracker` (or any name you like)
   - Choose "Public" (free plans work with public repos)
   - **Don't** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit: Travel Expense Tracker app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

### Step 2: Deploy to Vercel

1. **Go to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account (recommended)

2. **Import your repository:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository (`travel-expense-tracker`)
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **That's it!**
   - Vercel will build and deploy your app automatically
   - You'll get a URL like: `https://your-app-name.vercel.app`
   - Every time you push to GitHub, Vercel will automatically redeploy

### Benefits of Vercel:
- ✅ Free forever for personal projects
- ✅ Automatic deployments from GitHub
- ✅ Custom domain support (free tier)
- ✅ Perfect Next.js integration
- ✅ Fast global CDN
- ✅ HTTPS by default

---

## Option 2: Deploy to Netlify (Alternative)

Netlify is another great option with similar features.

1. Push your code to GitHub (same as Step 1 above)
2. Go to [netlify.com](https://netlify.com) and sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Click "Deploy"

---

## Important Notes

### Local Storage Limitation
⚠️ **Important:** The app currently uses browser localStorage, which means:
- Data is stored **only in the user's browser**
- Data is **not synced across devices**
- Clearing browser data will delete expenses

### Future Enhancements (Optional)
To make data persistent across devices, you could:
- Add a backend database (Supabase, Firebase, MongoDB)
- Implement user authentication
- Sync data to cloud storage

---

## Updating Your Deployed App

After making changes to your code:

```bash
git add .
git commit -m "Description of your changes"
git push
```

Vercel/Netlify will automatically detect the changes and redeploy within 1-2 minutes.

---

## Troubleshooting

### Build Errors
If you encounter build errors:
1. Test locally first: `npm run build`
2. Check the build logs in Vercel/Netlify dashboard
3. Common issues:
   - Missing environment variables
   - Import path errors
   - Type errors

### Tesseract.js Issues
If OCR doesn't work in production:
- Vercel/Netlify should handle worker files automatically
- If issues persist, the webpack config in `next.config.js` should help

---

## Cost
Both Vercel and Netlify offer free tiers that are perfect for this project:
- **Vercel Free:** 100GB bandwidth/month, unlimited deployments
- **Netlify Free:** 100GB bandwidth/month, 300 build minutes/month

These are more than enough for personal use!

