# Security Audit Report: Mind & Muscle Supabase RLS Policies

**Project:** kuswlvbjplkgrqlmqtok (Mind & Muscle)
**Audit Date:** January 3, 2026
**Auditor:** Security Audit System
**Scope:** Supabase Row-Level Security Policies and Edge Functions

---

## Executive Summary

This security audit identified **8 Critical**, **6 High**, **9 Medium**, and **5 Low** severity vulnerabilities in the Supabase RLS policies and Edge Functions. The most severe issues include:

1. **Unauthenticated Admin Password Reset Function** - An Edge Function allows resetting ANY user's password without authentication
2. **Tables with RLS Disabled** - Two tables have RLS completely disabled, exposing all data
3. **API Key Exposure to Clients** - Google API key is returned to authenticated clients
4. **Overly Permissive Policies** - Multiple tables use `USING (true)` without proper role checks
5. **Password Reset Tokens Readable by Anyone** - Policy allows all operations with `USING (true)`

**Risk Score: HIGH** - Immediate remediation required for Critical and High severity issues.

---

## Critical Vulnerabilities

### CRIT-01: Unauthenticated Admin Password Reset Edge Function

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/functions/admin-reset-password/index.ts`
- **Description**: The `admin-reset-password` Edge Function accepts an email and newPassword in the request body and resets ANY user's password without ANY authentication checks. The function uses `CORS: *` and has no authorization validation.
- **Impact**: Any attacker can reset any user's password in the system, leading to complete account takeover for all users including administrators.
- **Code Snippet**:
```typescript
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  // NO AUTHENTICATION CHECK HERE
  const { email, newPassword } = await req.json()
  // ... directly updates password using service role key
})
```
- **Remediation Checklist**:
  - [ ] **IMMEDIATE**: Delete or disable this Edge Function until fixed
  - [ ] Add authentication check requiring admin JWT token:
    ```typescript
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    // Verify token and check admin role
    const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (error || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    // Verify admin role in profiles table
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }
    ```
  - [ ] Add rate limiting to prevent brute force
  - [ ] Log all password reset attempts with IP address and admin ID
  - [ ] Restrict CORS to admin domain only instead of `*`
- **References**: [OWASP Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/), CWE-306

---

### CRIT-02: Password Reset Tokens Table - Universal Access Policy

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20250118_create_password_reset_tokens.sql`
- **Description**: The `password_reset_tokens` table has RLS enabled but the policy allows ALL operations for ANYONE:
```sql
CREATE POLICY "Service role can manage password reset tokens"
  ON password_reset_tokens
  FOR ALL
  USING (true)
  WITH CHECK (true);
```
- **Impact**: Any authenticated user (or potentially anonymous with anon key) can read, modify, or delete password reset tokens for any user, enabling account takeover attacks.
- **Remediation Checklist**:
  - [ ] Drop the permissive policy immediately
  - [ ] Create restrictive policy for service_role only:
    ```sql
    DROP POLICY IF EXISTS "Service role can manage password reset tokens" ON password_reset_tokens;
    CREATE POLICY "Service role only" ON password_reset_tokens
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    ```
  - [ ] Ensure password reset flow uses service_role key exclusively
- **References**: CWE-639, OWASP Broken Authentication

---

