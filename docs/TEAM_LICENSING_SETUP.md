# Team Licensing Setup Guide

This document explains how to configure Stripe products and Tolt commission tiers for the Mind & Muscle team licensing system.

## Overview

**Pricing Tiers:**
- 1-11 users: $119/seat/year (0% discount)
- 12-120 users: $107.10/seat/year (10% discount)
- 121-199 users: $101.15/seat/year (15% discount)
- 200+ users: $95.20/seat/year (20% discount)

**Commission Structure:**
- Base: 10% commission for all referred users
- Tier 2: 15% commission for partners who exceed 100 total users

---

## Part 1: Stripe Product Configuration

### Creating the 1-11 User Pricing Tier

The checkout API (`/api/create-checkout-session`) dynamically creates Stripe prices during checkout, so you **don't need to pre-create products** for each tier. However, for organization and reporting, you may want to create a base product.

#### Option A: Let API Handle Everything (Recommended)

The current implementation creates prices dynamically at checkout time. The API will automatically:
1. Create a price with the correct `unit_amount` ($119 for 1-11 users)
2. Set `recurring: { interval: 'year' }`
3. Attach metadata: `seat_count`, `discount_percentage`, `price_per_seat`, `team_code`, `tolt_referral`

**No action needed** - the API handles this automatically.

#### Option B: Pre-Create Base Product (Optional)

If you want to view all team licenses under one product in Stripe Dashboard:

1. **Go to Stripe Dashboard** → Products → Create Product
2. **Product Name:** Mind and Muscle Team License
3. **Description:** Annual team license with AI-powered training, advanced analytics, and personalized coaching
4. **Pricing:**
   - Model: Recurring
   - Billing period: Yearly
   - Price: Leave flexible (API creates dynamic prices per checkout)
5. **Metadata:** Add for tracking
   ```
   pricing_tier: flexible
   base_price: 119
   min_seats: 1
   max_seats: 1000
   ```
6. **Images:** Add logo: `https://mindandmuscle.ai/assets/images/logo.png`

### Current Implementation

The checkout API (lines 110-172) creates checkout sessions with:

```typescript
stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: `Mind and Muscle Team License (${discountPercentage}% discount)`,
        description: `Annual team license for ${seatCount} seats at $${pricePerSeat.toFixed(2)}/seat`,
        images: ['https://mindandmuscle.ai/assets/images/logo.png'],
      },
      unit_amount: Math.round(pricePerSeat * 100),
      recurring: { interval: 'year' },
    },
    quantity: seatCount,
  }],
  metadata: {
    seat_count: seatCount.toString(),
    discount_percentage: discountPercentage.toString(),
    price_per_seat: pricePerSeat.toString(),
    team_code: teamCode,
    tolt_referral: toltReferral, // If referred by partner
  },
  subscription_data: {
    metadata: { /* same as above */ }
  }
})
```

### Stripe Webhook Requirements

Ensure your Stripe webhook is configured to listen for:
- `checkout.session.completed` - To process successful purchases
- `customer.subscription.created` - To track new subscriptions
- `customer.subscription.updated` - To track seat changes
- `customer.subscription.deleted` - To handle cancellations

The webhook should:
1. Extract `team_code` from metadata
2. Store team license in your database (Supabase `team_licenses` table)
3. If `tolt_referral` exists, notify Tolt of the conversion via API

---

## Part 2: Tolt Tiered Commission Configuration

### How Tolt Tiered Commissions Work

Tolt supports **customer count-based tiered commissions** through their "Commission Flows" system. This allows you to automatically increase commission rates as partners acquire more customers.

### Setting Up Tiered Commissions

#### Access Tolt Dashboard

1. Log into Tolt at https://app.tolt.io
2. Navigate to your **Mind & Muscle** program
3. Go to **Settings** → **Commissions** → **Flows**

#### Create Flow 1: Base 10% Commission (All Users)

1. **Click "Create Flow"**
2. **Flow Name:** Base Commission - All Users
3. **Commission Rate:** 10%
4. **Conditions:**
   - Partner: No specific conditions (applies to all partners)
   - Customer: No specific conditions
   - Transaction: Status = Paid
5. **Priority:** 1 (lowest - this is the fallback)
6. **Status:** Active

#### Create Flow 2: Enhanced 15% Commission (100+ Users)

1. **Click "Create Flow"**
2. **Flow Name:** Enhanced Commission - High Volume Partners
3. **Commission Rate:** 15%
4. **Conditions:**
   - Partner → Number of customers → Greater than or equal to → 100
   - Transaction: Status = Paid
5. **Priority:** 10 (higher priority than base flow)
6. **Status:** Active

### How It Works

- **Condition Logic:** When a partner reaches 100+ referred customers, Tolt automatically switches them to the 15% flow
- **Priority System:** Higher priority flows (15%) override lower priority flows (10%) when conditions are met
- **Automatic Application:** Partners don't need to do anything - the upgrade happens automatically
- **Applies to ALL Users:** When a partner hits 100+ users, the 15% rate applies to all their future referrals

### Important Notes

1. **Retroactive vs. Prospective:**
   - Tolt applies the commission rate that was active when the transaction occurred
   - If you want 15% to apply retroactively to all 100+ existing users, you'll need to create a manual adjustment
   - Recommended: 15% applies prospectively (to new users after hitting the 100-user milestone)

