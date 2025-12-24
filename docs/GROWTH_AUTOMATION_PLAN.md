# Growth Automation Plan
## Mind & Muscle - User Lifecycle & Retention System

*Last Updated: December 24, 2024*

---

## Executive Summary

This document outlines the plan to expand the existing B2B marketing automation system to include **user lifecycle campaigns** for retention, engagement, and partner program promotion.

---

## Part 1: Current Infrastructure (What We Have)

### Email Functions (14+ Edge Functions)

| Function | Purpose | Target |
|----------|---------|--------|
| `send-welcome-email` | Welcome new users | New signups |
| `send-trial-gift-email` | Notify trial grants | Trial users |
| `send-feature-spotlight-email` | Weekly feature promotion | Core & Pro users |
| `send-daily-hit-followup` | Follow-up after Daily Hit | Active users |
| `lab-drill-reminder` | Remind incomplete drills | Lab users |
| `send-streak-milestone-email` | Celebrate streaks | Engaged users |
| `send-weekly-report-notifications` | Weekly progress reports | All users |
| `send-winback-campaign` | Re-engage churned users | Dormant users |
| `send-campaign-email` | B2B outreach campaigns | Non-users (orgs) |
| `process-campaign-followups` | Auto follow-up sequences | Non-users (orgs) |

### Existing User Lifecycle Emails

1. **Welcome Email** - Sent on signup (trigger-based)
2. **Trial Gift Email** - Sent when admin grants trial
3. **Feature Spotlight** - Weekly rotation (cron-based)
4. **Lab Drill Reminder** - Smart cadence reminders
5. **Streak Milestone** - 5, 10, 21, 30-day celebrations
6. **Weekly Reports** - Progress summaries

### B2B Campaign System (Can Repurpose)

- **Multi-step sequences** (4 steps with 3-day intervals)
- **Template variables** (first_name, company, etc.)
- **Click tracking** with bot detection
- **Resend webhook** integration (opens, clicks, bounces)
- **Activity logging** to `marketing_outreach_activities`
- **Campaign analytics** dashboard

---

## Part 2: Gaps & What Needs Building

### A. User Lifecycle Campaigns (NEW)

These target **existing users** based on behavior:

| Campaign | Trigger | Goal |
|----------|---------|------|
| **Onboarding Drip** | Day 1, 3, 7 after signup | Feature discovery |
| **Trial Conversion** | Day 3, 5, 7 of trial | Convert to paid |
| **Trial Expiring** | 3 days, 1 day before expiry | Urgency to convert |
| **Re-engagement** | 7+ days inactive | Bring back |
| **Win-back** | 14+ days inactive OR churned | Recovery |
| **Upgrade Nudge** | High engagement + free tier | Upsell |

### B. Partner Program Promotion (DELICATE)

**Strategy**: Don't spam. Introduce naturally in context:

| Touchpoint | How to Mention Partner Program |
|------------|-------------------------------|
| Welcome Email | Brief mention: "Love the app? Earn by sharing" (already included) |
| Streak Milestone (30+ days) | "You're a power user! Become a Partner" |
| After positive feedback | "Glad you love it! Want to earn while you share?" |
| Post-conversion (new Pro) | "Share your experience, earn commissions" |
| Feature mastery | "Mastered Swing Lab? Help others discover it" |

**Rules for Partner Mentions:**
- Never more than 1 mention per week per user
- Only after positive engagement signals
- Always optional, never pushy
- Track `partner_promo_last_shown_at` per user

### C. Admin Controls (Growth Center)

| Feature | Description |
|---------|-------------|
| **Campaign Trigger Button** | One-click send win-back, re-engagement |
| **Email Preview** | See what email will look like |
| **Audience Selector** | Filter by tier, activity, date range |
| **Campaign History** | Log of all sent campaigns |
| **A/B Test Setup** | Create variants, track performance |
| **Drip Builder** | Visual sequence builder |

---

## Part 3: Repurposable Components

### From B2B System → User Lifecycle

