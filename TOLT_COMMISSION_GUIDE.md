# Tolt Partner Commission Payment Guide

## Overview

This guide explains how partner commissions work through Tolt's affiliate program integrated with Stripe for Mind & Muscle team licensing.

---

## How Conversions Track

### Automatic Tracking via Stripe Integration

Since Stripe is connected to Tolt, conversions track automatically:

1. **Partner shares referral link**: `https://mindandmuscle.ai/?ref=rain`
2. **User clicks link**: Tolt's tracking script loads and captures referral
3. **User purchases**: Referral data included in Stripe metadata
4. **Tolt receives webhook**: Stripe automatically sends transaction to Tolt
5. **Commission credited**: Partner gets credited in Tolt dashboard

**No manual API calls required** - it all happens automatically via Stripe webhook integration.

### What Gets Tracked

- ✅ New subscription purchases
- ✅ Subscription renewals (recurring commissions)
- ✅ Lifetime 10% commission on all payments

---

## Payment Timing: NET-60

### Current Configuration

We use **NET-60** payout terms to protect against chargebacks.

### How It Works

```
Example Timeline:
- November 15: Partner earns commission from sale
- November 30: Month ends
- January 30: Payout becomes available (60 days after month end)
```

### Why NET-60?

- Protects against subscription cancellations within trial period
- Ensures payment has cleared before paying commission
- Industry standard for SaaS affiliate programs

---

## Payment Methods

### For Partners (Affiliates)

Partners choose their preferred payout method in their Tolt profile:

- **PayPal**: Direct to PayPal account
- **Wise**: International transfers
- **Bank Transfer**: ACH, wire, etc.
- **Crypto**: Manual payouts only

**Partner Action Required**: They must set up their chosen payment method in their Tolt partner profile.

### For Business (You)

You have **complete flexibility** with manual payouts:

#### Option 1: Wire from Your Bank (Recommended)
- No PayPal account needed
- Transfer directly from business bank account
- Use partner banking details from Tolt CSV export

#### Option 2: PayPal Mass Payments
- Requires business PayPal account
- Good for batch payments to multiple partners
- Export CSV from Tolt, import to PayPal

#### Option 3: Wise Batch Payment
- Lower fees for international partners
- Bulk payment processing
- Export CSV from Tolt, import to Wise

#### Option 4: Manual Individual Payments
- Pay each partner individually
- Any method you prefer
- Just mark as paid in Tolt after sending

---

## Manual Payout Process

### Step-by-Step Instructions

#### 1. Wait for Payout Period
- NET-60: 60 days after month end
- Check Tolt Dashboard → Payouts section
- Commissions move from "Pending" to "Ready to Pay"

#### 2. Export Payment Data
```
Tolt Dashboard → Payouts → Export CSV
```
CSV includes:
- Partner name
- Email
- Payment method details
- Amount owed
- Commission breakdown

#### 3. Process Payments
Choose your method:

**Wire Transfer:**
1. Log into your bank's online banking
2. Use partner's bank details from CSV
3. Send payment with reference: "Tolt Commission - [Month]"

**PayPal Mass Payments:**
1. Log into PayPal Business account
2. Go to Mass Payments
3. Upload Tolt CSV or enter manually
4. Review and send

**Wise Batch Payment:**
1. Log into Wise Business account
2. Create batch payment
3. Upload Tolt CSV
4. Confirm and send

#### 4. Mark as Paid in Tolt
```
Tolt Dashboard → Payouts → Mark as Paid
```
- Updates partner's record
- Keeps accurate payment history
- Generates invoices for partners

---

## Tax Requirements

### Overview

Tax requirements depend on your Tolt plan:

| Plan Type | Tax Handling | Your Responsibility |
|-----------|--------------|---------------------|
| **Auto Payouts** (Growth/Pro - $99+/mo) | Tolt handles everything | None - fully automated |
| **Manual Payouts** (Basic - $49/mo) | You handle | Collect W-9s/W-8s, File 1099s |

---

### Manual Payouts: Tax Compliance Checklist

#### For US-Based Partners (like Rain)

**Before Paying $600+ per year:**

1. **Collect W-9 Form**
   - Request from partner via email
   - Template: "Hi [Name], for tax reporting I need you to complete a W-9 form. You can download it here: https://www.irs.gov/pub/irs-pdf/fw9.pdf"
   - Store securely (required for 7 years by IRS)

2. **Track Total Payments**
   - Keep running total of commissions paid per partner
   - $600+ threshold triggers 1099 requirement
   - Include in your accounting system

**By January 31st Each Year:**

3. **File 1099-NEC Forms**
   - For each US partner paid $600+ in previous year
   - File with IRS and send copy to partner

   **Filing Options:**
   - Use Tax1099.com (online filing service)
   - Use your accountant/CPA
   - File directly via IRS FIRE system

   **Required Information (from W-9):**
   - Partner's legal name
   - SSN or EIN
   - Address
   - Total amount paid

4. **Send 1099 Copy to Partner**
   - Mail or email by January 31st
   - Keep proof of delivery

#### For International Partners

**Before Paying Any Amount:**

1. **Collect W-8BEN Form**
   - Download: https://www.irs.gov/pub/irs-pdf/fw8ben.pdf
   - Required to avoid tax withholding
   - Store securely

