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

interface UserProfile {
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

    // Build query
    let query = supabase
      .from('profiles')
      .select('id, email, name, tier, status, created_at, last_login_at, promo_tier_expires_at, organization_id, position, sport', { count: 'exact' })
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

    // Process users to add computed status
    const now = new Date();
    const processedUsers = (users || []).map((user: UserProfile) => {
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

      return {
        ...user,
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

// POST: Get user details or update user
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, userId, tier, expiresAt } = await request.json();

    if (action === 'get-details') {
      // Get detailed user info
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, user });
    }

    if (action === 'update-tier') {
      // Update user tier
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