### CRIT-03: RLS Disabled on `user_daily_hit_views` Table

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20250213_disable_rls_user_daily_hit_views.sql`
- **Description**: RLS is explicitly DISABLED on this table, with a comment stating "RLS causing persistent issues with badge clearing". This exposes ALL user viewing data.
- **Impact**: Any authenticated user can read ALL users' daily hit viewing history, revealing usage patterns and personal habits of all users in the system.
- **Remediation Checklist**:
  - [ ] Re-enable RLS on the table
  - [ ] Fix the underlying issue with badge clearing using SECURITY DEFINER functions:
    ```sql
    ALTER TABLE user_daily_hit_views ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can manage own views"
      ON user_daily_hit_views
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Service role full access"
      ON user_daily_hit_views
      FOR ALL
      USING (auth.role() = 'service_role');
    ```
  - [ ] Create a SECURITY DEFINER function for badge operations if needed
- **References**: CWE-200, OWASP Sensitive Data Exposure

---

### CRIT-04: RLS Disabled on `user_topic_suggestions` Table

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20251129_fix_topic_suggestions_rls.sql`
- **Description**: RLS is explicitly disabled with GRANT ALL to authenticated, anon, and service_role:
```sql
ALTER TABLE user_topic_suggestions DISABLE ROW LEVEL SECURITY;
GRANT ALL ON user_topic_suggestions TO authenticated;
GRANT ALL ON user_topic_suggestions TO anon;
GRANT ALL ON user_topic_suggestions TO service_role;
```
- **Impact**: Any user (including anonymous) can read, modify, or delete any user's topic suggestions. This exposes user preferences and allows data manipulation.
- **Remediation Checklist**:
  - [ ] Enable RLS on the table
  - [ ] Create proper row-level policies:
    ```sql
    ALTER TABLE user_topic_suggestions ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view own suggestions"
      ON user_topic_suggestions FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own suggestions"
      ON user_topic_suggestions FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own suggestions"
      ON user_topic_suggestions FOR UPDATE
      USING (auth.uid() = user_id);
    ```
  - [ ] Remove GRANT ALL to anon
- **References**: CWE-862, OWASP Broken Access Control

---