2. **Commission on Renewals:**
   - If a partner has 150 users and they all renew, the partner earns 15% on those renewals
   - Set this via Flow settings: Enable "Recurring commission on renewals"

3. **Tracking Partner Performance:**
   - View partner customer counts in Tolt Dashboard → Partners → [Partner Name] → Customers
   - Export reports: Dashboard → Reports → Commission Report

4. **Testing:**
   - Use Tolt's test mode to verify commission flow logic before going live
   - Manually adjust partner customer counts in test mode to simulate reaching 100+ users

### Alternative: Per-Partner Custom Rates

If you want to manually promote specific partners to 15% (instead of automatic at 100+ users):

1. Go to **Partners** → Select partner → **Edit**
2. Click **Custom Commission Rate**
3. Set to 15%
4. Save

This overrides all flows for that specific partner.

---

## Part 3: Backend Integration

### Tracking Tolt Referrals

The checkout API already captures `toltReferral` parameter:

```typescript
// From validation schema (src/lib/validation.ts)
export const checkoutSessionSchema = z.object({
  seatCount: seatCountSchema,
  email: emailSchema,
  testMode: z.boolean().optional(),
  toltReferral: z.string().max(100).trim().optional(), // Partner code from Tolt
});
```

When a user comes from a Tolt partner link, the referral code is:
1. Captured in checkout session metadata
2. Passed to Stripe subscription metadata
3. Used to attribute the sale to the partner in Tolt

### Notifying Tolt of Conversions

Tolt automatically tracks conversions when:
1. User clicks partner's referral link (cookie/tracking set)
2. User completes Stripe checkout
3. Stripe webhook fires to your backend
4. Your backend processes the webhook (or Tolt's Stripe integration detects it)

**No additional API calls needed** if you have Tolt's Stripe integration enabled.

If you're doing manual tracking:

```typescript
// POST to Tolt API to record conversion
const response = await fetch('https://api.tolt.com/v1/transactions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.TOLT_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    partner_code: toltReferral,
    customer_email: email,
    transaction_amount: totalAmount / 100, // Convert cents to dollars
    transaction_id: stripeSessionId,
    program_id: 'prg_XZjuxmy3JkyE9oTFKEFDbcLD',
  }),
});
```

### Environment Variables Required

Ensure these are set in your environment:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Tolt
TOLT_API_KEY=tolt_...  # From Tolt Dashboard → Settings → API
```

---

## Part 4: Testing the Implementation

### Test 1-11 User Purchases

1. Go to https://mindandmuscle.ai/team-licensing
2. Select 1 seat (minimum)
3. Verify price shows $119/seat
4. Click "Get Started"
5. Complete checkout in test mode (`?test=true`)
6. Verify Stripe checkout shows correct pricing

### Test Tiered Commissions in Tolt

1. Create a test partner account in Tolt
2. Generate their referral link
3. Use that link to complete test checkouts
4. Verify commission shows as 10% in Tolt Dashboard
5. Manually adjust partner's customer count to 100+ (in test mode)
6. Complete another test checkout
7. Verify commission now shows as 15%

### Verify Metadata

Check that Stripe subscriptions include:
- `team_code`: TEAM-XXXX-XXXX-XXXX
- `seat_count`: 1-1000
- `discount_percentage`: 0, 10, 15, or 20
- `price_per_seat`: 119.00, 107.10, 101.15, or 95.20
- `tolt_referral`: (partner code if applicable)

---

## Summary Checklist

### Backend (Completed ✅)

- [x] Updated validation schema to allow 1-11 seats (src/lib/validation.ts:48)
- [x] Added 1-11 user pricing logic to checkout API (route.ts:94-101)
- [x] Updated Team Licensing page UI to show 1-11 tier (page.tsx)
- [x] Team code generation for all tier sizes
- [x] Tolt referral tracking in metadata

### Stripe Setup (Optional)

- [ ] Create base "Team License" product in Stripe (optional - API creates prices dynamically)
- [ ] Configure webhook endpoints
- [ ] Test checkout flow for 1-11 users
- [ ] Verify subscription metadata includes all required fields

### Tolt Setup (Required)

- [ ] Log into Tolt Dashboard (https://app.tolt.io)
- [ ] Create Flow 1: 10% base commission for all partners
- [ ] Create Flow 2: 15% commission when partner.customer_count >= 100
- [ ] Set flow priorities (15% tier = higher priority)
- [ ] Enable recurring commissions on renewals
- [ ] Test with sample partner account
- [ ] Verify automatic tier upgrade at 100+ users

### Documentation

- [x] Document Stripe product setup (this file)
- [x] Document Tolt commission flow configuration (this file)
- [x] Document backend integration points (this file)

---

## Support Resources

- **Stripe Dashboard:** https://dashboard.stripe.com/subscriptions
- **Tolt Dashboard:** https://app.tolt.io
- **Tolt Help Center:** https://help.tolt.io/en/collections/3809121-programs
- **Tolt API Docs:** https://docs.tolt.com/introduction
- **Specific Article:** "How to set up tiered commission rates by customer count" (in Tolt Help Center)

---

## Contact

If you encounter issues:
- Stripe Support: https://support.stripe.com
- Tolt Support: support@tolt.io or live chat in dashboard