| Existing Component | Repurpose For |
|-------------------|---------------|
| `send-campaign-email` logic | User drip campaigns |
| `process-campaign-followups` | Multi-step user sequences |
| `marketing_email_templates` table | User lifecycle templates |
| Click tracking system | User email engagement |
| Campaign analytics dashboard | User campaign metrics |
| Sequence step logic | Onboarding/trial drips |

### Template Variable Mapping

**B2B Variables → User Variables:**
```
first_name → first_name (same)
company_name → team_name (if applicable)
organization_name → (not used)
platform → tier (core/pro/trial)
```

**New User-Specific Variables:**
```
{{trial_days_remaining}} - Days left in trial
{{streak_count}} - Current streak
{{features_used}} - Number of features explored
{{last_feature}} - Most recently used feature
{{days_since_active}} - Inactivity count
{{partner_link}} - Unique partner referral URL
```

---

## Part 4: Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create `user_lifecycle_campaigns` table
- [ ] Create `user_lifecycle_emails` tracking table
- [ ] Build `send-user-lifecycle-email` edge function
- [ ] Add "Send Campaign" button to Growth Center
- [ ] Create basic email templates (onboarding, trial, re-engagement)

### Phase 2: Automation (Week 2)
- [ ] Build `process-user-lifecycle` cron job
- [ ] Implement onboarding drip (Day 1, 3, 7)
- [ ] Implement trial conversion drip (Day 3, 5, 7)
- [ ] Implement trial expiring alerts (Day -3, -1)
- [ ] Add campaign history to Growth Center

### Phase 3: Win-back & Partner (Week 3)
- [ ] Connect win-back to Growth Center UI
- [ ] Add re-engagement campaign (7-day inactive)
- [ ] Implement partner program soft mentions
- [ ] Add partner promo to streak milestones
- [ ] Track partner promo frequency per user

### Phase 4: Analytics & A/B (Week 4)
- [ ] Build A/B test framework
- [ ] Add variant tracking to emails
- [ ] Build A/B results dashboard
- [ ] Implement statistical significance calculation
- [ ] Add "winning variant" auto-selection

---

## Part 5: Email Templates Needed

### Onboarding Drip Sequence

**Email 1: Day 1 - "Your First Win"**
- Subject: "Welcome to M&M - Start here for your first win"
- Content: Quick tip to get started (Daily Hit or Chatter)
- CTA: Open the app
- Partner mention: None (too early)

**Email 2: Day 3 - "Discover Your Edge"**
- Subject: "3 features athletes are loving this week"
- Content: Highlight 3 popular features with GIFs
- CTA: Try [Feature Name]
- Partner mention: None

**Email 3: Day 7 - "You're Building Momentum"**
- Subject: "One week in - here's what's next"
- Content: Progress summary, unlock more with Pro
- CTA: Explore Pro features
- Partner mention: Soft (footer): "Love the app? Tell a teammate"

### Trial Conversion Sequence

**Email 1: Day 3 - "You're Crushing It"**
- Subject: "{{first_name}}, you're already ahead of 80% of athletes"
- Content: What they've accomplished, what Pro unlocks
- CTA: Keep exploring
- Partner mention: None

**Email 2: Day 5 - "Pro Features You Haven't Tried"**
- Subject: "2 Pro features waiting for you"
- Content: Show unused Pro features with benefits
- CTA: Try [Feature]
- Partner mention: None

**Email 3: Day 7 (or 2 days before expiry) - "Trial Ending Soon"**
- Subject: "{{trial_days_remaining}} days left to lock in Pro"
- Content: What they'll lose, special offer?
- CTA: Upgrade now
- Partner mention: Footer: "Going Pro? Earn while sharing"

### Re-engagement Sequence

**Email 1: Day 7 Inactive - "We Miss You"**
- Subject: "{{first_name}}, your streak is waiting"
- Content: What they're missing, new content preview
- CTA: Jump back in
- Partner mention: None

**Email 2: Day 14 Inactive - "Still There?"**
- Subject: "Quick check-in from Mind & Muscle"
- Content: Empathetic, offer help, promo code
- CTA: Come back with COMEBACK20
- Partner mention: None