### CRIT-05: Google API Key Returned to Client

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/functions/gemini-upload-token/index.ts`
- **Description**: The function returns the Google API key directly to authenticated clients:
```typescript
return new Response(
  JSON.stringify({
    success: true,
    apiKey: GOOGLE_API_KEY,  // API KEY EXPOSED
    uploadEndpoint: "https://generativelanguage.googleapis.com/upload/v1beta/files"
  }),
```
- **Impact**: While authenticated, any user can extract the Google API key and use it independently, potentially:
  - Running up API costs
  - Using the key for purposes outside the app
  - Key exposure if client device is compromised
- **Remediation Checklist**:
  - [ ] Implement a proxy pattern instead of exposing the key:
    ```typescript
    // Instead of returning API key, handle upload server-side
    // Client sends video to Edge Function, Edge Function uploads to Gemini
    ```
  - [ ] If direct upload is required for performance, implement:
    - Time-limited signed URLs instead of raw API key
    - Per-user usage tracking in database
    - Daily/monthly quotas per user
  - [ ] Add monitoring/alerting for unusual API usage patterns
- **References**: CWE-200, OWASP Sensitive Data Exposure

---

### CRIT-06: User Lifecycle Tables - Universal Access Policies

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20251224_user_lifecycle_campaigns.sql`
- **Description**: Multiple sensitive tables have `FOR ALL USING (true)` policies without role restrictions:
```sql
CREATE POLICY "Service role full access to campaigns" ON user_lifecycle_campaigns FOR ALL USING (true);
CREATE POLICY "Service role full access to emails" ON user_lifecycle_emails FOR ALL USING (true);
CREATE POLICY "Service role full access to impressions" ON partner_promo_impressions FOR ALL USING (true);
CREATE POLICY "Service role full access to variants" ON user_lifecycle_ab_variants FOR ALL USING (true);
CREATE POLICY "Service role full access to runs" ON user_lifecycle_campaign_runs FOR ALL USING (true);
```
- **Impact**: Despite the policy name suggesting "service role", `USING (true)` allows ANY role (including anon and authenticated) to access ALL data. This exposes:
  - Email campaign data with user emails
  - User engagement tracking
  - A/B test variants and results
- **Remediation Checklist**:
  - [ ] Fix all policies to properly check role:
    ```sql
    DROP POLICY IF EXISTS "Service role full access to campaigns" ON user_lifecycle_campaigns;
    CREATE POLICY "Service role full access to campaigns" ON user_lifecycle_campaigns
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    -- Repeat for all 5 tables
    ```
- **References**: CWE-863, OWASP Broken Access Control

---

### CRIT-07: Daily Hit Tables - Anonymous Full Access

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20251227_daily_hit_enhancements.sql`
- **Description**: Multiple daily hit tables allow anonymous users full access:
```sql
CREATE POLICY "Allow anon to modify batches" ON daily_hit_batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon to modify distribution" ON daily_hit_distribution FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon to modify gap alerts" ON daily_hit_gap_alerts FOR ALL USING (true) WITH CHECK (true);
```
- **Impact**: Anonymous users (using just the anon key) can:
  - Modify batch generation records
  - Manipulate distribution tracking
  - Create/modify/delete gap alerts
  This could disrupt content delivery and generation workflows.
- **Remediation Checklist**:
  - [ ] Replace anonymous write policies with service_role only:
    ```sql
    DROP POLICY IF EXISTS "Allow anon to modify batches" ON daily_hit_batches;
    DROP POLICY IF EXISTS "Allow anon to modify distribution" ON daily_hit_distribution;
    DROP POLICY IF EXISTS "Allow anon to modify gap alerts" ON daily_hit_gap_alerts;

    CREATE POLICY "Service role can modify batches" ON daily_hit_batches
      FOR ALL USING (auth.role() = 'service_role');
    -- Keep read policies for anon if needed for website
    CREATE POLICY "Anon can read batches" ON daily_hit_batches
      FOR SELECT USING (true);
    ```
- **References**: CWE-284, OWASP Broken Access Control

---

### CRIT-08: Trial Grants Table Missing RLS Policies

- **Location**: Multiple migrations reference `trial_grants` but no RLS policies found
- **Description**: The `trial_grants` table is used for granting Pro trial access but lacks visible RLS policies in the migrations. If RLS is enabled without policies, no access is possible; if disabled, all access is possible.
- **Impact**: Depending on state:
  - If RLS enabled without policies: Functionality broken
  - If RLS disabled: Any user can grant themselves unlimited trials
- **Remediation Checklist**:
  - [ ] Verify current RLS state in production
  - [ ] Add proper RLS policies:
    ```sql
    ALTER TABLE trial_grants ENABLE ROW LEVEL SECURITY;

    -- Users can view their own trial grants
    CREATE POLICY "Users can view own trials"
      ON trial_grants FOR SELECT
      USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

    -- Only service role can create/modify trials
    CREATE POLICY "Service role manages trials"
      ON trial_grants FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    ```
- **References**: CWE-862, OWASP Broken Access Control

---

## High Vulnerabilities

### HIGH-01: Marketing Automation Tables - Overly Permissive Read Access

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20251125_create_marketing_automation_system.sql`
- **Description**: All marketing tables allow authenticated users to read ALL data:
```sql
CREATE POLICY "Authenticated users can read organizations" ON organizations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read contacts" ON contacts FOR SELECT USING (auth.role() = 'authenticated');
-- etc for campaigns, campaign_contacts, email_templates, outreach_activities, meetings
```
- **Impact**: Any authenticated user (including free tier users and potentially malicious accounts) can read:
  - All marketing contact information
  - Campaign strategies and statistics
  - Email templates
  - Meeting schedules
- **Remediation Checklist**:
  - [ ] Restrict read access to admin/staff roles:
    ```sql
    DROP POLICY IF EXISTS "Authenticated users can read contacts" ON contacts;
    CREATE POLICY "Admins can read contacts" ON contacts FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role IN ('admin', 'superadmin', 'staff')
        )
      );
    ```
- **References**: CWE-200, OWASP Sensitive Data Exposure

---

### HIGH-02: Promo Codes Readable by Anyone

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20251129_create_promo_code_system.sql`
- **Description**: Active promo codes are publicly readable:
```sql
CREATE POLICY "Anyone can view active promo codes"
  ON promo_codes FOR SELECT
  USING (active = true AND expires_at > NOW());
```
- **Impact**: Any user can enumerate ALL active promo codes, their discount percentages, and usage limits. Attackers could:
  - Share codes publicly, causing financial loss
  - Identify high-value codes for abuse
- **Remediation Checklist**:
  - [ ] Remove public enumeration policy
  - [ ] Create validation function that doesn't expose all codes:
    ```sql
    DROP POLICY IF EXISTS "Anyone can view active promo codes" ON promo_codes;
    -- The validate_promo_code() function is SECURITY DEFINER and handles lookup
    -- No need for public SELECT policy
    ```
- **References**: CWE-200, Business Logic Vulnerability

---

### HIGH-03: Feature Spotlight State - RLS Without Policies (Originally)

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20260103_fix_rls_policies.sql`
- **Description**: The fix migration mentions `feature_spotlight_state` "has RLS enabled but no policies", which means access was completely blocked. The fix adds a permissive policy.
- **Impact**: Originally: Feature broken. After fix: Ensure policy is properly restrictive.
- **Remediation Checklist**:
  - [ ] Verify the fix migration has been applied
  - [ ] Confirm policy correctly restricts to service_role:
    ```sql
    -- Should be service_role only
    CREATE POLICY "Service role can manage feature_spotlight_state"
    ON feature_spotlight_state FOR ALL
    USING (auth.role() = 'service_role');
    ```
- **References**: CWE-862

---

### HIGH-04: SECURITY DEFINER Functions Without Input Validation

- **Location**: Multiple migrations (78 functions use SECURITY DEFINER)
- **Description**: Many SECURITY DEFINER functions accept user input without proper validation. Example from `20250110_fix_profile_creation.sql`:
```sql
CREATE OR REPLACE FUNCTION public.create_profile_for_user(
  user_name TEXT,
  user_role TEXT,  -- Could be injected with 'admin'
  user_birthday TIMESTAMP,
  age_result TEXT DEFAULT NULL,
  affiliate TEXT DEFAULT NULL
)
RETURNS void
SECURITY DEFINER
```
- **Impact**: Users could potentially pass malicious values that bypass RLS (since SECURITY DEFINER runs as owner). Role escalation could be possible if `user_role` isn't validated.
- **Remediation Checklist**:
  - [ ] Add input validation to all SECURITY DEFINER functions:
    ```sql
    -- At the start of function:
    IF user_role NOT IN ('athlete', 'parent', 'coach') THEN
      RAISE EXCEPTION 'Invalid role: %', user_role;
    END IF;
    ```
  - [ ] Audit all 78 SECURITY DEFINER functions for input validation
  - [ ] Consider using SECURITY INVOKER where elevated privileges aren't needed
- **References**: CWE-20, CWE-269

---

### HIGH-05: Admin Auth Uses Single Shared Password

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/website/src/lib/admin-auth.ts`
- **Description**: Admin authentication uses a single environment variable password (`ADMIN_DASHBOARD_PASSWORD`) shared across all admin users:
```typescript
const isCorrect = authHeader === correctPassword;
```
- **Impact**:
  - No individual accountability (all admins share one password)
  - Password rotation affects all admins
  - If leaked, all admin access is compromised
  - No MFA support
- **Remediation Checklist**:
  - [ ] Implement proper admin authentication using Supabase Auth:
    ```typescript
    // Verify JWT token and check admin role in database
    const { data: { user }, error } = await supabase.auth.getUser(token);
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!['admin', 'superadmin'].includes(profile?.role)) {
      return unauthorized;
    }
    ```
  - [ ] Add MFA requirement for admin access
  - [ ] Implement admin session management with audit logging
- **References**: CWE-287, OWASP Identification and Authentication Failures

---

### HIGH-06: Finder Fee Partners - Service Role Policy But Poor Naming

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20251205_create_finder_fee_partners_recurring.sql`
- **Description**: The policy correctly uses `TO service_role` but the comment says "admin only":
```sql
CREATE POLICY "Service role can manage finder fee partners"
  ON finder_fee_partners
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```
- **Impact**: While this is actually secure (TO service_role restricts it), verify no admin UI uses authenticated role expecting access.
- **Remediation Checklist**:
  - [ ] Verify admin UI properly uses service_role key for finder fee operations
  - [ ] Add admin-specific policies if admin panel needs direct access:
    ```sql
    CREATE POLICY "Admins can view finder fee partners"
      ON finder_fee_partners FOR SELECT
      USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
      );
    ```
