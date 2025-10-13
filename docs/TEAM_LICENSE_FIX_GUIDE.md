# Team License Fix Guide

## Overview

This guide documents the fix for team license webhook integration and provides steps to fix existing customer data.

## Problem Summary

The webhook code was attempting to write to columns that didn't exist in the `teams` table:
- `join_code` ❌ (doesn't exist)
- `license_type` ❌ (doesn't exist)
- `license_status` ❌ (should be `subscription_status`)
- `max_seats` ❌ (should be `license_seats_total`)
- `seats_used` ❌ (should be `license_seats_consumed`)
- `stripe_subscription_id` ❌ (didn't exist - now added)
- `stripe_customer_id` ❌ (didn't exist - now added)
- `admin_email` ❌ (didn't exist - now added)
- `metadata` ❌ (didn't exist - now added)

## Solution Implemented

**Hybrid Approach:**
- Basic team info + Stripe tracking → `teams` table
- Join codes → `team_join_codes` table
- Tables linked by `team_id`

## Steps to Complete Implementation

### Step 1: Apply Database Migration

```bash
# From project root
cd website
npx supabase db push

# OR manually apply via Supabase dashboard SQL editor
```

The migration adds these columns to `teams` table:
- `stripe_subscription_id` TEXT
- `stripe_customer_id` TEXT
- `admin_email` TEXT
- `metadata` JSONB

### Step 2: Fix Existing Customer Data

For customer with team code `TEAM-PKRM-L75S-6A29`:

```sql
-- Step 2a: Insert team record
INSERT INTO teams (
  name,
  stripe_subscription_id,
  stripe_customer_id,
  admin_email,
  license_seats_total,
  license_seats_consumed,
  is_premium,
  subscription_status,
  metadata,
  created_at,
  updated_at
) VALUES (
  'Team TEAM-PKRM-L75S-6A29',
  'sub_1SHnAg0JmaI4LyOVQGjrbHBZ',
  'cus_XXXXXXXX', -- Get from Stripe dashboard
  'jbb1988@hotmail.com',
  12,
  0,
  true,
  'active',
  '{"created_manually": true, "original_purchase_date": "2025-01-13"}'::jsonb,
  NOW(),
  NOW()
) RETURNING id;

-- Step 2b: Insert join code (use the team id from above)
INSERT INTO team_join_codes (
  code,
  team_id,
  max_uses,
  uses_count,
  is_active,
  tier,
  allow_parent_linking,
  created_at,
  updated_at
) VALUES (
  'TEAM-PKRM-L75S-6A29',
  'PASTE_TEAM_ID_HERE', -- From step 2a
  12,
  0,
  true,
  'team',
  true,
  NOW(),
  NOW()
);
```

**Get Stripe Customer ID:**
1. Go to Stripe Dashboard → Customers
2. Search for `jbb1988@hotmail.com`
3. Copy the customer ID (starts with `cus_`)

### Step 3: Send Customer Their Team Code

After data is inserted, send the customer their team code email manually or via:

```bash
# From website directory
curl -X POST http://localhost:3000/api/admin/send-team-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jbb1988@hotmail.com",
    "teamCode": "TEAM-PKRM-L75S-6A29",
    "seatCount": 12
  }'
```

**Or create a simple admin script:**

```typescript
// website/scripts/send-missing-team-code.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Mind and Muscle <noreply@send.updates.gg>',
  to: 'jbb1988@hotmail.com',
  subject: 'Your Team License Code - Mind and Muscle',
  html: `Your team code is: TEAM-PKRM-L75S-6A29`
});
```

### Step 4: Test Implementation

**Test webhook locally:**

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test webhook
stripe trigger checkout.session.completed
```

**Test admin lookup:**

```bash
curl -X POST http://localhost:3000/api/admin/lookup-teams \
  -H "Content-Type: application/json" \
  -d '{"email": "jbb1988@hotmail.com"}'
```

Should return:
```json
{
  "teams": [{
    "id": "...",
    "name": "Team TEAM-PKRM-L75S-6A29",
    "join_code": "TEAM-PKRM-L75S-6A29",
    "max_seats": 12,
    "seats_used": 0,
    "stripe_subscription_id": "sub_1SHnAg0JmaI4LyOVQGjrbHBZ",
    "subscription_status": "active"
  }]
}
```

## Future Webhook Requirements

### Before webhooks will work:

1. **Deploy website to mindandmuscle.ai**
   - Webhook URL: `https://mindandmuscle.ai/api/webhooks/stripe`
   - Currently points to domain that isn't live yet

2. **Verify webhook endpoint in Stripe**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Confirm endpoint: `https://mindandmuscle.ai/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`

3. **Test with Stripe test mode first**
   - Create test checkout
   - Verify team and join code created
   - Verify email sent
   - Check Supabase tables

## Database Schema Reference

### teams table (relevant columns)
```sql
- id: uuid (PK)
- name: text
- stripe_subscription_id: text (NEW)
- stripe_customer_id: text (NEW)
- admin_email: text (NEW)
- metadata: jsonb (NEW)
- license_seats_total: integer
- license_seats_consumed: integer
- is_premium: boolean
- subscription_status: text
```

### team_join_codes table
```sql
- id: uuid (PK)
- code: text (UNIQUE)
- team_id: uuid (FK → teams.id)
- max_uses: integer
- uses_count: integer
- is_active: boolean
- tier: text
- allow_parent_linking: boolean
```

## Files Modified

1. ✅ `supabase/migrations/20250113_add_stripe_columns_to_teams.sql`
2. ✅ `website/src/app/api/webhooks/stripe/route.ts`
3. ✅ `website/src/app/api/admin/lookup-teams/route.ts`

## Testing Checklist

- [ ] Apply migration to Supabase
- [ ] Insert existing customer data manually
- [ ] Verify data in Supabase dashboard
- [ ] Test admin lookup tool
- [ ] Send customer their team code email
- [ ] Deploy website to mindandmuscle.ai
- [ ] Test webhook with Stripe test mode
- [ ] Verify webhook creates both team and join code records
- [ ] Test webhook error handling (rollback on failure)
- [ ] Test renewal webhook (invoice.payment_succeeded)
- [ ] Test cancellation webhook (customer.subscription.deleted)

## Support Notes

### If customer reports not receiving email:

1. Check Supabase `teams` table for their email
2. Use admin lookup tool to find their team code
3. Manually send email using Resend API
4. Verify webhook executed successfully in Stripe dashboard

### If webhook fails in future:

1. Check Stripe webhook logs for error details
2. Verify all environment variables are set
3. Check Supabase logs for database errors
4. Manually insert data using SQL scripts above
5. Resend webhook from Stripe dashboard if needed