### Win-back (Churned Pro)

**Email 1: "We'd Love You Back"**
- Subject: "{{first_name}}, here's what's new at M&M"
- Content: New features since they left, special offer
- CTA: Reactivate with discount
- Partner mention: None (not appropriate)

### Partner Program Promotion (Contextual)

**Streak Milestone (30+ days):**
- Subject: "30 days strong - You're officially a power user"
- Content: Celebrate streak, invite to partner program
- CTA: Learn about Partner Program
- Soft pitch: "Earn $X per athlete you refer"

**Post-Conversion (New Pro):**
- Subject: "Welcome to Pro - One more thing..."
- Content: Thanks for upgrading, partner opportunity
- CTA: Become a Partner
- Soft pitch: "Share your training stack, earn commissions"

---

## Part 6: Database Schema Additions

### New Tables

```sql
-- User lifecycle campaign definitions
CREATE TABLE user_lifecycle_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL, -- 'onboarding', 'trial', 'reengagement', 'winback', 'partner_promo'
  trigger_type TEXT NOT NULL, -- 'signup', 'trial_start', 'inactivity', 'manual'
  trigger_days INTEGER, -- Days after trigger event
  audience_filter JSONB, -- {"tier": ["core"], "min_features": 3, etc.}
  subject_line TEXT NOT NULL,
  body_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sequence_step INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track sent emails to users
CREATE TABLE user_lifecycle_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES user_lifecycle_campaigns(id),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  resend_email_id TEXT,
  UNIQUE(user_id, campaign_id) -- Prevent duplicates
);

-- Partner promo tracking
CREATE TABLE partner_promo_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  touchpoint TEXT NOT NULL, -- 'streak_milestone', 'post_conversion', 'email_footer'
  shown_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B test variants
CREATE TABLE email_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES user_lifecycle_campaigns(id),
  variant_name TEXT NOT NULL, -- 'A', 'B', 'control'
  subject_line TEXT NOT NULL,
  body_template TEXT NOT NULL,
  sends INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Part 7: Success Metrics

### Email Performance

| Metric | Target |
|--------|--------|
| Open Rate | > 40% |
| Click Rate | > 8% |
| Unsubscribe Rate | < 0.5% |

### Business Impact

| Metric | Target |
|--------|--------|
| Onboarding completion (D7) | > 60% |
| Trial → Paid conversion | > 15% |
| 7-day reactivation rate | > 20% |
| Win-back success rate | > 5% |
| Partner program signups | > 2% of eligible |

---

## Part 8: Partner Program Promotion Guidelines

### DO:
- Mention after positive engagement (streak milestone, feature mastery)
- Make it feel like an exclusive invitation
- Highlight earning potential with real numbers
- Show it as a way to help fellow athletes

### DON'T:
- Mention in first 7 days of user journey
- Include in re-engagement/win-back emails
- Show more than once per week
- Make it the primary CTA (always secondary)

### Suggested Copy:

**Soft (Footer):**
> "Love Mind & Muscle? Become a Partner and earn commissions sharing what you love."

**Medium (Dedicated Section):**
> "You've been crushing it for 30 days straight. Athletes like you are why we built this. Want to help others discover what you've found? Join our Partner Program and earn for every athlete you bring in."

**Contextual (After Upgrade):**
> "Welcome to Pro! Quick thought: if you ever want to share your training stack with your team or followers, our Partner Program lets you earn while you do. No pressure - just an option."

---

## Appendix: File Locations

### Existing Functions to Reference
- `/supabase/functions/send-campaign-email/index.ts`
- `/supabase/functions/process-campaign-followups/index.ts`
- `/supabase/functions/send-feature-spotlight-email/index.ts`
- `/supabase/functions/send-winback-campaign/index.ts`

### Admin Pages to Extend
- `/website/src/app/admin/growth/page.tsx`
- `/website/src/app/admin/campaigns/page.tsx`

### Shared Utilities
- `/supabase/functions/_shared/feature_content.ts`