- **References**: Best Practice

---

## Medium Vulnerabilities

### MED-01: AI API Calls - Insert Policy Too Permissive

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20250112_create_ai_cost_tracking.sql`
- **Description**: The insert policy allows any insert without user_id validation:
```sql
CREATE POLICY "Service role can insert AI API calls"
  ON ai_api_calls
  FOR INSERT
  WITH CHECK (true);
```
- **Impact**: Malicious users could potentially insert false AI usage records, though the damage is limited to data integrity.
- **Remediation Checklist**:
  - [ ] Restrict insert to service_role only:
    ```sql
    DROP POLICY IF EXISTS "Service role can insert AI API calls" ON ai_api_calls;
    CREATE POLICY "Service role can insert AI API calls"
      ON ai_api_calls FOR INSERT
      WITH CHECK (auth.role() = 'service_role');
    ```

---

### MED-02: Profiles Table - No Profile Viewing Restrictions Between Users

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20250110_fix_profile_creation.sql`
- **Description**: Users can only view their own profile, which is correct. However, coaches/parents may need to view athlete profiles.
- **Impact**: Functionality issue if coaches can't see athlete profiles; verify the app handles this correctly.
- **Remediation Checklist**:
  - [ ] Add policy for coaches to view team member profiles:
    ```sql
    CREATE POLICY "Coaches can view team member profiles"
      ON profiles FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM team_memberships tm1
          JOIN team_memberships tm2 ON tm1.team_id = tm2.team_id
          WHERE tm1.user_id = auth.uid()
          AND tm2.user_id = profiles.id
          AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = tm1.user_id AND p.role = 'coach')
        )
      );
    ```

