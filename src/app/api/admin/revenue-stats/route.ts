import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

// Pro subscription price (6-month subscription)
const PRO_SUBSCRIPTION_PRICE = 29.99;

export async function GET(request: NextRequest) {
  // Verify admin password
  const password = request.headers.get('X-Admin-Password');
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get subscription stats
    const { data: subStats, error: subError } = await supabase
      .from('profiles')
      .select('id, email, name, tier, promo_tier_expires_at, created_at')
      .order('created_at', { ascending: false });

    if (subError) throw subError;

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Calculate subscription metrics
    const paidProUsers = subStats?.filter(u =>
      u.tier === 'pro' && !u.promo_tier_expires_at
    ) || [];

    const activeTrials = subStats?.filter(u =>
      u.tier === 'pro' &&
      u.promo_tier_expires_at &&
      new Date(u.promo_tier_expires_at) > now
    ) || [];

    const expiringTrials = subStats?.filter(u =>
      u.tier === 'pro' &&
      u.promo_tier_expires_at &&
      new Date(u.promo_tier_expires_at) > now &&
      new Date(u.promo_tier_expires_at) <= sevenDaysFromNow
    ) || [];

    const freeUsers = subStats?.filter(u =>
      u.tier === 'core' || !u.tier
    ) || [];

    // Get credit purchases
    const { data: creditPurchases, error: creditError } = await supabase
      .from('swing_lab_credit_purchases')
      .select('*')
      .order('created_at', { ascending: false });

    if (creditError && creditError.code !== 'PGRST116') {
      console.error('Credit purchases error:', creditError);
    }

    const purchases = creditPurchases || [];
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const creditRevenue = {
      total: purchases.reduce((sum, p) => sum + (p.price_usd || 0), 0),
      last30Days: purchases
        .filter(p => new Date(p.created_at) > thirtyDaysAgo)
        .reduce((sum, p) => sum + (p.price_usd || 0), 0),
      last7Days: purchases
        .filter(p => new Date(p.created_at) > sevenDaysAgo)
        .reduce((sum, p) => sum + (p.price_usd || 0), 0),
      count: purchases.length,
    };

    // Estimate MRR (paid pro users * monthly equivalent)
    // Pro is $29.99 for 6 months = ~$5/month per user
    const estimatedMRR = paidProUsers.length * (PRO_SUBSCRIPTION_PRICE / 6);

    // Get recent conversions (users who became pro in last 30 days)
    const recentProUsers = subStats?.filter(u =>
      u.tier === 'pro' &&
      !u.promo_tier_expires_at &&
      new Date(u.created_at) > thirtyDaysAgo
    ) || [];

    // Get recent activity for the feed
    const recentActivity: Array<{
      type: string;
      user: string;
      email: string;
      amount?: number;
      date: string;
      details?: string;
    }> = [];

    // Add recent pro conversions to activity
    recentProUsers.forEach(u => {
      recentActivity.push({
        type: 'subscription',
        user: u.name || 'Unknown',
        email: u.email,
        amount: PRO_SUBSCRIPTION_PRICE,
        date: u.created_at,
        details: 'Pro Subscription (6 months)',
      });
    });

    // Add credit purchases to activity
    for (const purchase of purchases.slice(0, 10)) {
      const user = subStats?.find(u => u.id === purchase.user_id);
      recentActivity.push({
        type: 'credit_purchase',
        user: user?.name || 'Unknown',
        email: user?.email || 'unknown',
        amount: purchase.price_usd,
        date: purchase.created_at,
        details: `${purchase.credits_purchased} Swing Lab credits`,
      });
    }

    // Sort by date
    recentActivity.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Get expiring trials with user details for action items
    const expiringTrialsDetails = expiringTrials.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      expiresAt: u.promo_tier_expires_at,
      daysRemaining: Math.ceil(
        (new Date(u.promo_tier_expires_at!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: subStats?.length || 0,
        paidProUsers: paidProUsers.length,
        activeTrials: activeTrials.length,
        expiringTrials: expiringTrials.length,
        freeUsers: freeUsers.length,
        estimatedMRR: estimatedMRR.toFixed(2),
        creditRevenue,
        conversionRate: activeTrials.length > 0
          ? ((paidProUsers.length / (paidProUsers.length + activeTrials.length + freeUsers.length)) * 100).toFixed(1)
          : '0',
      },
      expiringTrialsDetails,
      recentActivity: recentActivity.slice(0, 10),
    });
  } catch (error) {
    console.error('Revenue stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue stats' },
      { status: 500 }
    );
  }
}
