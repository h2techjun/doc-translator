# Vercel Free Deployment Guide

## Why Vercel?
- **Native Support**: Built by the creators of Next.js.
- **Free Tier**: zero cost for hobbies (generous limits).
- **Serverless Function**: Supports our API routes (`/api/translate`) and Server Actions out of the box.
- **Global CDN**: Fast loading speeds worldwide.

## Steps
1. **Push to GitHub**: Ensure your project is committed and pushed to a GitHub repository.
2. **Login to Vercel**: Go to [vercel.com](https://vercel.com) and login with GitHub.
3. **Add New Project**: Click "Add New..." -> "Project".
4. **Import Repository**: Select your `00_Translation` repository.
5. **Configure Project**:
   - **Framework Preset**: Next.js (Auto-detected)
   - **Root Directory**: `.` (or specifically if it's a monorepo, but usually root)
   - **Environment Variables**: Copy these from your `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
6. **Deploy**: Click "Deploy". Wait ~1 minute.
7. **Domain**: You get a free `project-name.vercel.app` domain. You can connect a custom domain later.

## Alternatives
- **Netlify**: Very similar to Vercel, great free tier.
- **Google Cloud Run**: Powerful, but requires Dockerfile and credit card for account (even if free tier exists). More complex setup.
- **GitHub Pages**: **Not recommended** for this project because we use Server Actions and API Routes, which don't work on static hosting without complex configuration.
