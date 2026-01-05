# Security Audit Report - Mind & Muscle API Routes

**Audit Date:** 2026-01-03
**Scope:** `/website/src/app/api/` - 103 API route files
**Auditor:** Claude Security Audit

---

## Executive Summary

This security audit identified **8 Critical**, **12 High**, **9 Medium**, and **6 Low** severity vulnerabilities across the Mind & Muscle API codebase. The most severe issues involve:

1. **Hardcoded admin password exposed in source code** - The password `Brutus7862!` is hardcoded as a fallback in 50+ locations
2. **27 admin API routes with no authentication** - Complete bypass of admin protection
3. **SQL injection risk via dynamic SQL execution** - The `exec_sql` RPC allows arbitrary SQL
4. **Inconsistent authentication patterns** - Mix of `ADMIN_DASHBOARD_PASSWORD` and `NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD`

**Risk Assessment:** HIGH - Immediate action required for critical vulnerabilities.

---

## Critical Vulnerabilities

### CRIT-01: Hardcoded Admin Password in Source Code

- **Location**: 50+ files across `/website/src/app/api/admin/` and `/website/src/app/admin/`
- **Description**: The admin password `Brutus7862!` is hardcoded as a fallback value throughout the codebase. This password is visible to anyone with access to the source code repository.

**Affected files include:**
```
/website/src/app/api/admin/financials/route.ts:20
/website/src/app/api/admin/campaigns/route.ts:9
/website/src/app/api/admin/templates/route.ts:9
/website/src/app/api/admin/outreach/bulk-update/route.ts:9
/website/src/context/AdminAuthContext.tsx:14
/website/src/app/admin/page.tsx:337 (displayed in UI!)
```

- **Impact**: Any attacker who gains access to the source code (via GitHub breach, insider threat, or accidental exposure) can access all admin functionality.
- **Remediation Checklist**:
  - [ ] Remove ALL hardcoded password fallbacks from the codebase
  - [ ] Use only environment variable `ADMIN_DASHBOARD_PASSWORD` (not the `NEXT_PUBLIC_` variant)
  - [ ] Implement proper secret rotation
  - [ ] Add pre-commit hooks to detect hardcoded secrets
  - [ ] Remove password display from `/website/src/app/admin/page.tsx:337`

**Code example - Current (VULNERABLE):**
```typescript
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';
```

**Code example - Fixed:**
```typescript
const ADMIN_PASSWORD = process.env.ADMIN_DASHBOARD_PASSWORD;
if (!ADMIN_PASSWORD) {
  throw new Error('ADMIN_DASHBOARD_PASSWORD environment variable is required');
}
```

---

### CRIT-02: 27 Admin Routes Without Authentication

- **Location**: Multiple files in `/website/src/app/api/admin/`
- **Description**: The following admin routes have NO authentication checks and are publicly accessible:

```
/api/admin/daily-hit/batch-generate
/api/admin/daily-hit/category-balance
/api/admin/daily-hit/distribution
/api/admin/daily-hit/gaps
/api/admin/daily-hit/generate-audio
/api/admin/daily-hit/generate-content
/api/admin/daily-hit/generate-image-prompt
/api/admin/daily-hit/publish
/api/admin/daily-hit/ratings
/api/admin/daily-hit/route
/api/admin/daily-hit/upload-image
/api/admin/dbat-campaign
/api/admin/generate-social-images
/api/admin/log-audit/issues/[id]
/api/admin/log-audit/issues
/api/admin/log-audit/run
/api/admin/log-audit/runs
/api/admin/log-audit/stats
/api/admin/system/cron-jobs/history
/api/admin/system/cron-jobs
/api/admin/system/database
/api/admin/system/edge-functions
/api/admin/system/errors
/api/admin/system/feature-flags
/api/admin/system/queues
/api/admin/system/webhooks
/api/admin/vault
```

