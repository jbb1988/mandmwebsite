import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus1018!';

interface DrillDownUser {
  id: string;
  name: string;
  email: string;
  tier: string;
  createdAt: string;
  lastActive?: string;
  engagement?: number;
  features?: number;
}

export async function GET(request: NextRequest) {
  const password = request.headers.get('X-Admin-Password');
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (!type) {
    return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 });
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get feature engagement data for all users
    const { data: engagementData } = await supabase
      .from('user_feature_engagement')
      .select('user_id, feature_name, total_opens, total_completions, last_used_at');

    const healthByUser: Record<string, {
      opens: number;
      completions: number;
      lastActive: Date | null;
      features: Set<string>;
    }> = {};

    (engagementData || []).forEach(h => {
      if (!healthByUser[h.user_id]) {
        healthByUser[h.user_id] = { opens: 0, completions: 0, lastActive: null, features: new Set() };
      }
      healthByUser[h.user_id].opens += h.total_opens || 0;
      healthByUser[h.user_id].completions += h.total_completions || 0;
      healthByUser[h.user_id].features.add(h.feature_name);
      if (h.last_used_at) {
        const lastUsed = new Date(h.last_used_at);
        if (!healthByUser[h.user_id].lastActive || lastUsed > healthByUser[h.user_id].lastActive!) {
          healthByUser[h.user_id].lastActive = lastUsed;
        }
      }
    });

    let users: DrillDownUser[] = [];

    switch (type) {
      case 'powerUsers': {
        // Power users: active in last 3 days with 20+ feature opens
        const { data: allUsers } = await supabase
          .from('profiles')
          .select('id, name, email, tier, created_at, last_login_at');

        users = (allUsers || [])
          .filter(u => {
            const health = healthByUser[u.id];
            if (!health || !health.lastActive) return false;
            const daysSinceActive = Math.floor((now.getTime() - health.lastActive.getTime()) / (1000 * 60 * 60 * 24));
            return daysSinceActive <= 3 && health.opens >= 20;
          })
          .map(u => ({
            id: u.id,
            name: u.name || 'Unknown',
            email: u.email,
            tier: u.tier || 'core',
            createdAt: u.created_at,
            lastActive: healthByUser[u.id]?.lastActive?.toISOString(),
            engagement: healthByUser[u.id]?.opens || 0,
            features: healthByUser[u.id]?.features?.size || 0,
          }))
          .sort((a, b) => (b.engagement || 0) - (a.engagement || 0));
        break;
      }

      case 'activeUsers': {
        // Active users: active in last 7 days
        const { data: allUsers } = await supabase
          .from('profiles')
          .select('id, name, email, tier, created_at, last_login_at');

        users = (allUsers || [])
          .filter(u => {
            const health = healthByUser[u.id];
            if (!health || !health.lastActive) return false;
            const daysSinceActive = Math.floor((now.getTime() - health.lastActive.getTime()) / (1000 * 60 * 60 * 24));
            return daysSinceActive <= 7 && !(daysSinceActive <= 3 && health.opens >= 20); // Exclude power users
          })
          .map(u => ({
            id: u.id,
            name: u.name || 'Unknown',
            email: u.email,
            tier: u.tier || 'core',
            createdAt: u.created_at,
            lastActive: healthByUser[u.id]?.lastActive?.toISOString(),
            engagement: healthByUser[u.id]?.opens || 0,
            features: healthByUser[u.id]?.features?.size || 0,
          }))
          .sort((a, b) => (b.engagement || 0) - (a.engagement || 0));
        break;
      }

      case 'atRiskUsers': {
        // At risk: 8-14 days inactive
        const { data: allUsers } = await supabase
          .from('profiles')
          .select('id, name, email, tier, created_at, last_login_at');

        users = (allUsers || [])
          .filter(u => {
            const health = healthByUser[u.id];
            if (!health || !health.lastActive) return false;
            const daysSinceActive = Math.floor((now.getTime() - health.lastActive.getTime()) / (1000 * 60 * 60 * 24));
            return daysSinceActive > 7 && daysSinceActive <= 14;
          })
          .map(u => ({
            id: u.id,
            name: u.name || 'Unknown',
            email: u.email,
            tier: u.tier || 'core',
            createdAt: u.created_at,
            lastActive: healthByUser[u.id]?.lastActive?.toISOString(),
            engagement: healthByUser[u.id]?.opens || 0,
            features: healthByUser[u.id]?.features?.size || 0,
          }))
          .sort((a, b) => new Date(a.lastActive || 0).getTime() - new Date(b.lastActive || 0).getTime());
        break;
      }

      case 'dormantUsers': {
        // Dormant: 14+ days inactive
        const { data: allUsers } = await supabase
          .from('profiles')
          .select('id, name, email, tier, created_at, last_login_at');

        users = (allUsers || [])
          .filter(u => {
            const health = healthByUser[u.id];
            if (!health || !health.lastActive) return false;
            const daysSinceActive = Math.floor((now.getTime() - health.lastActive.getTime()) / (1000 * 60 * 60 * 24));
            return daysSinceActive > 14;
          })
          .map(u => ({
            id: u.id,
            name: u.name || 'Unknown',
            email: u.email,
            tier: u.tier || 'core',
            createdAt: u.created_at,
            lastActive: healthByUser[u.id]?.lastActive?.toISOString(),
            engagement: healthByUser[u.id]?.opens || 0,
            features: healthByUser[u.id]?.features?.size || 0,
          }))
          .sort((a, b) => new Date(a.lastActive || 0).getTime() - new Date(b.lastActive || 0).getTime());
        break;
      }

      case 'trialUsers': {
        // Active trial users
        const { data: trialUsers } = await supabase
          .from('profiles')
          .select('id, name, email, tier, created_at, promo_tier_expires_at')
          .eq('tier', 'pro')
          .not('promo_tier_expires_at', 'is', null)
          .gt('promo_tier_expires_at', now.toISOString());

        users = (trialUsers || []).map(u => ({
          id: u.id,
          name: u.name || 'Unknown',
          email: u.email,
          tier: 'trial',
          createdAt: u.created_at,
          lastActive: healthByUser[u.id]?.lastActive?.toISOString(),
          engagement: healthByUser[u.id]?.opens || 0,
          features: healthByUser[u.id]?.features?.size || 0,
        }));
        break;
      }

      case 'paidUsers': {
        // Paid pro users (no trial)
        const { data: paidUsers } = await supabase
          .from('profiles')
          .select('id, name, email, tier, created_at')
          .eq('tier', 'pro')
          .is('promo_tier_expires_at', null);

        users = (paidUsers || []).map(u => ({
          id: u.id,
          name: u.name || 'Unknown',
          email: u.email,
          tier: 'pro',
          createdAt: u.created_at,
          lastActive: healthByUser[u.id]?.lastActive?.toISOString(),
          engagement: healthByUser[u.id]?.opens || 0,
          features: healthByUser[u.id]?.features?.size || 0,
        }));
        break;
      }

      case 'recentSignups':
      case 'funnelSignups': {
        // Signups in last 30 days
        const { data: recentUsers } = await supabase
          .from('profiles')
          .select('id, name, email, tier, created_at')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false });

        users = (recentUsers || []).map(u => ({
          id: u.id,
          name: u.name || 'Unknown',
          email: u.email,
          tier: u.tier || 'core',
          createdAt: u.created_at,
          lastActive: healthByUser[u.id]?.lastActive?.toISOString(),
          engagement: healthByUser[u.id]?.opens || 0,
          features: healthByUser[u.id]?.features?.size || 0,
        }));
        break;
      }

      case 'funnelOnboarded': {
        // Users who completed onboarding (activity within 24 hours of signup)
        const { data: recentUsers } = await supabase
          .from('profiles')
          .select('id, name, email, tier, created_at')
          .gte('created_at', thirtyDaysAgo.toISOString());

        users = (recentUsers || [])
          .filter(u => {
            const signupDate = new Date(u.created_at);
            const health = healthByUser[u.id];
            if (!health || !health.lastActive) return false;
            const hours = (health.lastActive.getTime() - signupDate.getTime()) / (1000 * 60 * 60);
            return hours > 0 && hours <= 24;
          })
          .map(u => ({
            id: u.id,
            name: u.name || 'Unknown',
            email: u.email,
            tier: u.tier || 'core',
            createdAt: u.created_at,
            lastActive: healthByUser[u.id]?.lastActive?.toISOString(),
            engagement: healthByUser[u.id]?.opens || 0,
            features: healthByUser[u.id]?.features?.size || 0,
          }));
        break;
      }

      case 'funnelTrial': {
        // Users who started a trial in the last 30 days
        const { data: trialUsers } = await supabase
          .from('profiles')
          .select('id, name, email, tier, created_at, promo_tier_expires_at')
          .not('promo_tier_expires_at', 'is', null)
          .gte('created_at', thirtyDaysAgo.toISOString());

        users = (trialUsers || []).map(u => ({
          id: u.id,
          name: u.name || 'Unknown',
          email: u.email,
          tier: 'trial',
          createdAt: u.created_at,
          lastActive: healthByUser[u.id]?.lastActive?.toISOString(),
          engagement: healthByUser[u.id]?.opens || 0,
          features: healthByUser[u.id]?.features?.size || 0,
        }));
        break;
      }

      case 'funnelEngaged': {
        // Users who used 3+ features in last 30 days
        const { data: recentUsers } = await supabase
          .from('profiles')
          .select('id, name, email, tier, created_at')
          .gte('created_at', thirtyDaysAgo.toISOString());

        users = (recentUsers || [])
          .filter(u => (healthByUser[u.id]?.features?.size || 0) >= 3)
          .map(u => ({
            id: u.id,
            name: u.name || 'Unknown',
            email: u.email,
            tier: u.tier || 'core',
            createdAt: u.created_at,
            lastActive: healthByUser[u.id]?.lastActive?.toISOString(),
            engagement: healthByUser[u.id]?.opens || 0,
            features: healthByUser[u.id]?.features?.size || 0,
          }))
          .sort((a, b) => (b.features || 0) - (a.features || 0));
        break;
      }

      case 'funnelConverted': {
        // Users who converted to paid in last 30 days
        const { data: subscriptionEvents } = await supabase
          .from('subscription_events')
          .select('user_id, created_at')
          .eq('event_type', 'INITIAL_PURCHASE')
          .gte('created_at', thirtyDaysAgo.toISOString());

        const convertedUserIds = new Set((subscriptionEvents || []).map(e => e.user_id));

        const { data: convertedUsers } = await supabase
          .from('profiles')
          .select('id, name, email, tier, created_at')
          .in('id', Array.from(convertedUserIds));

        users = (convertedUsers || []).map(u => ({
          id: u.id,
          name: u.name || 'Unknown',
          email: u.email,
          tier: 'pro',
          createdAt: u.created_at,
          lastActive: healthByUser[u.id]?.lastActive?.toISOString(),
          engagement: healthByUser[u.id]?.opens || 0,
          features: healthByUser[u.id]?.features?.size || 0,
        }));
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('Drill-down error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drill-down data' },
      { status: 500 }
    );
  }
}
