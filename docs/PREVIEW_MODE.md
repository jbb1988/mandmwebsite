# Preview Mode - Password Gate

This site has a password gate to protect it from public access before launch.

## How It Works

When `PREVIEW_MODE=true` in production environment variables:
- **All pages** require password entry
- Users see a password gate page before accessing any content
- Once authenticated, a secure cookie is stored for 30 days
- Users won't need to re-enter password for 30 days

## Setup

### 1. Add Environment Variables

In your production environment (Vercel/etc), add:

```bash
PREVIEW_MODE=true
PREVIEW_PASSWORD=your_secure_password_here
```

**Important:** Choose a strong, unique password. Don't use "mindmuscle2025" in production!

### 2. Deploy

Deploy your site to production. The password gate will activate automatically.

### 3. Share Access

Give the password to:
- Your team members
- Beta testers
- Stakeholders who need to see the site

## Testing Locally

To test the password gate locally:

```bash
# In .env.local, add:
NODE_ENV=production
PREVIEW_MODE=true
PREVIEW_PASSWORD=testpassword123

# Then run:
npm run build
npm start
```

Visit http://localhost:3000 - you should see the password gate.

## How to Access

1. Go to https://mindandmuscle.ai
2. You'll see a password entry page
3. Enter the preview password
4. Click "Enter Site"
5. You'll be redirected to the homepage
6. Password is remembered for 30 days

## Turning Off Preview Mode

When ready to launch publicly:

### Option 1: Remove Password Gate (Recommended)

```bash
# In production environment variables, set:
PREVIEW_MODE=false
```

Or simply remove the `PREVIEW_MODE` variable entirely.

### Option 2: Delete Password Gate Files

If you want to completely remove the feature:

```bash
rm -rf src/app/auth/gate
rm src/app/api/auth/verify-gate/route.ts
rm src/middleware.ts
```

Then deploy.

## Bypassed Routes

These routes work without password (for webhooks/APIs):
- `/api/*` - API routes (except auth routes)
- `/_next/*` - Next.js internal
- `/favicon.ico` - Favicon
- `/assets/*` - Static assets

**Note:** Webhooks from Stripe will work even with password gate enabled!

## Security Notes

- Password is checked server-side
- Cookie is HTTP-only (can't be accessed by JavaScript)
- Cookie is secure in production (HTTPS only)
- Cookie expires after 30 days
- No user accounts - single shared password
- Perfect for pre-launch protection

## Troubleshooting

### Password gate not showing up

**Check:**
- `PREVIEW_MODE=true` in production env vars?
- `NODE_ENV=production` ?
- Deployed the latest code?

### Can't log in with correct password

**Check:**
- `PREVIEW_PASSWORD` env var is set correctly
- No extra spaces in password
- Password is case-sensitive

### Webhooks not working

Webhooks should work fine. The middleware allows all `/api/*` routes except auth routes.

If webhooks fail, check:
1. Webhook URL is correct in Stripe
2. Environment variables are set
3. Check Vercel logs for errors

## Changing the Password

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `PREVIEW_PASSWORD`
3. Click Edit → Enter new password → Save
4. Redeploy the site (or wait for next deployment)
5. Old cookies will be invalid, users need to re-authenticate

## For Customer Support

If someone loses/forgets the password:
- Give them the current `PREVIEW_PASSWORD` value
- They can enter it at https://mindandmuscle.ai/auth/gate
- Password is remembered for 30 days in their browser