- **Impact**: Attackers can:
  - Publish arbitrary content to the platform
  - View and manipulate database internals
  - Execute cron jobs
  - Moderate vault content (approve/reject/delete drills)
  - Access sensitive system metrics and logs

- **Remediation Checklist**:
  - [ ] Add `verifyAdmin()` or `verifyAdminWithRateLimit()` from `/lib/admin-auth.ts` to ALL admin routes
  - [ ] Create a middleware wrapper for automatic admin auth
  - [ ] Add integration tests that verify all admin routes require authentication

**Code example - Add to each unprotected route:**
```typescript
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of handler
}
```

---

### CRIT-03: SQL Injection via exec_sql RPC

- **Location**:
  - `/website/src/app/api/admin/system/cron-jobs/route.ts`
  - `/website/src/app/api/admin/system/database/route.ts`
  - `/website/src/app/api/admin/system/edge-functions/route.ts`
  - `/website/src/app/api/admin/system/queues/route.ts`
- **Description**: These routes use a Supabase RPC function `exec_sql` that executes arbitrary SQL. Combined with CRIT-02 (no auth), this allows anyone to execute SQL against your database.

**Vulnerable code in `/api/admin/system/cron-jobs/route.ts`:**
```typescript
if (action === 'run_now') {
  const { data: jobData } = await supabase.rpc('exec_sql', {
    sql: `SELECT command FROM cron.job WHERE jobid = ${jobId}` // SQL Injection!
  });

  if (jobData?.[0]?.command) {
    await supabase.rpc('exec_sql', { sql: jobData[0].command }); // Executes arbitrary SQL!
  }
}
```

- **Impact**: Complete database compromise - attackers can read, modify, or delete any data.
- **Remediation Checklist**:
  - [ ] Remove or restrict `exec_sql` RPC function at the database level
  - [ ] Use parameterized queries instead of string interpolation
  - [ ] If dynamic SQL is required, implement a whitelist of allowed operations
  - [ ] Add Row Level Security (RLS) policies that restrict what this RPC can access

---

### CRIT-04: Exposed Admin Password Environment Variable (NEXT_PUBLIC_)

- **Location**: Multiple admin routes and client-side pages
- **Description**: The environment variable `NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD` is prefixed with `NEXT_PUBLIC_`, meaning it is exposed to client-side JavaScript and visible in browser developer tools.

- **Impact**: Anyone can view the admin password by inspecting the website's JavaScript bundle.
- **Remediation Checklist**:
  - [ ] Rename `NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD` to `ADMIN_DASHBOARD_PASSWORD`
  - [ ] Update all API routes to use the non-public version
  - [ ] For client-side admin auth, implement a proper session-based system
  - [ ] Regenerate the admin password immediately after this change

---

### CRIT-05: Account Deletion Without Authentication

- **Location**: `/website/src/app/api/account-deletion-request/route.ts`
- **Description**: The account deletion endpoint accepts any `userId` and `email` without verifying the requester owns that account.

```typescript
export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();
    // No verification that the requester owns this account!
    const { error: logError } = await supabase
      .from('account_deletion_requests')
      .insert({
        user_id: userId,
        email: email,
        // ...
      });
```

- **Impact**: Attackers can request deletion of any user's account by guessing/enumerating user IDs.
- **Remediation Checklist**:
  - [ ] Require authentication (JWT/session token) for deletion requests
  - [ ] Verify the authenticated user matches the requested `userId`
  - [ ] Implement email verification for deletion requests
  - [ ] Add rate limiting to prevent enumeration attacks

---

### CRIT-06: Finder Fee Actions Without Proper Token Validation

- **Location**: `/website/src/app/api/finder-fee-action/route.ts`
- **Description**: While tokens are used, they are queried via an OR clause that could match unintended records if tokens are predictable or reused.

```typescript
const { data: fee, error: fetchError } = await supabase
  .from('finder_fees')
  .select('*')
  .or(`approve_token.eq.${token},reject_token.eq.${token},paid_token.eq.${token}`)
  .single();
```

