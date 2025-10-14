# Partner Program Approval Workflow

## Overview
The Mind & Muscle Partner Program uses **automatic approval** through the Tolt affiliate platform. When users submit the application form, they are instantly created as partners and receive immediate access to their dashboard.

## How It Works

### 1. User Submits Application
When a user completes the partner application form on `https://mindandmuscle.ai/partner-program`:

1. Form validates required fields:
   - Full Name
   - Email Address
   - Network Size
   - Promotion Channel
   - Why excited about M&M

2. Cloudflare Turnstile CAPTCHA verification (prevents spam/bots)

3. Form submission triggers `/api/partner-application` endpoint

### 2. Automatic Partner Creation (Instant)
The API automatically:

1. **Creates partner in Tolt** via API:
   - Sends application data to Tolt's `/v1/affiliates` endpoint
   - Partner is immediately active in Tolt
   - Partner receives unique referral tracking link
   - Partner gets access to Tolt dashboard

2. **Sends notification email to support@mindandmuscle.ai**:
   - Contains all application details
   - Confirms partner was auto-created in Tolt
   - Includes link to Tolt dashboard for management

3. **Sends welcome email to partner**:
   - Welcome message with program details
   - Link to Tolt dashboard (app.tolt.io)
   - Instructions for getting referral link
   - Commission structure details
   - Next steps for getting started

### 3. Partner Gets Immediate Access
Partners receive:
- Tolt onboarding email (separate, sent by Tolt)
- Welcome email from Mind & Muscle
- Access to partner dashboard at app.tolt.io
- Unique referral tracking link
- Marketing resources and materials

## Where Submissions Go

### Email Notifications
1. **Internal Team** (`support@mindandmuscle.ai`):
   - Receives notification for every new partner
   - Can review application details
   - Can manage/remove partners if needed

2. **New Partner** (their email):
   - Welcome email with dashboard access
   - Onboarding instructions
   - Commission details

### Tolt Dashboard
All partners are automatically added to:
**https://app.tolt.io** (Tolt Partner Management)

You can access the Tolt dashboard to:
- View all partners
- See referral performance
- Track commissions
- Manage payouts
- Remove/block partners if needed

## Managing Partners

### Viewing Partners
1. Go to https://app.tolt.io
2. Log in with your Tolt account
3. Navigate to "Partners" section
4. View all active partners and their performance

### Removing a Partner (If Needed)
If you need to remove a partner (spam, violation of terms, etc.):

1. Log into Tolt dashboard
2. Find the partner in the Partners list
3. Click on their profile
4. Select "Remove" or "Block"
5. Partner will lose access and tracking link becomes inactive

### Reviewing Partner Performance
In the Tolt dashboard you can see:
- Total clicks on referral links
- Conversions (sign-ups)
- Revenue generated
- Commission earned
- Payout status

## Commission Structure

### Partner Earnings
- **10% lifetime recurring commission** on all referred sales
- **90-day attribution window** (cookie tracking)
- **$50 minimum payout threshold**
- **NET-60 payment terms** (paid 60 days after customer payment clears)
- **Monthly PayPal payouts**

### Example
1. Partner refers a team coach
2. Coach subscribes for $29.99/month
3. Partner earns $3.00 commission on first payment
4. Partner earns $3.00 on every renewal (monthly)
5. Commission paid via PayPal 60 days after payment clears

## Technical Setup

### Required Environment Variables
In `/website/.env.local`:

```bash
# Cloudflare Turnstile (CAPTCHA)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here

# Tolt Partner System
TOLT_API_KEY=tlt_live_...

# Email Notifications
RESEND_API_KEY=re_...
```

### Getting Turnstile Keys
1. Go to https://dash.cloudflare.com/
2. Navigate to Turnstile
3. Create a new site
4. Copy Site Key → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
5. Copy Secret Key → `TURNSTILE_SECRET_KEY`
6. Add both to `.env.local`

## Troubleshooting

### Form Won't Submit
**Cause**: Missing Turnstile CAPTCHA keys

**Solution**:
1. Add Turnstile keys to `.env.local`
2. Restart Next.js dev server
3. CAPTCHA should appear on form
4. Users can complete verification and submit

### Partner Not Created in Tolt
**Check**:
1. Tolt API key is valid in `.env.local`
2. Check API logs for error messages
3. Verify partner email doesn't already exist in Tolt

**Solution**:
- If partner exists, Tolt returns 409 error (this is OK - partner already exists)
- If API key invalid, update `TOLT_API_KEY` in `.env.local`

### Emails Not Sending
**Check**:
1. Resend API key is valid (`RESEND_API_KEY`)
2. Check Resend dashboard for delivery status
3. Verify sender email is verified in Resend

**Solution**:
- Update Resend API key if expired
- Verify `partners@mindandmuscle.ai` domain in Resend

## API Endpoint

**Endpoint**: `/api/partner-application`
**Method**: `POST`
**Rate Limit**: 2 requests per 5 minutes per IP

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "organization": "Example Sports Club",
  "networkSize": "16-30",
  "promotionChannel": "email",
  "whyExcited": "Love helping coaches...",
  "audience": "Youth baseball coaches",
  "turnstileToken": "cloudflare_token"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Application received and partner created in Tolt"
}
```

## Security Features

1. **Cloudflare Turnstile** - Prevents bot submissions
2. **Rate Limiting** - 2 applications per 5 minutes per IP
3. **Input Validation** - All fields sanitized/validated
4. **Email Verification** - Partners must verify email to access dashboard

## Support

If you need to manually approve/reject partners or make changes:
- Access Tolt dashboard: https://app.tolt.io
- Email Tolt support: support@tolt.io
- Internal team email: support@mindandmuscle.ai

## Related Files

- Form UI: `/website/src/app/partner-program/page.tsx`
- API Handler: `/website/src/app/api/partner-application/route.ts`
- Environment Config: `/website/.env.local`
- Partner Terms: `/website/src/app/partner-terms/page.tsx`
