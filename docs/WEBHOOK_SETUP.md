# Stripe Webhook Setup Guide

## Issue
Emails with team codes aren't being sent after purchase because the Stripe webhook isn't triggering the email function.

## Root Cause
The webhook was also generating a DIFFERENT team code than shown on the success page, causing confusion. This has been fixed in the code.

## Required Stripe Configuration

### 1. Create Webhook Endpoint (if not exists)

In Stripe Dashboard:
1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL: `https://mindandmuscle.ai/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed` (required for initial purchase emails)
   - `invoice.payment_succeeded` (for renewal tracking)
   - `invoice.payment_failed` (for payment failures)
   - `customer.subscription.deleted` (for cancellations)

### 2. Copy Webhook Secret

After creating the webhook:
1. Click on the webhook endpoint
2. Click **Reveal** next to "Signing secret"
3. Copy the secret (starts with `whsec_...`)

### 3. Update Environment Variable

Add to your `.env.local`:
```
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

### 4. Deploy Changes

After updating the environment variable:
```bash
# If using Vercel
vercel env pull
vercel --prod
```

## Testing the Webhook

### Option 1: Stripe CLI (Local Testing)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger a test checkout
stripe trigger checkout.session.completed
```

### Option 2: Test in Production
1. Make a test purchase with test card: `4242 4242 4242 4242`
2. Check Stripe Dashboard → Webhooks → [Your webhook] → Recent deliveries
3. Should see successful delivery with 200 response

### Option 3: Manually Resend Event
1. Go to Stripe Dashboard → Webhooks → [Your webhook]
2. Find a past `checkout.session.completed` event
3. Click "Resend" to trigger the webhook again

## Verifying Email Delivery

After webhook fires successfully:
1. Check Resend dashboard at https://resend.com/emails
2. Should see email sent to customer's address
3. Email subject: "Your Team License is Active! 🎉"

## Troubleshooting

### Email not received but webhook shows success
- Check Resend API key is set: `RESEND_API_KEY` in `.env.local`
- Check spam folder
- Verify email in Resend dashboard

### Webhook showing 400/500 errors
- Check environment variables are set correctly
- Check Supabase connection (`SUPABASE_SERVICE_ROLE_KEY`)
- Check logs in Vercel dashboard for error details

### Team code mismatch
- **FIXED** in latest deployment
- Webhook now uses team code from checkout session metadata
- Code on success page will match code in email

## Code Changes Made

Fixed in commit `2715c35`:
- Webhook now uses `session.metadata.team_code` instead of generating new code
- Removed duplicate `generateTeamCode()` function from webhook
- Added validation to ensure team code exists before processing

## Current Flow

1. **Checkout**: Generates team code `TEAM-XXXX-XXXX-XXXX`
2. **Success page**: Shows same team code to user
3. **Webhook fires**: Uses SAME team code, creates Supabase record, sends email
4. **Email received**: Contains same team code user saw on success page