- **Impact**: Token collision or prediction could allow unauthorized fee approvals/rejections.
- **Remediation Checklist**:
  - [ ] Use cryptographically secure tokens (UUID v4 minimum)
  - [ ] Query tokens separately to identify token type
  - [ ] Add token expiration
  - [ ] Log all fee action attempts for audit

---

### CRIT-07: Service Role Key Used Client-Side Accessible

- **Location**: All Supabase client initializations in API routes
- **Description**: While the service role key is in server-side code, the patterns used could lead to accidental exposure. No explicit checks prevent client-side usage.

- **Impact**: If accidentally imported client-side, would give full database access.
- **Remediation Checklist**:
  - [ ] Add explicit runtime checks that service key operations only run server-side
  - [ ] Consider using Supabase Edge Functions for sensitive operations
  - [ ] Audit all imports to ensure service key files aren't bundled

---

### CRIT-08: Password Reset Verification Bypass Risk

- **Location**: `/website/src/app/api/auth/reset-password/route.ts`
- **Description**: The password reset flow signs in to verify the password, which could create session artifacts and has timing side-channel risks.

```typescript
// CRITICAL: Verify the password was actually set correctly by attempting to sign in
const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
  email: updateData?.user?.email || '',
  password: newPassword,
});
```

- **Impact**: Creates unnecessary sessions, timing information leakage.
- **Remediation Checklist**:
  - [ ] Remove the verification sign-in - trust the Supabase update
  - [ ] If verification is needed, use a different mechanism
  - [ ] Ensure sign-out actually clears the test session

---

## High Vulnerabilities

### HIGH-01: Inconsistent Admin Authentication Patterns

- **Location**: Various admin routes
- **Description**: Admin routes use three different authentication approaches:
  1. `verifyAdmin()` from `/lib/admin-auth.ts` (correct)
  2. `verifyAdminWithRateLimit()` from `/lib/admin-auth.ts` (correct)
  3. Inline password check with hardcoded fallback (incorrect)
  4. No authentication at all (critical)

- **Impact**: Maintenance nightmare, easy to miss security gaps.
- **Remediation Checklist**:
  - [ ] Standardize ALL admin routes to use `verifyAdmin()` or `verifyAdminWithRateLimit()`
  - [ ] Create a Next.js middleware for `/api/admin/*` routes
  - [ ] Remove all inline password checks

---

### HIGH-02: Rate Limiting Disabled in Development

- **Location**: `/website/src/lib/rate-limit.ts`
- **Description**: Rate limiting is completely disabled if Redis is not configured.

```typescript
export const lookupTeamRateLimit = redis
  ? new Ratelimit({ /* config */ })
  : null; // No rate limiting!
```

- **Impact**: Development environments (and production if Redis fails) have no rate limiting protection.
- **Remediation Checklist**:
  - [ ] Implement fallback in-memory rate limiting for non-Redis environments
  - [ ] Log warnings when rate limiting is disabled
  - [ ] Require Redis configuration in production deployments

---

### HIGH-03: Stripe Webhook Without Signature Verification Shown

- **Location**: `/website/src/app/api/webhooks/stripe/route.ts`
- **Description**: The webhook handler is extensive but signature verification happens after parsing, which could allow malformed payloads to be processed.

- **Impact**: Attackers could potentially craft malicious webhook payloads.
- **Remediation Checklist**:
  - [ ] Verify Stripe signature BEFORE any payload parsing
  - [ ] Return 400 immediately on signature failure
  - [ ] Log all webhook verification failures

---

### HIGH-04: Email Enumeration via Partner Magic Link

- **Location**: `/website/src/app/api/partner/send-magic-link/route.ts`
- **Description**: While the response message doesn't reveal if an email exists, the rate limiting check happens AFTER the email lookup, allowing timing-based enumeration.

