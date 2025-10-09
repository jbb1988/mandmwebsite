# Tolt Partner Program Configuration Guide

This guide walks through configuring your Tolt partner program dashboard for Mind and Muscle.

## Initial Setup

### 1. Create Tolt Account

1. Go to [https://tolt.io](https://tolt.io)
2. Sign up for an account
3. Choose the plan that fits your needs:
   - **Starter** ($0/month): Up to $2,000 in monthly sales
   - **Growth** ($29/month): Up to $10,000 in monthly sales
   - **Scale** ($99/month): Unlimited sales

### 2. Get Your API Keys

1. Log into [https://app.tolt.io](https://app.tolt.io)
2. Navigate to **Settings** → **API Keys**
3. Copy your **Public Key** (starts with `pk_`)
   - Already integrated: `pk_knKjzY4oMarf4aSoCo2PzzKz`
4. Copy your **Secret Key** (starts with `tolt_sk_`)
   - Add to environment: `TOLT_API_KEY=tolt_sk_...`

---

## Program Settings

### 1. Commission Structure

Navigate to **Settings** → **Commission** and configure:

**Commission Rate**: `10%`
- Partners earn 10% of all sales they refer
- This applies to both initial purchase AND annual renewals

**Commission Type**: `Revenue Share (Recurring)`
- Enable "Track lifetime value"
- Partners earn 10% every time subscription renews

**Example Calculation**:
```
Team license: $107/seat × 12 seats = $1,284/year
Partner commission: $1,284 × 10% = $128.40

Year 1: $128.40
Year 2: $128.40 (renewal)
Year 3: $128.40 (renewal)
Total over 3 years: $385.20
```

### 2. Payout Settings

Navigate to **Settings** → **Payouts** and configure:

**Payout Method**: `PayPal`
- Partners receive payments via PayPal
- Alternative: Bank transfer (for high-volume partners)

**Payout Frequency**: `Monthly`
- Payouts processed on the 1st of each month
- For all approved commissions from previous month

**Minimum Payout**: `$50`
- Partners must accumulate at least $50 before payout
- Balances under $50 roll over to next month

**Hold Period**: `60 days`
- Commissions held for 60 days after sale
- Protects against chargebacks and refunds
- Industry standard for SaaS products

**Example Timeline**:
```
Jan 1:  Sale made through partner link
Mar 2:  Commission approved (60 days later)
Apr 1:  Payout processed (next monthly payout)
Apr 3:  Partner receives PayPal payment
```

### 3. Cookie Settings

Navigate to **Settings** → **Tracking** and configure:

**Cookie Duration**: `90 days`
- Visitors have 90 days to purchase after clicking partner link
- Generous window ensures partners get credited
- Balances attribution accuracy with partner benefit

**Attribution Model**: `Last Click`
- If user clicks multiple partner links, last one wins
- Standard model for affiliate programs
- Simple and fair

**Tracking Domain**: `mindandmuscle.com`
- Tolt will track clicks and conversions on this domain
- Make sure Tolt script is installed on all pages

---

## Partner Dashboard Setup

### 1. Partner Application Form

Navigate to **Partners** → **Application Settings**

Enable these fields:
- ✅ Name (required)
- ✅ Email (required)
- ✅ Website or Social Media Link (optional)
- ✅ Audience Size (optional)
- ✅ "Why do you want to be a partner?" (optional)

**Approval Type**: `Auto-approve`
- For coaches/trainers with existing audiences: Auto-approve
- For unknown applicants: Manual review

**Custom Message**:
```
Thanks for your interest in partnering with Mind and Muscle!

We're looking for coaches, trainers, and sports program directors who:
• Have experience with youth athlete development
• Want to share mental training tools with their network
• Are passionate about developing the complete athlete (mind + muscle)

If this sounds like you, apply below and we'll get you set up!
```

### 2. Partner Resources

Navigate to **Partners** → **Resources**

Upload or link to:
- Marketing assets: `https://mindandmuscle.com/partner-resources`
- Brand guidelines: Link to your brand guide
- Email templates: Available on resources page
- Social graphics: Available on resources page

### 3. Partner Tiers (Optional)

If you want to reward top performers, create tiers:

Navigate to **Settings** → **Tiers**

**Tier 1: Starter** (0-5 conversions)
- Commission: 10%
- Benefits: Standard resources

**Tier 2: Pro** (6-15 conversions)
- Commission: 12%
- Benefits: Featured on partner page, priority support

**Tier 3: Elite** (16+ conversions)
- Commission: 15%
- Benefits: Custom landing page, co-marketing opportunities

---

## Integrations

### 1. Stripe Integration

Navigate to **Integrations** → **Stripe**

**Purpose**: Automatically sync Stripe subscriptions with Tolt

**Setup**:
1. Click "Connect Stripe Account"
2. Authorize Tolt to access Stripe data
3. Map Stripe products to Tolt programs:
   - Map your team license subscription to "Mind and Muscle Team License"

**Note**: We're NOT using the built-in Stripe integration. Instead, we're using webhooks to send conversions to Tolt's API. This gives us more control and allows us to:
- Track mobile app affiliate codes
- Handle complex subscription logic
- Customize conversion data

**Our Approach**:
```typescript
// We manually notify Tolt via API
POST https://api.tolt.io/v1/conversions
{
  "referral_code": "PARTNER_CODE",
  "amount": 1284.00,
  "customer_email": "customer@example.com",
  "external_id": "sub_xxx",
  "metadata": {
    "subscription_id": "sub_xxx",
    "is_renewal": false
  }
}
```

### 2. Email Integration (Optional)

Navigate to **Integrations** → **Email**

Connect your email service (e.g., SendGrid, Mailchimp) to:
- Send partner welcome emails
- Notify partners of new conversions
- Send monthly earnings reports

### 3. Zapier Integration (Optional)

Use Zapier to:
- Post to Slack when new partner signs up
- Add partners to CRM (e.g., HubSpot)
- Send notifications for high-value conversions

---

## Notifications and Emails

### 1. Partner Welcome Email

Navigate to **Settings** → **Emails** → **Partner Welcome**

**Subject**: Welcome to the Mind and Muscle Partner Program!

**Body**:
```
Hi [Partner Name],

Welcome to the Mind and Muscle Partner Program! We're excited to have you on board.

Here's what you need to know:

🔗 YOUR REFERRAL LINK
[Unique Partner Link]

Share this link on your website, social media, email newsletters, or anywhere your audience hangs out. When someone clicks your link and purchases within 90 days, you earn 10% commission.

💰 COMMISSION STRUCTURE
• 10% of all sales (including renewals)
• Lifetime recurring commission (earn on renewals every year)
• 60-day hold period for chargebacks
• $50 minimum payout threshold
• Monthly PayPal payouts

📚 MARKETING RESOURCES
We've created everything you need to promote Mind and Muscle:
• Email templates
• Social media copy
• Landing page variations
• Design asset specifications

Access all resources here: https://mindandmuscle.com/partner-resources

📊 TRACK YOUR EARNINGS
Log into your partner dashboard anytime to see:
• Real-time clicks and conversions
• Earnings (pending and approved)
• Payout history
• Top-performing content

Dashboard: https://app.tolt.io/dashboard/[partner_id]

❓ QUESTIONS?
Email us at partners@mindandmuscle.com

Let's grow together!

The Mind and Muscle Team
```

### 2. Conversion Notification

Navigate to **Settings** → **Emails** → **Conversion Notification**

**Subject**: You earned a commission! 🎉

**Body**:
```
Hi [Partner Name],

Great news! Someone just purchased through your referral link.

CONVERSION DETAILS
• Amount: $[amount]
• Your commission: $[commission] (10%)
• Customer: [customer_email]
• Date: [conversion_date]

PAYOUT TIMELINE
• Hold period: 60 days (protects against chargebacks)
• Approval date: [approval_date]
• Payout: Next monthly payout after approval (1st of month)

Keep sharing your link and earning commissions!

Track your earnings: https://app.tolt.io/dashboard/[partner_id]

The Mind and Muscle Team
```

### 3. Payout Notification

Navigate to **Settings** → **Emails** → **Payout Notification**

**Subject**: Your payout is on the way! 💵

**Body**:
```
Hi [Partner Name],

Your monthly payout has been processed!

PAYOUT DETAILS
• Amount: $[payout_amount]
• Conversions: [conversion_count]
• Period: [start_date] - [end_date]
• Payment method: PayPal ([paypal_email])
• Expected arrival: 2-3 business days

NEXT MONTH
• Pending commissions: $[pending_amount]
• Estimated next payout: $[estimated_payout]

Keep up the great work!

The Mind and Muscle Team
```

---

## Analytics and Reporting

### 1. Dashboard Overview

Your Tolt dashboard shows:

**Key Metrics**:
- Total clicks (lifetime)
- Conversion rate (%)
- Total revenue generated
- Your total earnings
- Pending commissions
- Approved commissions
- Payout history

**Recent Activity**:
- Latest clicks
- Latest conversions
- Latest payouts

**Top Performing**:
- Best converting content
- Highest revenue sources
- Most active partners (if admin)

### 2. Custom Reports

Navigate to **Reports** to generate:

**Partner Performance Report**
- Total conversions per partner
- Average order value per partner
- Conversion rate by partner
- Lifetime value per partner

**Revenue Report**
- Revenue by month
- Revenue by partner
- Revenue by traffic source
- Growth trends

**Payout Report**
- Total payouts by month
- Total payouts by partner
- Average payout amount
- Payout status (pending, approved, paid)

---

## Advanced Configuration

### 1. Webhook Setup

Navigate to **Settings** → **Webhooks**

Configure webhooks to receive notifications when:
- New partner signs up
- New conversion is made
- Payout is processed
- Refund occurs

**Webhook URL**: `https://your-domain.com/api/webhooks/tolt`

**Events to subscribe to**:
- `partner.created`
- `conversion.created`
- `conversion.approved`
- `payout.created`
- `refund.created`

### 2. Custom Partner Portal (Future)

If you outgrow Tolt's partner dashboard, you can build your own:

```typescript
// Fetch partner data via Tolt API
const response = await fetch('https://api.tolt.io/v1/partners/me', {
  headers: {
    'Authorization': `Bearer ${partnerToken}`,
  },
});

const data = await response.json();
// Display in your custom dashboard
```

**When to consider custom portal**:
- 100+ active partners
- Need custom branding
- Want to integrate with your own analytics
- Need advanced features (tiered commissions, bonuses, contests)

### 3. Fraud Detection

Navigate to **Settings** → **Fraud Detection**

Enable:
- ✅ Duplicate IP detection
- ✅ Suspicious referral pattern detection
- ✅ Cookie stuffing detection
- ✅ Self-referral detection

**Actions**:
- Flag suspicious conversions for manual review
- Auto-reject obvious fraud attempts
- Notify partner of flagged activity

---

## Mobile App Affiliate Tracking

Since our mobile app doesn't use Tolt's JavaScript tracking, we handle it manually:

### How It Works

1. **User enters affiliate code in app**
   - Code stored in user's profile: `profiles.affiliate_code`
   - Timestamp recorded: `profiles.referred_at`

2. **User redeems team code**
   - App checks if user has `affiliate_code`
   - If yes, tracks that they're part of an affiliate-referred team

3. **Future purchase tracking** (To Implement)
   - When mobile user upgrades to premium or buys individual subscription
   - Backend sends conversion to Tolt:
   ```typescript
   POST https://api.tolt.io/v1/conversions
   {
     "referral_code": user.affiliate_code,
     "amount": purchase_amount,
     "customer_email": user.email,
     "external_id": subscription_id,
     "metadata": {
       "source": "mobile_app",
       "platform": "ios" // or "android"
     }
   }
   ```

---

## Testing Your Configuration

### 1. Test Partner Account

Create a test partner:
1. Go to **Partners** → **Create Partner**
2. Name: "Test Coach"
3. Email: `test+partner@example.com`
4. Get referral code: e.g., `TESTCOACH`

### 2. Test Conversion

Manually create a test conversion:
1. Go to **Conversions** → **Create Conversion**
2. Partner: Test Coach
3. Amount: $1,284.00
4. Email: `test@example.com`
5. Date: Today
6. Status: Pending

### 3. Verify Dashboard

Check that:
- ✅ Conversion appears in dashboard
- ✅ Commission calculated correctly ($128.40)
- ✅ Hold period shows 60 days
- ✅ Approval date is 60 days from now
- ✅ Partner can see conversion in their dashboard

---

## Common Issues

### Issue: Conversions not appearing in Tolt

**Solutions**:
1. Check that Tolt script is loaded on site
2. Verify `TOLT_API_KEY` is correct in environment
3. Check webhook logs for errors
4. Verify referral code is being passed correctly
5. Test Tolt API directly with curl:
   ```bash
   curl -X POST https://api.tolt.io/v1/conversions \
     -H "Authorization: Bearer tolt_sk_xxx" \
     -H "Content-Type: application/json" \
     -d '{
       "referral_code": "TEST",
       "amount": 100.00,
       "customer_email": "test@example.com",
       "external_id": "test_123"
     }'
   ```

### Issue: Partners not receiving emails

**Solutions**:
1. Check email settings in Tolt dashboard
2. Verify partner email addresses are correct
3. Check spam folders
4. Test email templates in Tolt dashboard
5. Configure custom email domain (reduces spam issues)

### Issue: Payouts not processing

**Solutions**:
1. Verify PayPal emails are correct
2. Check that minimum threshold ($50) is met
3. Ensure hold period (60 days) has passed
4. Check Tolt payout logs for errors
5. Contact Tolt support if issues persist

---

## Optimization Tips

### 1. Increase Conversion Rate

- ✅ Provide high-quality marketing assets
- ✅ Create email templates that convert
- ✅ Share success stories from top partners
- ✅ Offer bonuses for first 5 conversions
- ✅ Run seasonal campaigns (back-to-school, pre-season)

### 2. Recruit Better Partners

- ✅ Target coaches with existing audiences
- ✅ Partner with youth sports organizations
- ✅ Recruit tournament organizers
- ✅ Target baseball/softball training facilities
- ✅ Partner with sports psychologists and trainers

### 3. Retain Top Partners

- ✅ Increase commission for high performers
- ✅ Feature top partners on your website
- ✅ Provide priority support
- ✅ Offer exclusive training or webinars
- ✅ Create partner community (Slack, Discord)

### 4. Scale the Program

- ✅ Build automated partner onboarding
- ✅ Create self-serve resource library
- ✅ Implement tiered commissions
- ✅ Launch partner contests and challenges
- ✅ Develop partner success metrics
- ✅ Hire partner manager when you hit 50+ partners

---

## Next Steps

After configuring Tolt:

1. ✅ Complete all settings above
2. ✅ Create test partner and conversion
3. ✅ Review and send welcome emails
4. ✅ Test full conversion flow (see PARTNER_PROGRAM_TEST_PLAN.md)
5. ✅ Recruit your first 5 partners (friends, network)
6. ✅ Gather feedback and iterate
7. ✅ Scale partner recruitment
8. ✅ Track ROI and optimize

---

## Support Resources

- **Tolt Documentation**: https://docs.tolt.io
- **Tolt Support**: support@tolt.io
- **Tolt Community**: https://community.tolt.io
- **Status Page**: https://status.tolt.io

For Mind and Muscle specific questions:
- **Partner Support**: partners@mindandmuscle.com
- **Technical Issues**: dev@mindandmuscle.com

---

**Last Updated**: January 10, 2025
**Version**: 1.0
**Owner**: Development Team
