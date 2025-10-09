# Partner Program - End-to-End Test Plan

## Overview
This document outlines how to test the complete partner onboarding flow from application to first commission.

---

## ✅ What's Been Automated

1. **Partner Creation**: When someone applies, they're automatically created in Tolt
2. **Welcome Email**: New partners receive a branded welcome email with resources link
3. **Notification Email**: You receive an internal notification with applicant details
4. **Resources Page**: Partners can access https://mindandmuscle.com/partner-resources

---

## 🧪 Test 1: Partner Application Flow

### Steps to Test:

1. **Navigate to Partner Program Page**
   - Go to: http://localhost:3000/partner-program
   - OR: https://mindandmuscle.com/partner-program (production)

2. **Fill Out Application Form**
   - Name: Test Partner (use your own email for testing)
   - Email: your-email@example.com
   - Organization: Test Sports Academy
   - Audience Size: 500-1000
   - Promotion Channel: Email + Social Media
   - Why Excited: Testing the automated flow
   - Submit form

3. **Expected Results:**

   ✅ **Immediate:**
   - Form shows success message
   - Console logs show partner creation

   ✅ **Within 1 minute:**
   - **Email 1 (to support@mindandmuscle.ai)**: Internal notification
     - Subject: "New Partner Application: Test Partner"
     - Contains applicant details
     - Shows "✅ Partner automatically created in Tolt!"

   - **Email 2 (to your-email@example.com)**: Partner welcome email
     - Subject: "Welcome to the Mind & Muscle Partner Program! 🎉"
     - Beautiful branded design with orange/blue gradient
     - Contains link to resources page
     - Lists commission structure and next steps

   - **Email 3 (from Tolt)**: Official Tolt onboarding
     - Subject: "Welcome to Mind & Muscle Partners" (or similar)
     - Contains unique partner referral link
     - Contains Tolt dashboard login info

4. **Verify in Tolt Dashboard:**
   - Login to https://app.tolt.io
   - Go to Partners section
   - Find "Test Partner" in the list
   - Check their metadata (organization, network size, etc.)

---

## 🧪 Test 2: Partner Resources Page

### Steps to Test:

1. **Navigate to Resources Page**
   - Click link in welcome email
   - OR go directly to: http://localhost:3000/partner-resources

2. **Verify Page Content:**

   ✅ **Hero Section:**
   - Orange "PARTNER RESOURCES" badge with glow
   - Large gradient heading: "Everything You Need To Succeed"
   - Three stat cards: 10%, Lifetime, 90 Days

   ✅ **Email Templates:**
   - Template 1: Warm Introduction (blue card)
   - Template 2: Feature Highlight (orange card)
   - Template 3: Seasonal Campaign (blue card)
   - All templates expand/collapse
   - Copy buttons work for subject and body

   ✅ **Social Media Copy:**
   - Instagram Post (orange card)
   - X Thread (blue card) - **Note: Changed from "Twitter"**
   - Facebook Post (orange card)
   - LinkedIn Post (blue card)
   - All copy buttons work

   ✅ **Pro Tips Section:**
   - 4 tip cards with icons
   - Alternating blue/orange styling

   ✅ **Support CTA:**
   - Orange card with glow
   - "Contact Partner Support" button
   - Links to partners@mindandmuscle.ai

3. **Test Copy Functionality:**
   - Click "Copy" button on any template
   - Button should change to "Copied!" with checkmark
   - After 2 seconds, reverts to "Copy"
   - Paste content to verify it copied correctly

---

## 🧪 Test 3: Partner Link Tracking

### Steps to Test:

1. **Get Partner Link from Tolt**
   - Check Tolt onboarding email
   - Should look like: https://mindandmuscle.com?ref=YOURCODE
   - OR: https://mind-and-muscle.tolt.io/YOURCODE

2. **Test Cookie Tracking:**
   - Open incognito/private window
   - Visit your partner link
   - Navigate around the site
   - Close window
   - Open new incognito window within 90 days
   - Make a purchase (use test mode if available)
   - Conversion should be attributed to your partner code

3. **Verify in Tolt Dashboard:**
   - Login to https://app.tolt.io
   - Check Conversions section
   - Look for test conversion
   - Verify commission calculated correctly (10%)

---

## 🧪 Test 4: Stripe Purchase → Tolt Conversion

### Prerequisites:
- This requires the Stripe webhook to be configured
- Webhook should call Tolt API when subscriptions are created

### Steps to Test:

1. **Make Test Purchase:**
   - Use partner referral link
   - Go to pricing page
   - Purchase team license (use Stripe test mode)
   - Use test card: 4242 4242 4242 4242