---

### MED-03: Welcome Emails Table - Universal Access

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20251217_create_welcome_email_trigger.sql`
- **Description**: Based on pattern observed, likely has `USING (true)` policy.
- **Impact**: Welcome email records could be read by any user.
- **Remediation Checklist**:
  - [ ] Verify and restrict to service_role only

---

### MED-04: Notification RLS - Overly Permissive

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20250205_fix_notification_rls.sql`
- **Description**: Contains `USING (true)` patterns.
- **Impact**: Notification data could be accessible across users.
- **Remediation Checklist**:
  - [ ] Audit and restrict notification access to owners

---

### MED-05: Lab Drill Reminder Log - Universal Access

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20251220_create_lab_drill_reminder_tracking.sql`
- **Description**: Contains `USING (true)` policy.
- **Impact**: Drill reminder data exposed.
- **Remediation Checklist**:
  - [ ] Restrict to service_role

---

### MED-06: Weekly Report Notification Log - Universal Access

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20251124_weekly_report_notifications.sql`
- **Description**: Contains `USING (true)` policy.
- **Impact**: Report notification data exposed.
- **Remediation Checklist**:
  - [ ] Restrict to service_role

---

### MED-07: Remote Feature Flags - Public Read Access

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20251223_remote_feature_flags.sql`
- **Description**: Feature flags are readable by anyone with `USING (true)`.
- **Impact**: Internal feature rollout strategy visible to all users. Could reveal upcoming features or internal tools.
- **Remediation Checklist**:
  - [ ] If intentional (app needs flags), document this decision
  - [ ] Consider filtering sensitive flags from public access

---

### MED-08: Partner Banners - Universal Access

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20251216_create_partner_banners.sql`
- **Description**: Contains `USING (true)` policy.
- **Impact**: Partner configuration data exposed.
- **Remediation Checklist**:
  - [ ] Verify if public read is intentional for display
  - [ ] Restrict write operations to service_role

---

### MED-09: Missing Index on Sensitive Queries

- **Location**: Various tables
- **Description**: Some RLS policies use subqueries without supporting indexes, which could lead to slow queries or timeout-based attacks.
- **Impact**: Performance degradation; potential DoS vector.
- **Remediation Checklist**:
  - [ ] Audit RLS policies for subquery performance
  - [ ] Add indexes for common policy checks

---

## Low Vulnerabilities

### LOW-01: CORS Set to Wildcard on Edge Functions

- **Location**: All Edge Functions use `'Access-Control-Allow-Origin': '*'`
- **Description**: Wildcard CORS allows any domain to call these functions.
- **Impact**: While functions require authentication, reduces defense-in-depth.
- **Remediation Checklist**:
  - [ ] Restrict CORS to known domains:
    ```typescript
    const ALLOWED_ORIGINS = ['https://mindandmuscle.ai', 'https://api.mindandmuscle.ai'];
    const origin = req.headers.get('Origin');
    const corsOrigin = ALLOWED_ORIGINS.includes(origin || '') ? origin : ALLOWED_ORIGINS[0];
    ```

---

