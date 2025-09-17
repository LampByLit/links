# Deploy Lynx to Vercel

## Quick Setup

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project settings
   - Add these environment variables:
     - `DATABASE_URL` - Your PostgreSQL connection string
     - `NODE_ENV` - `production`
     - `RATE_LIMIT_WINDOW_MS` - `120000`
     - `RATE_LIMIT_MAX_REQUESTS` - `1`
     - `UPLOAD_MAX_SIZE` - `10485760`
     - `UPLOAD_DIR` - `/tmp/uploads`
     - `TWITTER_SITE_HANDLE` - `@lampbylit`
     - `SITE_NAME` - `Lynx by LampByLit`

## Database Options

### Option 1: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get the connection string from Settings > Database
4. Use that as your `DATABASE_URL`

### Option 2: Railway PostgreSQL
1. Keep your Railway PostgreSQL service
2. Use the same connection string in Vercel

## Why Vercel?

- ✅ **Reliable free tier** - No SIGTERM issues
- ✅ **Automatic deployments** - Push to GitHub, auto-deploy
- ✅ **Better performance** - Edge functions and CDN
- ✅ **Easy environment management** - Simple dashboard
- ✅ **No platform issues** - Unlike Railway's current problems

## Migration Steps

1. Deploy to Vercel
2. Set up database (Supabase or keep Railway PostgreSQL)
3. Test the deployment
4. Update your domain if needed
5. Railway can be kept as backup or removed