2. **Expected Flow:**
   - Stripe processes payment
   - Stripe webhook fires: `checkout.session.completed`
   - Your webhook handler extracts:
     - Customer email
     - Subscription amount
     - Partner referral code (from session metadata or cookie)
   - Webhook calls Tolt API:
     ```javascript
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

3. **Verify in Tolt:**
   - Check Conversions section
   - New conversion should appear
   - Status: "Pending" (60-day hold)
   - Commission: 10% of amount
   - Approval date: 60 days from now

4. **Verify Partner Email:**
   - Partner should receive conversion notification from Tolt
   - Subject: "You earned a commission! 🎉"
   - Shows amount and commission

---

## 🧪 Test 5: Mobile App Affiliate Tracking

### Prerequisites:
- Database columns added: `profiles.affiliate_code`, `profiles.referred_at`

### Steps to Test:

1. **Register via Mobile App:**
   - Open Mind & Muscle mobile app
   - Start registration
   - Enter affiliate code: TESTPARTNER
   - Complete registration

2. **Verify Database:**
   - Check Supabase dashboard
   - Find user in profiles table
   - Verify `affiliate_code` = "TESTPARTNER"
   - Verify `referred_at` has timestamp

3. **Future Implementation:**
   - When mobile user makes purchase
   - Backend should send conversion to Tolt
   - Include `affiliate_code` from their profile

---

## 📋 Complete Flow Checklist

### Initial Setup ✅
- [x] Tolt API key added to .env.local
- [x] Tolt dashboard configured (10% commission, 90-day cookie, $50 min)
- [x] Database migration applied (affiliate_code columns)
- [x] Partner resources page created with brand styling
- [x] Automated partner creation via API
- [x] Automated welcome email with resources link

### Testing Phase (Your Tasks)
- [ ] Test partner application form submission
- [ ] Verify 3 emails received (internal, welcome, Tolt onboarding)
- [ ] Verify partner created in Tolt dashboard
- [ ] Test partner resources page styling and functionality
- [ ] Test copy-to-clipboard on all templates
- [ ] Test partner link tracking (click through, make purchase)
- [ ] Verify conversion appears in Tolt dashboard
- [ ] Test mobile app affiliate code entry
- [ ] Verify affiliate_code saved in database

### Production Deployment
- [ ] Deploy partner-resources page to production
- [ ] Deploy updated API route to production
- [ ] Verify .env variables in production (TOLT_API_KEY)
- [ ] Test production partner form submission
- [ ] Verify production emails sending correctly

---

## 🐛 Troubleshooting

### Issue: Partner not created in Tolt
**Check:**
1. Is TOLT_API_KEY set in .env.local?
2. Check API route logs: `console.log` statements
3. Test Tolt API directly with curl:
   ```bash
   curl -X POST https://api.tolt.io/v1/affiliates \
     -H "Authorization: Bearer tlt_live_fDmwcD8akRBwhugD3QNo8hJ65c3wFSUhUhe3J" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "name": "Test Partner"
     }'
   ```

### Issue: Emails not sending
**Check:**
1. Is RESEND_API_KEY set in .env.local?
2. Check Resend dashboard for delivery logs
3. Check spam folders
4. Verify email domain (partners@mindandmuscle.ai) is verified in Resend

### Issue: Partner link not tracking
**Check:**
1. Is partner link correct format? (should have ?ref=CODE)
2. Check Tolt tracking script is loaded on all pages
3. Verify 90-day cookie window hasn't expired
4. Check Tolt dashboard → Settings → Tracking

### Issue: Conversions not appearing
**Check:**
1. Is Stripe webhook configured and working?
2. Check webhook logs in Stripe dashboard
3. Verify referral code is being passed from checkout to webhook
4. Test Tolt conversions API directly:
   ```bash
   curl -X POST https://api.tolt.io/v1/conversions \
     -H "Authorization: Bearer tlt_live_fDmwcD8akRBwhugD3QNo8hJ65c3wFSUhUhe3J" \
     -H "Content-Type: application/json" \
     -d '{
       "referral_code": "TESTCODE",
       "amount": 100.00,
       "customer_email": "test@example.com",
       "external_id": "test_123"
     }'
   ```

---

## 📧 Email Preview

### Welcome Email (Sent to Partner)

**From:** Mind & Muscle Partners <partners@mindandmuscle.ai>
**Subject:** Welcome to the Mind & Muscle Partner Program! 🎉

**Design:**
- Orange/blue gradient header with "Welcome to the Team!"
- White content card with shadow
- Orange section: Marketing Resources (with CTA button)
- Blue section: Commission Structure
- Green section: Next Steps
- Footer with branding

**Key CTAs:**
- "Access Your Resources →" button (links to /partner-resources)
- "marketing resources page" link (inline)
- "partners@mindandmuscle.ai" link (support)

---

## 🎯 Success Metrics

After testing, you should have:

1. ✅ Partners automatically created in Tolt without manual work
2. ✅ Partners receive beautiful welcome email with resources
3. ✅ Partners can access /partner-resources and copy templates
4. ✅ Partner links track clicks and conversions
5. ✅ Conversions appear in Tolt dashboard with correct commission
6. ✅ Mobile app users can enter affiliate codes
7. ✅ Complete partner flow takes <2 minutes from application to resources

---

## 🚀 Next Steps After Testing

1. **Recruit First Partners:**
   - Reach out to 5-10 coaches in your network
   - Send them partner program link
   - Monitor their applications and conversions

2. **Monitor & Optimize:**
   - Track conversion rates (applications → active promoters)
   - See which email templates perform best
   - Identify top-performing partners
   - Create case studies from successful partners

3. **Scale:**
   - Consider partner tiers (10% → 12% → 15% for top performers)
   - Create partner community (Slack or Discord)
   - Host monthly partner webinars
   - Develop seasonal campaigns (pre-season, back-to-school)
   - Build partner dashboard (if you outgrow Tolt)

---

## 📞 Support

**Technical Issues:**
- dev@mindandmuscle.ai
- Check logs in Vercel/hosting platform
- Check Tolt support docs: https://docs.tolt.io

**Partner Program Questions:**
- partners@mindandmuscle.ai

**Tolt Support:**
- support@tolt.io
- https://community.tolt.io

---

**Last Updated:** January 10, 2025
**Status:** ✅ Ready to test
**Version:** 1.0