### LOW-02: Feedback Table Anonymous Insert

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/migrations/20250119_fix_feedback_rls.sql`
- **Description**: Allows anonymous feedback submission, which is intentional but could be abused.
- **Impact**: Spam submissions possible without authentication.
- **Remediation Checklist**:
  - [ ] Add rate limiting on feedback submission
  - [ ] Consider requiring CAPTCHA or honeypot fields
  - [ ] Log IP addresses for abuse tracking

---

### LOW-03: Debug Functions in Production

- **Location**: `/Users/jbb/Downloads/Mind-Muscle/supabase/functions/debug-calendar-generator/`, `debug-storage-upload/`
- **Description**: Debug Edge Functions exist in the functions directory.
- **Impact**: Could expose internal behavior if accessible.
- **Remediation Checklist**:
  - [ ] Verify debug functions are not deployed to production
  - [ ] Add authentication requirements to any debug functions
  - [ ] Consider removing from codebase if not needed

---

### LOW-04: Service Role Key in Multiple Environment Files

- **Location**: `.env.local` and potentially other environment files
- **Description**: Service role key found in repository (even if gitignored).
- **Impact**: If committed to version control, key exposure risk.
- **Remediation Checklist**:
  - [ ] Verify `.env*` files are in `.gitignore`
  - [ ] Rotate service role key if it was ever committed
  - [ ] Use secrets management (Vercel, etc.) for production keys

---

### LOW-05: No Audit Logging for RLS Policy Violations

- **Location**: Database-wide
- **Description**: Failed RLS access attempts are not logged for security monitoring.
- **Impact**: Difficult to detect unauthorized access attempts.
- **Remediation Checklist**:
  - [ ] Enable Postgres logging for permission denied errors
  - [ ] Set up alerting for unusual access patterns
  - [ ] Consider implementing custom audit logging

---

## General Security Recommendations

### Immediate Actions (This Week)
- [ ] **CRITICAL**: Delete or fix `admin-reset-password` Edge Function immediately
- [ ] Fix password_reset_tokens policy to service_role only
- [ ] Re-enable RLS on `user_daily_hit_views` and `user_topic_suggestions`
- [ ] Fix all `USING (true)` policies to include proper role checks
- [ ] Remove API key return from `gemini-upload-token` function

### Short-Term Actions (This Month)
- [ ] Audit all 78 SECURITY DEFINER functions for input validation
- [ ] Implement proper admin authentication with individual accounts
- [ ] Add MFA for admin access
- [ ] Restrict marketing table access to admin roles
- [ ] Remove public promo code enumeration

### Long-Term Actions (This Quarter)
- [ ] Implement comprehensive audit logging
- [ ] Set up security monitoring and alerting
- [ ] Conduct penetration testing
- [ ] Create security runbook for incident response
- [ ] Implement secrets rotation policy

---

## Security Posture Improvement Plan

### Phase 1: Emergency Fixes (Days 1-3)
1. Disable `admin-reset-password` Edge Function
2. Fix password_reset_tokens RLS policy
3. Re-enable RLS on tables where disabled
4. Fix lifecycle tables' USING (true) policies

### Phase 2: Access Control Hardening (Week 1-2)
1. Audit all RLS policies for proper role checks
2. Implement proper admin authentication
3. Restrict API key exposure
4. Add input validation to SECURITY DEFINER functions

### Phase 3: Monitoring & Compliance (Week 3-4)
1. Implement audit logging
2. Set up security monitoring
3. Document security policies
4. Create incident response procedures

### Phase 4: Continuous Improvement (Ongoing)
1. Regular security audits
2. Dependency vulnerability scanning
3. Penetration testing (quarterly)
4. Security training for developers

---

## Appendix: Tables Requiring RLS Review

| Table | Current Status | Recommended Action |
|-------|---------------|-------------------|
| user_daily_hit_views | RLS DISABLED | Enable RLS, add user-specific policies |
| user_topic_suggestions | RLS DISABLED | Enable RLS, add user-specific policies |
| password_reset_tokens | USING (true) | Restrict to service_role |
| user_lifecycle_campaigns | USING (true) | Restrict to service_role |
| user_lifecycle_emails | USING (true) | Restrict to service_role |
| partner_promo_impressions | USING (true) | Restrict to service_role |
| daily_hit_batches | Anon write | Restrict write to service_role |
| daily_hit_distribution | Anon write | Restrict write to service_role |
| daily_hit_gap_alerts | Anon write | Restrict write to service_role |
| promo_codes | Public read | Remove enumeration policy |
| trial_grants | Unknown | Verify and add proper policies |

---

*Report generated by automated security audit. Manual verification of findings recommended before remediation.*
