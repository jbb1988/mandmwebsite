# Customer Support Guide: Team Codes

## Quick Access: Admin Team Lookup Tool

**URL:** https://mindandmuscle.ai/admin/team-lookup

Use this tool to instantly retrieve team codes for customers who didn't receive their email.

### How to Use:
1. Go to https://mindandmuscle.ai/admin/team-lookup
2. Enter customer's email address
3. Click "Lookup Teams"
4. Copy the team code and send it to the customer

---

## Why Customers Aren't Getting Emails

### Current Issue: Webhook Timeout

**Error:** "Timed out connecting to remote host"

This means Stripe cannot reach your webhook endpoint. The most likely cause is the webhook is pointing to the wrong URL.

### Fix Steps:

#### 1. Update Webhook Endpoint URL

In Stripe Dashboard:
1. Go to **Developers → Webhooks**
2. Click on your webhook endpoint
3. Click **...** menu → **Update details**
4. Set **Endpoint URL** to:
   ```
   https://mindandmuscle.ai/api/webhooks/stripe
   ```
5. Make sure it's NOT pointing to:
   ```
   https://mandmwebsite-8dbr26r7m-jeffs-projects-f709d5a2.vercel.app/...
   ```

#### 2. Verify Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Required variables for PRODUCTION:**
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
RESEND_API_KEY=re_...
```

If any are missing, add them and redeploy.

#### 3. Test the Webhook

After fixing the URL:
1. Go to Stripe Dashboard → Webhooks → [Your webhook]
2. Find your recent failed event
3. Click **⋮** menu → **Resend**
4. Should see success (200 response)
5. Check customer's email - they should receive the team code

---

## Manually Sending Team Codes to Customers

If webhook is still not working and you need to immediately help a customer:

### Option 1: Use Admin Lookup Tool (Fastest)

1. Go to https://mindandmuscle.ai/admin/team-lookup
2. Enter customer's email
3. Copy team code
4. Email them:

```
Subject: Your Mind & Muscle Team License Code

Hi [Customer Name],

Thank you for your purchase! Here's your team license information:

Team Code: TEAM-XXXX-XXXX-XXXX
Seats: 12

To activate Premium for your team:

1. Download Mind & Muscle from the App Store or Google Play
2. Go to More → Settings → Redeem Team Code
3. Enter your team code: TEAM-XXXX-XXXX-XXXX
4. Share the code with your team members

Each athlete or coach who redeems the code will use one seat.
Parents can view without using a seat.

Need help? Reply to this email.

Best,
Mind & Muscle Support
```

### Option 2: Query Supabase Directly

If admin tool doesn't work:

1. Go to https://supabase.com/dashboard
2. Select Mind & Muscle project
3. Go to **SQL Editor**
4. Run this query:

```sql
SELECT
  join_code,
  admin_email,
  max_seats,
  seats_used,
  license_status,
  created_at,
  stripe_subscription_id
FROM teams
WHERE admin_email = 'customer@email.com'
ORDER BY created_at DESC;
```

5. Copy the `join_code` value
6. Send to customer using email template above

### Option 3: Check Stripe Customer

1. Go to Stripe Dashboard → Customers
2. Search for customer email
3. Click on customer → Subscriptions
4. View subscription metadata
5. Look for `team_code` in metadata
6. Send to customer

---

## Preventing Future Issues

### Enable Webhook Monitoring

1. Set up alerts in Stripe for failed webhooks:
   - Stripe Dashboard → Webhooks → [Your webhook]
   - Click "Configure endpoint"
   - Enable "Email me when deliveries fail"

2. Monitor Vercel logs:
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on production deployment
   - Click "Logs" to see real-time webhook requests

### Set Up Backup Email Trigger

Consider adding a manual "Resend Team Code" button on the success page as a backup:

1. Customer sees team code on success page
2. If email doesn't arrive, they can click "Resend Email"
3. Triggers email directly without relying on webhook

---

## Common Customer Questions

### "I didn't receive my team code email"

**Response:**
1. Check spam/junk folder
2. Look up their email in admin tool: https://mindandmuscle.ai/admin/team-lookup
3. Send them the team code manually
4. If needed, resend the webhook from Stripe

### "I lost my team code"

**Response:**
1. Use admin lookup tool to retrieve it
2. Send them the code via email
3. They can also view it in Stripe receipt if they saved it

### "How many seats do I have left?"

**Response:**
1. Look up in admin tool - shows "X / Y used"
2. Or check Supabase `teams` table: `seats_used` vs `max_seats`

### "Can I add more seats?"

**Response:**
- Yes! Direct them to: https://mindandmuscle.ai/team-licensing/manage
- They'll enter their team code
- Can purchase additional seats at their locked-in rate
- Maximum: 2x their original seat count

---

## Emergency: Customer Needs Team Code Right Now

**Fastest method (< 1 minute):**

1. Open https://mindandmuscle.ai/admin/team-lookup
2. Enter customer email → Search
3. Copy team code
4. Text/email/chat them immediately

**Alternative if admin tool is down:**

1. Open Supabase: https://supabase.com/dashboard
2. Table Editor → teams → Filter by admin_email
3. Copy join_code value
4. Send to customer

---

## Testing After Fix

After fixing webhook endpoint:

1. Make a test purchase with test card: 4242 4242 4242 4242
2. Check your email for team code
3. Verify team created in Supabase
4. Check Stripe webhook shows 200 success
5. Verify in Resend dashboard: https://resend.com/emails

If all 5 checks pass ✅, emails will work for real customers.
