# Deployment Guide

## Vercel Deployment

### Step 1: Set Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your `facility-rental` project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key-here` | Production, Preview, Development |

### Step 2: Get Your Supabase Credentials

1. Go to your Supabase dashboard: https://app.supabase.com/
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → **anon public** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Redeploy

After setting the environment variables:
1. Go to **Deployments** tab in Vercel
2. Click the **⋯** menu on the latest deployment
3. Select **Redeploy**
4. Or push a new commit to trigger automatic deployment

## Alternative: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy with environment variables
vercel --prod
```

## Environment Variables Setup

### For Local Development:
```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### For Production (Vercel Dashboard):
1. **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase anon/public key

## Troubleshooting

### Error: "supabaseUrl is required"
- **Cause**: Environment variables not set in Vercel
- **Solution**: Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel dashboard

### Error: "Missing env.NEXT_PUBLIC_SUPABASE_URL"
- **Cause**: Environment variable not properly configured
- **Solution**: Check spelling and ensure variables are set for all environments (Production, Preview, Development)

### Build Fails
- **Cause**: Missing dependencies or environment variables
- **Solution**: 
  1. Check that all environment variables are set
  2. Ensure `package.json` has all required dependencies
  3. Check build logs for specific errors

## Database Setup

After successful deployment:

1. **Apply Database Schema**:
   - Go to your Supabase dashboard
   - Open SQL Editor
   - Run the contents of `facility-rental-addon-schema.sql`

2. **Add Sample Data** (Optional):
   - Run the contents of `scripts/seed-data.sql`

3. **Test the Deployment**:
   - Visit `https://your-app.vercel.app/admin`
   - Test database connection
   - Verify data is loading correctly

## Custom Domain (Optional)

1. Go to Vercel dashboard → **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS settings as instructed
4. Update `NEXT_PUBLIC_SITE_URL` if needed

## Monitoring

- **Vercel Analytics**: Automatically enabled for performance monitoring
- **Error Tracking**: Check Vercel **Functions** tab for runtime errors
- **Logs**: View real-time logs in Vercel dashboard