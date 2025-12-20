import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin, verifyAdminWithRateLimit } from '@/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // Rate limit POST requests (grants trial - critical endpoint)
  const auth = await verifyAdminWithRateLimit(request);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const {
      email,
      source, // 'fb_outreach' or 'x_outreach'
      source_record_id
    } = body;

    if (!email || !source || !source_record_id) {
      return NextResponse.json({
        success: false,
        message: 'Email, source, and source_record_id are required'
      }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user exists in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, tier, promo_tier_expires_at')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (profileError) {
      console.error('Profile lookup error:', profileError);
      return NextResponse.json({
        success: false,
        message: 'Database error looking up user'
      }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User must create an account first. Ask them to download the app and sign up with this email.'
      }, { status: 404 });
    }

    // 2. Check for existing active trial or pro subscription
    const now = new Date();
    if (profile.tier === 'pro') {
      // Check if it's a promo tier that hasn't expired
      if (profile.promo_tier_expires_at) {
        const expiresAt = new Date(profile.promo_tier_expires_at);
        if (expiresAt > now) {
          const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return NextResponse.json({
            success: false,
            code: 'TRIAL_ACTIVE',
            message: `User already has active Pro access (${daysRemaining} days remaining)`
          }, { status: 400 });
        }
      } else {
        // Paid pro subscription
        return NextResponse.json({
          success: false,
          code: 'ALREADY_PRO',
          message: 'User already has a paid Pro subscription'
        }, { status: 400 });
      }
    }

    // 3. Check for previous trial grant from this source
    const { data: existingGrant, error: grantCheckError } = await supabase
      .from('trial_grants')
      .select('id, granted_at, expires_at')
      .eq('user_email', normalizedEmail)
      .eq('granted_by_admin', source)
      .maybeSingle();

    if (grantCheckError) {
      console.error('Grant check error:', grantCheckError);
      return NextResponse.json({
        success: false,
        message: 'Database error checking existing grants'
      }, { status: 500 });
    }

    if (existingGrant) {
      const grantedDate = new Date(existingGrant.granted_at).toLocaleDateString();
      return NextResponse.json({
        success: false,
        code: 'TRIAL_ALREADY_GRANTED',
        message: `Trial was previously granted on ${grantedDate} from ${source}`
      }, { status: 400 });
    }

    // 4. Calculate trial dates
    const trialExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const gracePeriodEndsAt = new Date(trialExpiresAt.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days grace

    // 5. Update user's profile to Pro
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        tier: 'pro',
        promo_tier_expires_at: trialExpiresAt.toISOString(),
      })
      .eq('id', profile.id);

    if (updateProfileError) {
      console.error('Profile update error:', updateProfileError);
      return NextResponse.json({
        success: false,
        message: 'Failed to update user profile'
      }, { status: 500 });
    }

    // 6. Insert trial grant record
    const { error: insertGrantError } = await supabase
      .from('trial_grants')
      .insert({
        granted_by_admin: source,
        source_record_id,
        user_email: normalizedEmail,
        user_profile_id: profile.id,
        expires_at: trialExpiresAt.toISOString(),
        grace_period_ends_at: gracePeriodEndsAt.toISOString(),
      });

    if (insertGrantError) {
      console.error('Grant insert error:', insertGrantError);
      // Rollback profile update
      await supabase
        .from('profiles')
        .update({ tier: 'core', promo_tier_expires_at: null })
        .eq('id', profile.id);
      return NextResponse.json({
        success: false,
        message: 'Failed to record trial grant'
      }, { status: 500 });
    }

    // 7. Update the source record (fb_page_admins or x_target_accounts)
    const sourceTable = source === 'fb_outreach' ? 'fb_page_admins' : 'x_target_accounts';
    const { error: updateSourceError } = await supabase
      .from(sourceTable)
      .update({
        trial_granted_at: now.toISOString(),
        trial_granted_to_email: normalizedEmail,
        trial_expires_at: trialExpiresAt.toISOString(),
      })
      .eq('id', source_record_id);

    if (updateSourceError) {
      console.error('Source record update error:', updateSourceError);
      // Don't fail the whole operation for this
    }

    return NextResponse.json({
      success: true,
      message: `30-day Pro trial granted to ${normalizedEmail}`,
      trial: {
        email: normalizedEmail,
        granted_at: now.toISOString(),
        expires_at: trialExpiresAt.toISOString(),
        grace_period_ends_at: gracePeriodEndsAt.toISOString(),
      }
    });

  } catch (error) {
    console.error('Grant trial error:', error);
    const message = error instanceof Error ? error.message : 'Failed to grant trial';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// GET - Check trial status for a user
export async function GET(request: NextRequest) {
  // Read-only endpoint - use simple auth check
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Get profile info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, tier, promo_tier_expires_at')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({
        success: true,
        status: 'not_found',
        message: 'User has not created an account yet'
      });
    }

    // Get trial grants
    const { data: grants, error: grantsError } = await supabase
      .from('trial_grants')
      .select('*')
      .eq('user_email', normalizedEmail)
      .order('granted_at', { ascending: false });

    if (grantsError) {
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    }

    const now = new Date();
    let trialStatus = 'none';
    let daysRemaining = 0;

    if (profile.tier === 'pro' && profile.promo_tier_expires_at) {
      const expiresAt = new Date(profile.promo_tier_expires_at);
      if (expiresAt > now) {
        trialStatus = 'active';
        daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      } else {
        trialStatus = 'expired';
      }
    } else if (profile.tier === 'pro') {
      trialStatus = 'paid_pro';
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        tier: profile.tier,
        promo_tier_expires_at: profile.promo_tier_expires_at,
      },
      trial_status: trialStatus,
      days_remaining: daysRemaining,
      grants: grants || [],
    });

  } catch (error) {
    console.error('Get trial status error:', error);
    return NextResponse.json({ success: false, message: 'Failed to get trial status' }, { status: 500 });
  }
}
