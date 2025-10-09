# Partner Program End-to-End Test Plan

This document outlines the testing procedures for the Mind and Muscle partner/affiliate program integration with Tolt.

## Prerequisites

Before testing, ensure you have:

- [ ] Tolt partner program configured at [app.tolt.io](https://app.tolt.io)
- [ ] `TOLT_API_KEY` environment variable set in production
- [ ] Stripe webhook endpoint configured to receive events
- [ ] Supabase migration for affiliate tracking applied
- [ ] Mobile app updated with affiliate code field
- [ ] Test partner account created in Tolt

## Test Environment Setup

### 1. Stripe Test Mode Configuration

```bash
# Use Stripe test mode keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Configure Stripe webhook to point to your test environment
# Webhook URL: https://your-domain.com/api/webhooks/stripe
# Events to listen for:
# - checkout.session.completed
# - invoice.payment_succeeded
# - invoice.payment_failed
# - customer.subscription.deleted
```

### 2. Tolt Test Partner Setup

1. Log into [app.tolt.io](https://app.tolt.io)
2. Create a test partner account (or use your own)
3. Get the test partner's referral code (e.g., `TESTCOACH123`)
4. Note the referral link format: `https://mindandmuscle.com/team-licensing?ref=TESTCOACH123`

## Test Scenarios

---

## Test 1: Website Conversion (New Purchase)

**Objective**: Verify that Tolt gets notified when a customer purchases through a partner link.

### Steps:

1. **Click Partner Link**
   ```
   https://mindandmuscle.com/team-licensing?ref=TESTCOACH123
   ```
   - Open link in incognito/private browser window
   - Verify Tolt cookie is set (check browser DevTools > Application > Cookies)
   - Cookie name should be: `tolt_referral`
   - Cookie value should be: `TESTCOACH123`

2. **Complete Checkout**
   - Click "Get Started" button
   - Select seat count (12+ for testing)
   - Fill out checkout form with test email: `test+partner@example.com`
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
   - Complete purchase

3. **Verify Stripe Webhook Received**
   - Check server logs for: `"Checkout session completed: cs_test_..."`
   - Verify team created in Supabase `teams` table
   - Check `metadata` field contains `tolt_referral: "TESTCOACH123"`

4. **Verify Tolt Notification**
   - Check server logs for: `"Tolt conversion notification sent for: TESTCOACH123"`
   - Response should show: `{ success: true, message: 'Conversion recorded in Tolt' }`

5. **Verify in Tolt Dashboard**
   - Log into Tolt dashboard
   - Navigate to "Conversions" or "Sales"
   - Verify new conversion appears:
     - Referral code: `TESTCOACH123`
     - Amount: Correct total (e.g., $1285.20 for 12 seats)
     - Customer email: `test+partner@example.com`
     - Status: Pending (60-day hold)

6. **Verify Email Sent**
   - Check email inbox for `test+partner@example.com`
   - Should receive "Your Team License is Active!" email
   - Email should contain 8-character team join code
   - Verify team code is valid in database

### Expected Results:
✅ Tolt cookie set correctly
✅ Stripe webhook received
✅ Team created in Supabase with `tolt_referral` in metadata
✅ Tolt API called successfully
✅ Conversion appears in Tolt dashboard
✅ Team code email delivered

---

## Test 2: Mobile App Registration with Affiliate Code

**Objective**: Verify that mobile app users can enter affiliate codes and they're stored correctly.

### Steps:

1. **Start Registration in Mobile App**
   - Open Mind and Muscle mobile app
   - Navigate to registration screen
   - Fill out all required fields (name, email, password, role, birthday)

2. **Enter Affiliate Code**
   - Scroll to "Partner Referral Code (Optional)" field
   - Enter test code: `TESTCOACH123`
   - Complete registration

3. **Verify in Supabase**
   ```sql
   -- Query profiles table
   SELECT
     id,
     email,
     affiliate_code,
     referred_at,
     created_at
   FROM profiles
   WHERE email = 'test+mobile@example.com';
   ```
   - `affiliate_code` should be: `TESTCOACH123`
   - `referred_at` should be a recent timestamp
   - Both fields should be indexed

4. **Verify User Auth Metadata**
   ```sql
   -- Query auth.users table
   SELECT
     id,
     email,
     raw_user_meta_data
   FROM auth.users
   WHERE email = 'test+mobile@example.com';
   ```
   - `raw_user_meta_data` should contain: `"affiliate_code": "TESTCOACH123"`

### Expected Results:
✅ Affiliate code field visible in registration UI
✅ Code saved in `profiles.affiliate_code`
✅ Timestamp saved in `profiles.referred_at`
✅ Code also saved in user metadata
✅ No errors during registration

---

## Test 3: Subscription Renewal (Recurring Commission)

**Objective**: Verify that Tolt gets notified when a subscription renews annually.

### Steps:

1. **Create Test Subscription**
   - Follow Test 1 to create a subscription through a partner link
   - Wait for subscription to be created in Stripe
   - Note the subscription ID (starts with `sub_`)

2. **Trigger Test Renewal**

   **Option A: Use Stripe Test Clock** (Recommended)
   ```bash
   # Create a test clock in Stripe Dashboard
   # Set date to 1 year + 1 day in the future
   # This will trigger invoice.payment_succeeded event
   ```

   **Option B: Manually Create Invoice** (Faster)
   ```bash
   # Use Stripe CLI to create an invoice
   stripe invoices create \
     --customer cus_test_xxx \
     --subscription sub_test_xxx

   # Then pay it
   stripe invoices pay inv_test_xxx
   ```

3. **Verify Renewal Webhook Received**
   - Check server logs for: `"Subscription payment succeeded: sub_test_..."`
   - Check logs for: `"Tolt renewal commission sent for: TESTCOACH123"`

4. **Verify Tolt Gets Notified**
   - Check server logs for successful Tolt API call
   - Verify `isRenewal: true` in the request payload
   - Response should show: `{ success: true }`

5. **Verify in Tolt Dashboard**
   - Log into Tolt dashboard
   - Check for new conversion with same referral code
   - Verify amount matches annual subscription price
   - Metadata should show: `is_renewal: true`

6. **Verify Team Status Updated**
   ```sql
   SELECT
     id,
     name,
     license_status,
     updated_at,
     metadata
   FROM teams
   WHERE stripe_subscription_id = 'sub_test_xxx';
   ```
   - `license_status` should be: `active`
   - `updated_at` should be recent
   - `metadata.tolt_referral` should still be: `TESTCOACH123`

### Expected Results:
✅ Renewal invoice created successfully
✅ `invoice.payment_succeeded` webhook received
✅ Tolt API called with `isRenewal: true`
✅ Conversion appears in Tolt dashboard
✅ Team license status remains active
✅ Partner gets credited with recurring commission

---

## Test 4: Failed Payment Handling

**Objective**: Verify that failed payments update team status correctly and don't break webhook processing.

### Steps:

1. **Trigger Failed Payment**
   ```bash
   # Use Stripe test card that always fails
   # Card number: 4000 0000 0000 0341
   # Or simulate failure in Stripe Dashboard
   ```

2. **Verify Webhook Handling**
   - Check server logs for: `"Subscription payment failed: sub_test_..."`
   - Team status should update to: `inactive`

3. **Verify Team Status**
   ```sql
   SELECT license_status FROM teams WHERE stripe_subscription_id = 'sub_test_xxx';
   ```
   - Should return: `inactive`

4. **Verify Tolt NOT Notified**
   - Failed payments should NOT create Tolt conversions
   - Check logs to ensure no Tolt API call was made

### Expected Results:
✅ Failed payment webhook received
✅ Team status set to `inactive`
✅ No Tolt conversion created
✅ No errors in webhook processing

---

## Test 5: Subscription Cancellation

**Objective**: Verify that cancelled subscriptions are handled correctly.

### Steps:

1. **Cancel Subscription in Stripe**
   - Go to Stripe Dashboard > Subscriptions
   - Find test subscription
   - Click "Cancel subscription"

2. **Verify Webhook Received**
   - Check server logs for: `"Subscription deleted: sub_test_..."`
   - Team status should update to: `cancelled`

3. **Verify Team Status**
   ```sql
   SELECT license_status FROM teams WHERE stripe_subscription_id = 'sub_test_xxx';
   ```
   - Should return: `cancelled`

### Expected Results:
✅ Cancellation webhook received
✅ Team status set to `cancelled`
✅ No errors in webhook processing

---

## Test 6: Direct Purchase (No Affiliate)

**Objective**: Verify that purchases without affiliate attribution still work correctly.

### Steps:

1. **Direct Purchase** (No Partner Link)
   - Go to `https://mindandmuscle.com/team-licensing` (no `?ref=` parameter)
   - Complete checkout as normal
   - Use test email: `test+direct@example.com`

2. **Verify Stripe Webhook**
   - Team should be created successfully
   - `metadata` should NOT contain `tolt_referral`

3. **Verify Tolt NOT Notified**
   - Check server logs for: `"No referral code - skipping Tolt notification"`
   - Should see this message and webhook should complete successfully

4. **Verify Team Created**
   ```sql
   SELECT * FROM teams WHERE admin_email = 'test+direct@example.com';
   ```
   - Team should exist
   - `metadata` should not have `tolt_referral` field

### Expected Results:
✅ Checkout completes successfully
✅ Team created without tolt_referral
✅ Tolt notification skipped (logged)
✅ No errors in webhook processing
✅ Email still sent with team code

---

## Test 7: Cookie Attribution Window (90 Days)

**Objective**: Verify that Tolt cookie persists and attributes conversions within 90 days.

### Steps:

1. **Click Partner Link**
   - Open partner link: `https://mindandmuscle.com/team-licensing?ref=TESTCOACH123`
   - Verify cookie is set
   - Note cookie expiration (should be ~90 days from now)

2. **Browse Site Without Purchasing**
   - Navigate around the site
   - Close browser
   - Come back days later (or simulate with date change)

3. **Complete Purchase Later**
   - Return to site (without clicking partner link again)
   - Complete checkout
   - Cookie should still be present

4. **Verify Attribution**
   - Check Stripe session metadata for `tolt_referral`
   - Should still show: `TESTCOACH123`
   - Tolt should get notified

### Expected Results:
✅ Cookie persists across sessions
✅ Attribution works without clicking link again
✅ Partner gets credited even if purchase is days later

---

## Test 8: Multiple Partner Clicks

**Objective**: Verify that the most recent partner link is attributed (last-click attribution).

### Steps:

1. **Click First Partner Link**
   - Open: `https://mindandmuscle.com/team-licensing?ref=PARTNER_A`
   - Verify cookie is set to: `PARTNER_A`

2. **Click Second Partner Link**
   - Open: `https://mindandmuscle.com/team-licensing?ref=PARTNER_B`
   - Verify cookie is updated to: `PARTNER_B`

3. **Complete Purchase**
   - Checkout as normal

4. **Verify Attribution**
   - Check Stripe session metadata
   - Should show: `tolt_referral: "PARTNER_B"`
   - Only PARTNER_B should get credited in Tolt

### Expected Results:
✅ Last-click attribution works correctly
✅ Cookie updates with each partner link
✅ Only the most recent partner gets credited

---

## Test 9: Error Handling

**Objective**: Verify that Tolt API failures don't break Stripe webhook processing.

### Steps:

1. **Simulate Tolt API Failure**
   - Temporarily set invalid `TOLT_API_KEY` in environment
   - Or block outbound requests to `api.tolt.io`

2. **Complete Purchase**
   - Follow Test 1 steps
   - Purchase should still complete

3. **Verify Webhook Still Succeeds**
   - Check server logs for: `"Failed to notify Tolt:"`
   - Team should still be created in Supabase
   - Email should still be sent
   - Webhook should return 200 status

4. **Restore Tolt API**
   - Fix `TOLT_API_KEY` or unblock requests
   - Verify subsequent purchases work correctly

### Expected Results:
✅ Tolt failure logged but not thrown
✅ Stripe webhook completes successfully
✅ Team created and email sent regardless
✅ No customer-facing errors

---

## Test 10: Payout Simulation

**Objective**: Understand how partners track earnings and receive payouts.

### Steps:

1. **Check Tolt Dashboard**
   - Log into [app.tolt.io](https://app.tolt.io) as test partner
   - Navigate to "Earnings" or "Payouts"
   - Verify conversions appear with correct amounts

2. **Verify Hold Period**
   - New conversions should show status: "Pending"
   - Hold period: 60 days
   - After 60 days, status changes to: "Approved"

3. **Verify Payout Threshold**
   - Minimum payout: $50
   - Once approved earnings > $50, payout is triggered
   - Payouts sent monthly via PayPal

4. **Test Payout Settings**
   - In Tolt dashboard, configure PayPal email
   - Verify payout preferences are saved

### Expected Results:
✅ Conversions appear in partner dashboard
✅ 60-day hold period enforced
✅ $50 minimum threshold works correctly
✅ Monthly payout schedule configured
✅ PayPal integration works

---

## Regression Tests

After any code changes to the partner program integration, run these quick regression tests:

### Quick Smoke Test (10 minutes)

1. ✅ Click partner link → Verify cookie set
2. ✅ Complete checkout → Verify team created
3. ✅ Check logs → Verify Tolt notified
4. ✅ Check Tolt dashboard → Verify conversion appears
5. ✅ Check email → Verify team code received

### Full Regression Test (30 minutes)

Run all 10 test scenarios above.

---

## Monitoring and Alerts

### Production Monitoring

Set up alerts for:

1. **Tolt API Failures**
   ```javascript
   // Alert if Tolt API returns non-200 status
   if (!response.ok) {
     console.error('Tolt API error:', response.status);
     // Send alert to monitoring service (e.g., Sentry, LogRocket)
   }
   ```

2. **Missing Affiliate Codes**
   ```sql
   -- Alert if many sessions have no tolt_referral
   SELECT COUNT(*)
   FROM teams
   WHERE created_at > NOW() - INTERVAL '7 days'
   AND metadata->>'tolt_referral' IS NULL;
   ```

3. **Webhook Failures**
   ```bash
   # Monitor Stripe webhook delivery in Stripe Dashboard
   # Alert if webhook failure rate > 1%
   ```

### Key Metrics to Track

1. **Conversion Rate by Partner**
   - Clicks → Purchases
   - Track in Tolt dashboard

2. **Average Order Value**
   - Typical team size
   - Revenue per conversion

3. **Renewal Rate**
   - Percentage of subscriptions that renew
   - Lifetime value per partner referral

4. **Partner Performance**
   - Top performing partners
   - Best traffic sources
   - Most effective marketing channels

---

## Troubleshooting

### Issue: Tolt cookie not setting

**Solution**: Check that:
- Tolt script is loaded on the page: `<script src="https://cdn.tolt.io/tolt.js" data-tolt="pk_knKjzY4oMarf4aSoCo2PzzKz"></script>`
- Page URL contains `?ref=PARTNER_CODE` parameter
- Third-party cookies not blocked in browser

### Issue: Conversion not appearing in Tolt

**Solution**: Check that:
- `TOLT_API_KEY` is set correctly in environment
- Stripe webhook is being received
- `tolt_referral` is in session metadata
- Tolt API call succeeded (check logs)
- Referral code matches active partner in Tolt

### Issue: Renewal commission not tracked

**Solution**: Check that:
- `tolt_referral` is stored in team metadata during initial purchase
- `invoice.payment_succeeded` webhook is being received
- Tolt API call includes `isRenewal: true`
- Team license status updates to `active` after renewal

### Issue: Mobile affiliate code not saving

**Solution**: Check that:
- Supabase migration has been applied
- `profiles` table has `affiliate_code` and `referred_at` columns
- Flutter form controller is wired correctly
- `auth.signUp` includes affiliate code in `data` object
- Profile creation fallback includes affiliate code

---

## Rollback Plan

If issues arise in production:

1. **Disable Tolt Notifications**
   ```typescript
   // In /api/webhooks/stripe/route.ts
   // Comment out Tolt API calls temporarily
   // const toltReferral = session.metadata?.tolt_referral;
   // if (toltReferral) {
   //   // ... Tolt API call
   // }
   ```

2. **Revert Stripe Webhook Changes**
   ```bash
   git revert <commit-hash>
   git push
   ```

3. **Revert Mobile App Changes**
   - Remove affiliate code field from UI
   - Remove controller and logic
   - Revert Supabase migration if needed

4. **Notify Partners**
   - Email partners about temporary issues
   - Provide ETA for resolution
   - Manually track conversions if needed

---

## Success Criteria

The partner program integration is successful when:

✅ Partners can share referral links and track clicks
✅ Conversions are automatically tracked in Tolt
✅ Partners receive 10% commission on initial sale
✅ Partners receive 10% commission on annual renewals
✅ Mobile app users can enter affiliate codes
✅ 60-day hold period is enforced
✅ $50 minimum payout threshold works
✅ Monthly PayPal payouts are processed
✅ System handles errors gracefully
✅ No impact on non-affiliate purchases

---

## Post-Launch Checklist

After launching to production:

- [ ] Monitor Tolt dashboard for first conversions
- [ ] Verify first payout processes correctly (after 60+ days)
- [ ] Collect partner feedback on dashboard usability
- [ ] Track average conversion rates
- [ ] Measure partner program ROI
- [ ] Iterate on marketing assets based on performance
- [ ] Consider expanding partner benefits if successful
- [ ] Document lessons learned

---

## Notes

- All tests should be performed in Stripe **test mode** first
- Use test email addresses (e.g., `test+scenario@example.com`)
- Keep test data separate from production
- Document any issues discovered during testing
- Update this test plan as new features are added

---

## Useful Resources

- **Tolt Documentation**: https://docs.tolt.io
- **Stripe Testing**: https://stripe.com/docs/testing
- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Partner Resources Page**: https://mindandmuscle.com/partner-resources

---

**Last Updated**: January 10, 2025
**Version**: 1.0
**Owner**: Development Team
