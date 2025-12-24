import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin, verifyAdminWithRateLimit } from '@/lib/admin-auth';
import { logAdminAction, getRequestInfo } from '@/lib/admin-audit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Basic user fields returned in list query
interface UserListItem {
  id: string;
  email: string;
  name: string | null;
  tier: string;
  status: string | null;
  created_at: string;
  last_login_at: string | null;
  promo_tier_expires_at: string | null;
  organization_id: string | null;
  position: string | null;
  sport: string | null;
  app_version: string | null;
}

// Full user profile with all fields
interface UserProfile extends UserListItem {
  app_metadata: Record<string, unknown> | null;
  affiliate_code: string | null;
  referred_at: string | null;
}

interface TrialGrant {
  id: string;
  user_email: string;
  granted_by_admin: string;
  granted_at: string;
  expires_at: string;
  reminder_7_day_sent: boolean;
  reminder_3_day_sent: boolean;
  reminder_1_day_sent: boolean;
}

interface PromoRedemption {
  id: string;
  user_email: string;
  promo_code_id: string;
  redeemed_at: string;
  promo_codes?: {
    code: string;
    discount_percent: number | null;
    tier_duration_days: number | null;
  };
}

// GET: List all users with pagination, search, and filters
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tier = searchParams.get('tier') || 'all';
    const userStatus = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Fetch last_sign_in_at from auth.users (Supabase tracks this automatically)
    const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const authUserMap = new Map(
      (authUsers?.users || []).map(u => [u.id, u.last_sign_in_at])
    );

    // Build query
    let query = supabase
      .from('profiles')
      .select('id, email, name, tier, status, created_at, last_login_at, promo_tier_expires_at, organization_id, position, sport, app_version', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Apply tier filter
    if (tier !== 'all') {
      query = query.eq('tier', tier);
    }

    // Execute query
    const { data: users, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Process users to add computed status and real last_sign_in_at
    const now = new Date();
    const processedUsers = (users || []).map((user: UserListItem) => {
      let computedStatus = 'free';

      if (user.tier === 'pro') {
        if (user.promo_tier_expires_at) {
          const expiresAt = new Date(user.promo_tier_expires_at);
          if (expiresAt > now) {
            const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            computedStatus = `trial (${daysLeft}d)`;
          } else {
            computedStatus = 'expired';
          }
        } else {
          computedStatus = 'paid';
        }
      } else if (user.tier === 'core') {
        computedStatus = 'free';
      }

      // Get last_sign_in_at from auth.users map
      const lastSignInAt = authUserMap.get(user.id) || null;

      return {
        ...user,
        last_login_at: lastSignInAt,
        computedStatus,
      };
    });

    // Filter by status if specified (after processing)
    let filteredUsers = processedUsers;
    if (userStatus !== 'all') {
      switch (userStatus) {
        case 'trial':
          filteredUsers = processedUsers.filter((u) => u.computedStatus.startsWith('trial'));
          break;
        case 'paid':
          filteredUsers = processedUsers.filter((u) => u.computedStatus === 'paid');
          break;
        case 'free':
          filteredUsers = processedUsers.filter((u) => u.computedStatus === 'free');
          break;
        case 'expired':
          filteredUsers = processedUsers.filter((u) => u.computedStatus === 'expired');
          break;
      }
    }

    // Get tier stats
    const { data: tierStats } = await supabase
      .from('profiles')
      .select('tier')
      .not('tier', 'is', null);

    const stats = {
      total: count || 0,
      byTier: {
        core: (tierStats || []).filter((u: { tier: string }) => u.tier === 'core').length,
        pro: (tierStats || []).filter((u: { tier: string }) => u.tier === 'pro').length,
      },
    };

    return NextResponse.json({
      success: true,
      users: filteredUsers,
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Get user details or update user (rate limited)
export async function POST(request: NextRequest) {
  const auth = await verifyAdminWithRateLimit(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { action, userId, userEmail, tier, expiresAt, days } = await request.json();

    if (action === 'get-details') {
      // Get detailed user info including app_version, app_metadata
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get last_sign_in_at from auth.users
      const { data: authData } = await supabase.auth.admin.getUserById(userId);
      const lastSignInAt = authData?.user?.last_sign_in_at || null;

      // Fetch trial grants for this user
      const { data: trialGrants } = await supabase
        .from('trial_grants')
        .select('id, user_email, granted_by_admin, granted_at, expires_at, reminder_7_day_sent, reminder_3_day_sent, reminder_1_day_sent')
        .eq('user_email', user.email)
        .order('granted_at', { ascending: false });

      // Fetch promo code redemptions for this user
      const { data: promoRedemptions } = await supabase
        .from('promo_code_redemptions')
        .select('id, user_email, promo_code_id, redeemed_at, promo_codes(code, discount_percent, tier_duration_days)')
        .eq('user_email', user.email)
        .order('redeemed_at', { ascending: false });

      return NextResponse.json({
        success: true,
        user: {
          ...user,
          last_sign_in_at: lastSignInAt,
        },
        trialGrants: trialGrants || [],
        promoRedemptions: promoRedemptions || [],
      });
    }

    if (action === 'extend-trial') {
      // Extend trial by adding days to promo_tier_expires_at
      if (!userId || !days) {
        return NextResponse.json({ error: 'userId and days are required' }, { status: 400 });
      }

      // Get current expiration
      const { data: user, error: fetchError } = await supabase
        .from('profiles')
        .select('promo_tier_expires_at, tier')
        .eq('id', userId)
        .single();

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      // Calculate new expiration
      let newExpiration: Date;
      if (user.promo_tier_expires_at && new Date(user.promo_tier_expires_at) > new Date()) {
        // Extend from current expiration
        newExpiration = new Date(user.promo_tier_expires_at);
      } else {
        // Start from now
        newExpiration = new Date();
      }
      newExpiration.setDate(newExpiration.getDate() + parseInt(days));

      const { error } = await supabase
        .from('profiles')
        .update({
          tier: 'pro',
          promo_tier_expires_at: newExpiration.toISOString(),
        })
        .eq('id', userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log the action
      const { ipAddress, userAgent } = getRequestInfo(request.headers);
      await logAdminAction({
        action: 'extend_trial',
        targetType: 'user',
        targetId: userId,
        targetEmail: userEmail,
        details: { days, newExpiration: newExpiration.toISOString() },
        ipAddress,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        message: `Trial extended by ${days} days`,
        newExpiration: newExpiration.toISOString(),
      });
    }

    if (action === 'revoke-trial') {
      // Revoke trial - set tier to core and clear expiration
      if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          tier: 'core',
          promo_tier_expires_at: null,
        })
        .eq('id', userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log the action
      const { ipAddress, userAgent } = getRequestInfo(request.headers);
      await logAdminAction({
        action: 'revoke_trial',
        targetType: 'user',
        targetId: userId,
        targetEmail: userEmail,
        details: {},
        ipAddress,
        userAgent,
      });

      return NextResponse.json({ success: true, message: 'Trial revoked, user set to free tier' });
    }

    if (action === 'grant-trial') {
      // Grant a new trial
      if (!userId || !days) {
        return NextResponse.json({ error: 'userId and days are required' }, { status: 400 });
      }

      // Always fetch user email from profile to ensure trial_grants record is created
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (profileError || !userProfile?.email) {
        return NextResponse.json({ error: 'Could not find user email' }, { status: 500 });
      }

      const email = userEmail || userProfile.email;

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + parseInt(days));

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          tier: 'pro',
          promo_tier_expires_at: expirationDate.toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Always create trial_grant record - this triggers the trial gift email
      const { error: grantError } = await supabase
        .from('trial_grants')
        .insert({
          user_email: email,
          user_profile_id: userId,
          source_record_id: userId,
          granted_by_admin: 'Manual Grant (Admin)',
          granted_at: new Date().toISOString(),
          expires_at: expirationDate.toISOString(),
          grace_period_ends_at: new Date(expirationDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (grantError) {
        console.error('Error creating trial_grant record:', grantError);
        // Don't fail the request - profile was updated, email just won't be sent
      }

      // Log the action
      const { ipAddress, userAgent } = getRequestInfo(request.headers);
      await logAdminAction({
        action: 'grant_trial',
        targetType: 'user',
        targetId: userId,
        targetEmail: email,
        details: { days, expiresAt: expirationDate.toISOString() },
        ipAddress,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        message: `${days}-day trial granted`,
        expiresAt: expirationDate.toISOString(),
        emailTriggered: !grantError,
      });
    }

    if (action === 'update-tier') {
      // Update user tier (legacy action)
      const updateData: { tier: string; promo_tier_expires_at?: string | null } = { tier };

      if (expiresAt) {
        updateData.promo_tier_expires_at = expiresAt;
      } else if (tier === 'core') {
        updateData.promo_tier_expires_at = null;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'User tier updated' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in user management:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
