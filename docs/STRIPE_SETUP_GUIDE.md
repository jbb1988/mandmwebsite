# Stripe Team Licensing Setup Guide

This guide walks you through completing the Stripe integration for team licensing on the Mind and Muscle website.

## ✅ What's Already Done

1. ✅ Stripe SDK installed (`stripe` and `@stripe/stripe-js`)
2. ✅ Supabase client library installed (`@supabase/supabase-js`)
3. ✅ API route created: `/api/create-checkout-session`
4. ✅ Webhook handler created: `/api/webhooks/stripe`
5. ✅ Success page created: `/team-licensing/success`
6. ✅ Cancel handling added to team licensing page
7. ✅ Email input field added to purchase flow

## 🔧 Required Setup Steps

### 1. Get Supabase Service Role Key

The webhook handler needs admin access to create team records in Supabase.

**Steps:**
1. Go to your Supabase project: https://kuswlvbjplkgrqlmqtok.supabase.co
2. Navigate to **Settings** > **API**
3. Copy the **service_role** key (not the anon key!)
4. Add it to `/Users/jbb/Downloads/Mind-Muscle/website/.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (your actual service role key)
   ```

⚠️ **Important**: The service role key bypasses Row Level Security. Never expose it to the client side.

### 2. Configure Stripe Webhook

**Steps:**
1. Go to Stripe Dashboard: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Set **Endpoint URL** to: `https://yourdomain.com/api/webhooks/stripe`
   - For local testing, use ngrok or similar tool
4. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Update `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
   ```

### 3. Verify Supabase Teams Table

Make sure your `teams` table has all required columns:

```sql
-- Check if teams table has correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'teams'
ORDER BY ordinal_position;
```

**Required columns:**
- `id` (uuid, primary key)
- `name` (text)
- `join_code` (text, unique)
- `license_type` (text)
- `license_status` (text)
- `max_seats` (integer)
- `seats_used` (integer)
- `stripe_subscription_id` (text, nullable)
- `stripe_customer_id` (text, nullable)
- `admin_email` (text)
- `metadata` (jsonb)
- `created_at` (timestamp)
- `updated_at` (timestamp)

If any columns are missing, add them:

```sql
-- Add missing columns
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS admin_email text,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
```

### 4. Set Up Email Service (Optional but Recommended)

The webhook handler currently logs team codes instead of emailing them. To enable email:

**Option A: Using Resend (Recommended)**

1. Sign up at https://resend.com
2. Get API key
3. Install: `npm install resend`
4. Update webhook handler:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTeamCodeEmail(email: string, teamCode: string, seatCount: number) {
  await resend.emails.send({
    from: 'Mind and Muscle <noreply@yourdomain.com>',
    to: email,
    subject: 'Your Team License is Active! 🎉',
    html: `
      <h1>Welcome to Mind and Muscle Team Licensing!</h1>
      <p>Your team license for ${seatCount} seats is now active.</p>
      <p><strong>Team Join Code:</strong> <code style="font-size: 24px; padding: 10px; background: #f0f0f0;">${teamCode}</code></p>
      <h2>Next Steps:</h2>
      <ol>
        <li>Download the Mind and Muscle app</li>
        <li>Share this code with your team members</li>
        <li>They enter the code in the app to unlock Premium</li>
      </ol>
    `,
  });
}
```

**Option B: Using SendGrid**

1. Sign up at https://sendgrid.com
2. Get API key
3. Install: `npm install @sendgrid/mail`
4. Similar implementation to Resend

### 5. Test the Integration

**Local Testing with Stripe CLI:**

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local dev server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Use the webhook secret from the CLI output temporarily
5. Trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   ```

**Test Flow:**
1. Go to http://localhost:3000/team-licensing
2. Enter email and select seat count
3. Click purchase (will redirect to Stripe test checkout)
4. Use test card: `4242 4242 4242 4242`, any future date, any CVC
5. Complete purchase
6. Verify webhook receives event and creates team in Supabase
7. Check that team code is logged (or emailed if configured)
8. Verify success page shows session ID

### 6. Production Deployment

**Before going live:**

1. ✅ Switch Stripe to **live mode**
2. ✅ Update `.env.local` with **live** keys:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - `STRIPE_SECRET_KEY=sk_live_...`
3. ✅ Set up webhook in **live** mode Stripe dashboard
4. ✅ Update `STRIPE_WEBHOOK_SECRET` with live webhook secret
5. ✅ Test with real credit card (small amount)
6. ✅ Verify email delivery works
7. ✅ Test team code redemption in mobile app

## 📋 Testing Checklist

- [ ] Purchase completes successfully
- [ ] Webhook receives `checkout.session.completed` event
- [ ] Team record created in Supabase with correct data
- [ ] Team code is unique (8 characters, alphanumeric)
- [ ] Email sent to purchaser with team code
- [ ] Success page displays correctly
- [ ] Cancel page displays message when user cancels
- [ ] Team code can be redeemed in mobile app
- [ ] Athletes/coaches consume seats
- [ ] Parents don't consume seats
- [ ] Seat limit enforced correctly
- [ ] Annual renewal works (test in Stripe dashboard)
- [ ] Failed payment updates license status to inactive

## 🚨 Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Service role key** should only be used server-side
3. **Webhook secret** must be verified on every webhook request
4. **Stripe keys** - publishable key is public, secret key is private

## 📝 Current Pricing Structure

- **Base Price**: $119/seat/year (10% off $149)
- **Team (12-119 seats)**: $107.20/seat/year (10% discount)
- **Organization (120-199 seats)**: $101.15/seat/year (15% discount)
- **League (200+ seats)**: $95.20/seat/year (20% discount)

All tiers are **auto-renewing annual subscriptions**.

## 🔗 Useful Links

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Webhooks Docs](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Supabase Dashboard](https://kuswlvbjplkgrqlmqtok.supabase.co)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## 🆘 Troubleshooting

### Webhook not receiving events
- Check endpoint URL is correct in Stripe dashboard
- Verify webhook secret in `.env.local`
- Check server logs for errors
- Use Stripe CLI for local testing

### Team code not being created
- Check Supabase service role key is correct
- Verify teams table has all required columns
- Check webhook handler logs for errors
- Ensure RLS policies allow service role to insert

### Email not sending
- Verify email service API key is correct
- Check email service logs/dashboard
- Ensure "from" email is verified (for some services)
- Test email function independently

### Seat consumption not working
- Verify `redeem_team_join_code` RPC is updated
- Check that role is being passed correctly from app
- Test with different roles (parent vs athlete/coach)
- Verify seats_used increments correctly