- **Impact**: Attackers can enumerate valid partner emails.
- **Remediation Checklist**:
  - [ ] Check rate limit BEFORE database lookup
  - [ ] Add consistent response timing regardless of email existence
  - [ ] Consider CAPTCHA for repeated requests

---

### HIGH-05: Bulk Email Send Without Confirmation

- **Location**: `/website/src/app/api/admin/email-sender/send/route.ts`
- **Description**: Admin can bulk send emails to up to 1000 users without any confirmation or preview step.

- **Impact**: Accidental mass emails, potential for abuse.
- **Remediation Checklist**:
  - [ ] Add confirmation token for bulk sends
  - [ ] Implement "send test" before bulk send
  - [ ] Add audit logging with admin identifier
  - [ ] Implement approval workflow for large sends (>100 recipients)

---

### HIGH-06: Promo Code Validation Information Disclosure

- **Location**: `/website/src/app/api/validate-promo-code/route.ts`
- **Description**: Validation errors reveal whether a code exists, is expired, or has reached max redemptions.

- **Impact**: Allows attackers to probe for valid codes and their status.
- **Remediation Checklist**:
  - [ ] Return generic "Invalid promo code" for all failure cases
  - [ ] Log detailed failures server-side only
  - [ ] Add rate limiting per IP

---

### HIGH-07: Team Lookup Information Disclosure

- **Location**: `/website/src/app/api/lookup-team/route.ts`
- **Description**: Returns detailed team information including seat usage, pricing, and customer email.

- **Impact**: Competitor intelligence gathering, targeted attacks.
- **Remediation Checklist**:
  - [ ] Remove customer email from response
  - [ ] Limit seat information to only what's necessary
  - [ ] Add authentication for detailed team info

---

### HIGH-08: Daily Hit API Exposes Internal IDs

- **Location**: `/website/src/app/api/daily-hit/route.ts`
- **Description**: Returns internal database IDs in responses which could be used for enumeration.

- **Impact**: ID enumeration, potential for unauthorized access attempts.
- **Remediation Checklist**:
  - [ ] Use UUIDs instead of sequential IDs
  - [ ] Consider returning only necessary fields

---

### HIGH-09: CORS Allows All Vercel Deployments

- **Location**: `/website/src/lib/cors.ts`
- **Description**: CORS configuration allows any `*.vercel.app` domain.

```typescript
if (origin.endsWith('.vercel.app')) {
  return true;
}
```

- **Impact**: Any Vercel deployment can make requests to your API.
- **Remediation Checklist**:
  - [ ] Restrict to specific deployment URLs or add project-specific checks
  - [ ] Monitor for suspicious cross-origin requests

---

### HIGH-10: Feedback API Uses Anon Key

- **Location**: `/website/src/app/api/feedback/route.ts`
- **Description**: Uses anon key for database access, relies on RLS which may not be properly configured.

- **Impact**: Potential data leakage if RLS is misconfigured.
- **Remediation Checklist**:
  - [ ] Review RLS policies for `user_feedback` table
  - [ ] Consider using service key with explicit permission checks

---

### HIGH-11: Partner Metrics Without Session Validation

- **Location**: `/website/src/app/api/partner/metrics/route.ts`
- **Description**: Partner metrics may be accessible without proper session validation after magic link expiry.

- **Impact**: Unauthorized access to partner data.
- **Remediation Checklist**:
  - [ ] Implement proper session management
  - [ ] Add session expiration checks on every request

---

### HIGH-12: Error Messages Expose Implementation Details

- **Location**: Multiple routes
- **Description**: Error responses often include stack traces, Supabase error codes, and internal details.

```typescript
return NextResponse.json({
  error: 'Failed to fetch financials',
  details: error instanceof Error ? error.message : 'Unknown error',
}, { status: 500 });
```

- **Impact**: Information leakage aiding attackers.
- **Remediation Checklist**:
  - [ ] Use generic error messages in production
  - [ ] Log detailed errors server-side only
  - [ ] Implement error tracking (Sentry, etc.)