2. **No 1099 Required**
   - International partners don't receive 1099s
   - W-8BEN proves foreign status
   - May need to file Form 1042-S if withholding applied

---

### Auto Payouts: What Tolt Handles

If you upgrade to **Growth or Pro plan** ($99+/mo):

✅ **Tolt Automatically:**
- Collects W-9s from US partners
- Collects W-8s from international partners
- Files 1099-NEC forms by January 31st
- Sends copies to partners
- Handles all IRS reporting
- Manages invoicing

💡 **Recommendation**: If you'll have 3+ partners, auto payouts save significant administrative time and ensure tax compliance.

---

## Partner Setup Guide

### For Partners to Receive Payments

Send this checklist to each partner:

**Partner Onboarding Steps:**

1. **Accept Partner Invitation**
   - Click link in Tolt invitation email
   - Create partner account

2. **Complete Profile**
   - Add payment method details:
     - PayPal email, or
     - Bank account info, or
     - Wise details
   - Set preferred payout method

3. **Complete Tax Forms**
   - **US Partners**: Complete W-9 in Tolt (auto payouts) or send to you (manual)
   - **International**: Complete W-8BEN

4. **Share Referral Link**
   - Get unique link from Tolt dashboard
   - Format: `https://mindandmuscle.ai/?ref=[partner-slug]`
   - Share on social media, website, email

5. **Track Performance**
   - Log into Tolt partner dashboard
   - View clicks, conversions, commissions
   - See payout history

---

## Business Owner Checklist

### Initial Setup (One-Time)

- [x] Connect Stripe to Tolt ✓ (Already done)
- [x] Set payout terms to NET-60 ✓ (Already done)
- [ ] Choose plan: Manual Payouts ($49/mo) or Auto Payouts ($99+/mo)
- [ ] Set up business payment method (bank, PayPal, or Wise)
- [ ] Create partner invitation template
- [ ] Set up accounting category for affiliate commissions

### Monthly Tasks (Manual Payouts)

**After NET-60 Period:**

- [ ] Log into Tolt Dashboard
- [ ] Check Payouts → Ready to Pay
- [ ] Export CSV with payment details
- [ ] Process payments via chosen method
- [ ] Mark payments as paid in Tolt
- [ ] Save payment confirmations for records

### Annual Tasks (Manual Payouts)

**By January 31st:**

- [ ] Review total payments to each US partner
- [ ] Identify partners paid $600+ in previous year
- [ ] Verify you have W-9 on file for each
- [ ] File 1099-NEC forms with IRS
- [ ] Send 1099 copies to partners
- [ ] Store copies for 7 years

**Throughout Year:**

- [ ] Request W-9/W-8 from new partners before first payment
- [ ] Track running total of payments per partner
- [ ] Keep payment confirmations organized
- [ ] Update spreadsheet with commission payments

---

## Partner Commission Structure

### Current Settings

- **Commission Rate**: 10% lifetime
- **Commission Type**: Recurring (includes renewals)
- **Cookie Duration**: Session-based + persistent tracking
- **Payout Terms**: NET-60

### What Partners Earn

**Example with 5-seat team license ($180/6 months):**

- Initial Purchase: Partner earns $18.00
- Renewal (6 months later): Partner earns $18.00
- Every renewal: Partner continues earning 10%

**Lifetime value example:**
- Team stays subscribed for 3 years (6 renewals)
- Partner earns: $18 × 7 = $126 from one referral

---

## Troubleshooting

### Conversion Not Tracking

**Check:**
1. Partner used correct referral link format: `?ref=[slug]`
2. Tolt script loaded on page (check browser console)
3. `tolt_referral` included in Stripe metadata
4. Review Tolt dashboard → Conversions

**Common Issues:**
- Ad blockers blocking Tolt script
- Browser privacy settings
- Referral parameter lost during navigation (fixed with sessionStorage)

### Payment Delays

**Remember:**
- NET-60 means 60 days AFTER month ends
- Example: November 1 sale → Payout available January 30
- Commission must exceed minimum threshold (check Tolt settings)

### Missing W-9 Forms

**Email Template:**
```
Subject: Tax Form Required for Affiliate Payments

Hi [Name],

To process your affiliate commission payments and stay compliant with IRS
requirements, I need you to complete a W-9 form.

Please:
1. Download: https://www.irs.gov/pub/irs-pdf/fw9.pdf
2. Complete all fields
3. Sign and date
4. Reply with completed PDF

This is required for any US-based partners before we can process payments.

Thanks!
```

---

## Quick Reference

### Important Links

- **Tolt Dashboard**: https://app.tolt.com
- **W-9 Form**: https://www.irs.gov/pub/irs-pdf/fw9.pdf
- **W-8BEN Form**: https://www.irs.gov/pub/irs-pdf/fw8ben.pdf
- **IRS 1099-NEC Instructions**: https://www.irs.gov/forms-pubs/about-form-1099-nec
- **Tax1099 Filing Service**: https://www.tax1099.com

### Support Contacts

- **Tolt Support**: Live chat in dashboard
- **Tax Questions**: Consult your CPA/accountant
- **Payment Issues**: Check Tolt Help Center

---

## Document Updates

**Last Updated**: January 2025
**Version**: 1.0

**Changes:**
- Initial documentation of Tolt commission payment process
- Removed manual API integration (using automatic Stripe integration)
- Added comprehensive tax compliance guide
