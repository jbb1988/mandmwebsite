import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to verify admin password
function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('X-Admin-Password');
  return authHeader === process.env.ADMIN_DASHBOARD_PASSWORD;
}

// GET: Fetch trial users and promo code redemptions
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'active'; // 'active', 'grants', 'redemptions'

    const now = new Date().toISOString();

    if (view === 'active') {
      // Get all active trial users (users with tier='pro' and promo_tier_expires_at in future)
      const { data: activeTrials, error } = await supabase
        .from('profiles')
        .select('id, email, tier, promo_tier_expires_at, created_at')
        .eq('tier', 'pro')
        .gt('promo_tier_expires_at', now)
        .order('promo_tier_expires_at', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get trial grants to determine source
      const { data: trialGrants } = await supabase
        .from('trial_grants')
        .select('user_profile_id, user_email, granted_by_admin, created_at, source');

      // Get promo code redemptions to determine source
      const { data: redemptions } = await supabase
        .from('promo_code_redemptions')
        .select('redeemer_email, promo_code, redeemed_at');

      // Create lookup maps
      const grantsByEmail: Record<string, { source: string; granted_at: string }> = {};
      (trialGrants || []).forEach((g) => {
        const email = g.user_email?.toLowerCase();
        if (email) {
          grantsByEmail[email] = {
            source: g.source || g.granted_by_admin || 'Manual Grant',
            granted_at: g.created_at,
          };
        }
      });

      const redemptionsByEmail: Record<string, { promo_code: string; redeemed_at: string }> = {};
      (redemptions || []).forEach((r) => {
        const email = r.redeemer_email?.toLowerCase();
        if (email) {
          redemptionsByEmail[email] = {
            promo_code: r.promo_code,
            redeemed_at: r.redeemed_at,
          };
        }
      });

      // Enrich active trials with source info
      const enrichedTrials = (activeTrials || []).map((trial) => {
        const email = trial.email?.toLowerCase();
        const grant = email ? grantsByEmail[email] : null;
        const redemption = email ? redemptionsByEmail[email] : null;

        // Determine source priority: promo code > trial grant > unknown
        let source = 'Unknown';
        let sourceDetail = null;

        if (redemption) {
          source = 'Promo Code';
          sourceDetail = redemption.promo_code;
        } else if (grant) {
          source = grant.source;
        }

        // Calculate days remaining
        const expiresAt = new Date(trial.promo_tier_expires_at);
        const daysRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        return {
          ...trial,
          source,
          source_detail: sourceDetail,
          days_remaining: daysRemaining,
        };
      });

      // Stats
      const stats = {
        total_active: enrichedTrials.length,
        from_promo: enrichedTrials.filter((t) => t.source === 'Promo Code').length,
        from_fb_outreach: enrichedTrials.filter((t) => t.source.toLowerCase().includes('fb') || t.source.toLowerCase().includes('facebook')).length,
        from_x_outreach: enrichedTrials.filter((t) => t.source.toLowerCase().includes('x') || t.source.toLowerCase().includes('twitter')).length,
        from_manual: enrichedTrials.filter((t) => t.source === 'Manual Grant' || t.source === 'Unknown').length,
      };

      return NextResponse.json({
        success: true,
        trials: enrichedTrials,
        stats,
      });
    }

    if (view === 'grants') {
      // Get all trial grants history
      const { data: grants, error } = await supabase
        .from('trial_grants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Enrich with current user status
      const emails = (grants || []).map((g) => g.user_email).filter(Boolean);

      let profileMap: Record<string, { tier: string; promo_tier_expires_at: string | null }> = {};
      if (emails.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email, tier, promo_tier_expires_at')
          .in('email', emails);

        (profiles || []).forEach((p) => {
          if (p.email) {
            profileMap[p.email.toLowerCase()] = {
              tier: p.tier,
              promo_tier_expires_at: p.promo_tier_expires_at,
            };
          }
        });
      }

      const enrichedGrants = (grants || []).map((grant) => {
        const profile = grant.user_email ? profileMap[grant.user_email.toLowerCase()] : null;
        const isActive = profile?.promo_tier_expires_at && new Date(profile.promo_tier_expires_at) > new Date();

        return {
          ...grant,
          current_tier: profile?.tier || 'unknown',
          trial_active: isActive,
          expires_at: profile?.promo_tier_expires_at,
        };
      });

      return NextResponse.json({
        success: true,
        grants: enrichedGrants,
        total: enrichedGrants.length,
      });
    }

    if (view === 'redemptions') {
      // Get all promo code redemptions
      const { data: redemptions, error } = await supabase
        .from('promo_code_redemptions')
        .select('*')
        .order('redeemed_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get promo code details
      const codes = [...new Set((redemptions || []).map((r) => r.promo_code))];

      let codeMap: Record<string, { description: string; tier_duration_days: number | null; discount_percent: number | null }> = {};
      if (codes.length > 0) {
        const { data: promoCodesData } = await supabase
          .from('promo_codes')
          .select('code, description, tier_duration_days, discount_percent')
          .in('code', codes);

        (promoCodesData || []).forEach((pc) => {
          codeMap[pc.code] = {
            description: pc.description,
            tier_duration_days: pc.tier_duration_days,
            discount_percent: pc.discount_percent,
          };
        });
      }

      // Get user tier info
      const emails = (redemptions || []).map((r) => r.redeemer_email).filter(Boolean);

      let profileMap: Record<string, { tier: string; promo_tier_expires_at: string | null }> = {};
      if (emails.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email, tier, promo_tier_expires_at')
          .in('email', emails);

        (profiles || []).forEach((p) => {
          if (p.email) {
            profileMap[p.email.toLowerCase()] = {
              tier: p.tier,
              promo_tier_expires_at: p.promo_tier_expires_at,
            };
          }
        });
      }

      const enrichedRedemptions = (redemptions || []).map((r) => {
        const codeInfo = codeMap[r.promo_code];
        const profile = r.redeemer_email ? profileMap[r.redeemer_email.toLowerCase()] : null;

        return {
          ...r,
          code_description: codeInfo?.description,
          code_type: codeInfo?.tier_duration_days ? 'trial' : 'discount',
          tier_duration_days: codeInfo?.tier_duration_days,
          discount_percent: codeInfo?.discount_percent,
          user_current_tier: profile?.tier,
          user_trial_expires: profile?.promo_tier_expires_at,
        };
      });

      // Stats
      const trialRedemptions = enrichedRedemptions.filter((r) => r.code_type === 'trial');
      const discountRedemptions = enrichedRedemptions.filter((r) => r.code_type === 'discount');

      return NextResponse.json({
        success: true,
        redemptions: enrichedRedemptions,
        stats: {
          total: enrichedRedemptions.length,
          trial_codes: trialRedemptions.length,
          discount_codes: discountRedemptions.length,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching trial data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