---

## Medium Vulnerabilities

### MED-01: In-Memory Rate Limiting in Feedback API

- **Location**: `/website/src/app/api/feedback/route.ts`
- **Description**: Uses in-memory rate limiting which doesn't work across serverless instances.

- **Impact**: Rate limiting ineffective in production.
- **Remediation Checklist**:
  - [ ] Use Redis-based rate limiting
  - [ ] Or use Vercel's built-in rate limiting

---

### MED-02: Missing Content-Type Validation

- **Location**: Multiple routes
- **Description**: Routes don't validate Content-Type header before parsing JSON.

- **Impact**: Could lead to unexpected behavior with malformed requests.
- **Remediation Checklist**:
  - [ ] Add Content-Type header validation
  - [ ] Return 415 Unsupported Media Type for non-JSON requests

---

### MED-03: Zod Validation Errors Exposed

- **Location**: Routes using Zod validation
- **Description**: Full Zod error objects are returned to clients.

- **Impact**: Reveals validation logic and field names.
- **Remediation Checklist**:
  - [ ] Format Zod errors to only include necessary information
  - [ ] Use generic messages for production

---

### MED-04: Missing CSRF Protection

- **Location**: All POST/PUT/DELETE routes
- **Description**: No CSRF tokens are used for state-changing operations.

- **Impact**: Vulnerable to cross-site request forgery attacks.
- **Remediation Checklist**:
  - [ ] Implement CSRF tokens for sensitive operations
  - [ ] Use SameSite cookie attributes
  - [ ] Verify Origin/Referer headers

---

### MED-05: No Request ID for Tracing

- **Location**: All routes
- **Description**: No request IDs are generated for log correlation.

- **Impact**: Difficult to trace issues across systems.
- **Remediation Checklist**:
  - [ ] Generate unique request IDs
  - [ ] Include in all logs and responses

---

### MED-06: Checkout Session Missing Idempotency

- **Location**: `/website/src/app/api/create-checkout-session/route.ts`
- **Description**: No idempotency key for Stripe checkout session creation.

- **Impact**: Duplicate sessions could be created on retry.
- **Remediation Checklist**:
  - [ ] Implement idempotency key based on user+timestamp
  - [ ] Check for existing pending sessions

---

### MED-07: Log Audit Cron Without Strong Auth

- **Location**: `/website/src/app/api/cron/log-audit/route.ts`
- **Description**: Relies solely on `CRON_SECRET` header which could be exposed.

- **Impact**: Unauthorized cron job execution.
- **Remediation Checklist**:
  - [ ] Add IP allowlist for cron endpoints
  - [ ] Use signed URLs with expiration

---

### MED-08: Template Variables Not Sanitized

- **Location**: `/website/src/app/api/admin/email-sender/send/route.ts`
- **Description**: Template variable replacement doesn't escape HTML.

```typescript
personalized = personalized.replace(/\{\{first_name\}\}/gi, firstName);
```

- **Impact**: XSS in emails if user data contains HTML.
- **Remediation Checklist**:
  - [ ] Escape HTML in all template variable replacements
  - [ ] Use a proper templating library with auto-escaping

---

### MED-09: Database Stats Publicly Accessible

- **Location**: `/website/src/app/api/admin/system/database/route.ts`
- **Description**: Exposes detailed database statistics including table sizes, connection counts, and index usage.

- **Impact**: Information disclosure aiding targeted attacks.
- **Remediation Checklist**:
  - [ ] Add authentication (see CRIT-02)
  - [ ] Limit exposed statistics

---

## Low Vulnerabilities

### LOW-01: Missing Security Headers

- **Location**: All API routes
- **Description**: Missing security headers like X-Content-Type-Options, X-Frame-Options.

- **Remediation Checklist**:
  - [ ] Add security headers via Next.js config or middleware

