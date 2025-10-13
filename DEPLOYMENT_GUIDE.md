# Deployment Guide: Protected Production Deployment

Follow these steps to deploy your site to `mindandmuscle.ai` with password protection.

## Step 1: Set Up Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Click on your project (mandmwebsite)
3. Go to **Settings** → **Environment Variables**
4. Add these variables for **Production** environment:

```bash
# Password Gate (REQUIRED for protection)
PREVIEW_MODE=true
PREVIEW_PASSWORD=YourSecurePassword123

# Stripe (REQUIRED for webhooks)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase (REQUIRED for team codes)
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Resend (REQUIRED for emails)
RESEND_API_KEY=re_...

# Rate Limiting (REQUIRED)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Turnstile CAPTCHA (Optional)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x...
TURNSTILE_SECRET_KEY=0x...
```

**Important:**
- Choose a STRONG password for `PREVIEW_PASSWORD`
- Don't share the password publicly
- You can change it anytime by updating the env var and redeploying

## Step 2: Configure Domain in Vercel

1. In Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `mindandmuscle.ai`
4. Follow Vercel's instructions to update your DNS records at your domain registrar

**DNS Records to Add:**

Usually you need to add:
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel's IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Or use nameservers if Vercel provides them.

## Step 3: Deploy to Production

### Option A: Deploy from Main Branch (Easiest)

Your latest code is already pushed to GitHub. In Vercel:

1. Go to **Deployments** tab
2. Your latest commit should auto-deploy
3. Wait for build to complete (2-5 minutes)
4. Once done, click on the deployment
5. You'll see "Visit" button - this is your production site!

### Option B: Manual Deploy

```bash
# In your project directory:
npm run build

# Deploy to Vercel
vercel --prod
```

## Step 4: Verify Deployment

### Test the Password Gate

1. Open incognito/private browser window
2. Go to https://mindandmuscle.ai
3. You should see the **password gate page** (not the homepage!)
4. Enter your `PREVIEW_PASSWORD`
5. You should be redirected to the homepage
6. Password is remembered for 30 days

### Test the Website

After entering password, test these pages:
- ✅ Homepage loads
- ✅ Team Licensing page works
- ✅ Partner Program page works
- ✅ All images/assets load

## Step 5: Test Team License Purchase

**IMPORTANT:** This will test if webhooks work!

1. Go to https://mindandmuscle.ai/team-licensing
2. Enter test mode details:
   - Email: your.email@example.com
   - Seats: 12
   - Check "Test Mode" if available
3. Use test card: `4242 4242 4242 4242`
4. Complete purchase
5. **Check your email** - you should receive team code email!

### Verify Webhook

After purchase:
1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook
3. Check "Recent deliveries"
4. You should see **200 success** (not timeout!)

### Verify Database

1. Go to Supabase → Table Editor
2. Open `teams` or `team_join_codes` table (whichever one exists)
3. You should see the new team record with your purchase

## Step 6: Resend Your Previous Purchase Webhook

Now that webhooks work, let's process your earlier purchase:

1. Go to Stripe Dashboard → Webhooks → Your webhook
2. Find the failed event from Oct 13, 2025 (`evt_1SHnAk0JmaI4LyOVYjZelCFt`)
3. Click on it → Click **"Resend"** button
4. Should show 200 success
5. **Check your email** (jbb1988@hotmail.com) - team code email should arrive!
6. **Check Supabase** - team record should be created

**Your team code:** `TEAM-PKRM-L75S-6A29`

## Troubleshooting

### "Password gate not showing"

**Check:**
- `PREVIEW_MODE=true` in Vercel production env vars?
- Clear browser cache and try incognito
- Check deployment logs for errors

### "Webhook still timing out"

**Check:**
- Domain is properly configured and accessible
- Go to https://mindandmuscle.ai in browser - does it load?
- Check Vercel deployment status - is it live?
- Environment variables are set in Vercel production

### "Can't access any page"

This is correct! The password gate is working. Enter your password at `/auth/gate`.

### "Webhooks work but no email"

**Check:**
- `RESEND_API_KEY` is set in production
- Email is valid in Resend (not in sandbox mode)
- Check spam folder
- Check Resend dashboard: https://resend.com/emails

### "Team code not in Supabase"

**Check:**
- Which table should it go to? `teams` or `team_join_codes`?
- If wrong table, we need to update webhook code
- Check webhook logs in Vercel for errors

## When Ready to Launch Publicly

When you're ready to remove password protection:

1. Vercel Dashboard → Settings → Environment Variables
2. Set `PREVIEW_MODE=false` (or delete the variable)
3. Deploy or wait for next deployment
4. Site will be publicly accessible!

## Current Status

- ✅ Code is deployed to GitHub
- ⏳ Waiting for Vercel deployment to mindandmuscle.ai
- ⏳ Waiting for environment variables setup
- ⏳ Waiting to test webhooks

## Need Help?

If you get stuck:
1. Check Vercel deployment logs
2. Check browser console for errors (F12)
3. Share error messages from Vercel/Stripe/Supabase