---

### LOW-02: Verbose Logging in Production

- **Location**: Multiple routes with `console.log`
- **Description**: Detailed logging that should only be in development.

- **Remediation Checklist**:
  - [ ] Use conditional logging based on environment
  - [ ] Implement proper log levels

---

### LOW-03: Test Codes in Production

- **Location**: `/website/src/app/api/lookup-team/route.ts`
- **Description**: Test coach codes hardcoded that work in production.

```typescript
const TEST_CODES = ['COACH-PKRM-L75S-6A29'];
if (TEST_CODES.includes(teamCode.toUpperCase())) {
  return NextResponse.json({ /* mock data */ });
}
```

- **Remediation Checklist**:
  - [ ] Remove test code or gate behind environment check

---

### LOW-04: Magic Link Token Simplicity

- **Location**: `/website/src/app/api/partner/send-magic-link/route.ts`
- **Description**: Uses `crypto.randomUUID()` which is good but consider adding expiration signature.

- **Remediation Checklist**:
  - [ ] Consider JWT tokens with embedded expiration

---

### LOW-05: Email Template Stored in Code

- **Location**: Multiple email sending routes
- **Description**: HTML email templates are hardcoded in route files.

- **Remediation Checklist**:
  - [ ] Move templates to separate files or database
  - [ ] Implement template versioning

---

### LOW-06: Unused Variables in Some Routes

- **Location**: Various routes
- **Description**: Some routes define variables that are never used.

- **Remediation Checklist**:
  - [ ] Clean up unused code
  - [ ] Add ESLint rules for unused variables

---

## General Security Recommendations

### Immediate Actions (Do Today)

- [ ] **Change the admin password** - The current password is exposed in source code
- [ ] **Add authentication to the 27 unprotected admin routes** listed in CRIT-02
- [ ] **Remove all hardcoded password fallbacks** from the codebase
- [ ] **Rename `NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD`** to `ADMIN_DASHBOARD_PASSWORD`

### Short-Term (This Week)

- [ ] Implement Next.js middleware for admin route protection
- [ ] Add CSRF protection to all state-changing endpoints
- [ ] Configure proper CORS restrictions
- [ ] Review and restrict `exec_sql` RPC function
- [ ] Add authentication to account deletion endpoint

### Medium-Term (This Month)

- [ ] Implement proper session management for admin and partner dashboards
- [ ] Set up security monitoring and alerting
- [ ] Add automated security scanning to CI/CD pipeline
- [ ] Conduct penetration testing
- [ ] Create security documentation and runbooks

### Long-Term (This Quarter)

- [ ] Implement proper role-based access control (RBAC)
- [ ] Add audit logging for all sensitive operations
- [ ] Set up WAF (Web Application Firewall)
- [ ] Implement secret rotation procedures
- [ ] Create incident response plan

---

## Security Posture Improvement Plan

### Phase 1: Emergency Fixes (1-2 days)
1. Rotate admin password
2. Add authentication to unprotected admin routes
3. Remove hardcoded credentials

### Phase 2: Authentication Hardening (1 week)
1. Implement admin middleware
2. Add CSRF protection
3. Fix rate limiting

### Phase 3: Defense in Depth (2-4 weeks)
1. Add security headers
2. Implement audit logging
3. Set up monitoring
4. Review RLS policies

### Phase 4: Continuous Improvement (Ongoing)
1. Regular security audits
2. Dependency updates
3. Penetration testing
4. Security training

---

## References

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/authentication)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth)
- [CWE-798: Use of Hard-coded Credentials](https://cwe.mitre.org/data/definitions/798.html)
- [CWE-89: SQL Injection](https://cwe.mitre.org/data/definitions/89.html)
- [CWE-306: Missing Authentication for Critical Function](https://cwe.mitre.org/data/definitions/306.html)

---

*This report was generated as part of a security audit. All findings should be verified and remediated according to your organization's security policies.*
