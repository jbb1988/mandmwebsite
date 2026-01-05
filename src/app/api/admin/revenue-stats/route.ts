import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus1018!';

// RevenueCat API config (optional - set in env for real-time data)
const REVENUECAT_SECRET_KEY = process.env.REVENUECAT_SECRET_API_KEY;
const REVENUECAT_PROJECT_ID = process.env.REVENUECAT_PROJECT_ID;

// Pro subscription price (6-month subscription)
const PRO_SUBSCRIPTION_PRICE = 29.99;

interface RevenueCatOverview {
  active_subscribers_count?: number;
  mrr?: { value: number; currency: string };
  revenue_last_28_days?: { value: number; currency: string };
  active_trials_count?: number;
}

// Fetch metrics from RevenueCat API v2 (if configured)
async function fetchRevenueCatMetrics(): Promise<RevenueCatOverview | null> {
  if (!REVENUECAT_SECRET_KEY || !REVENUECAT_PROJECT_ID) {
    console.log('RevenueCat not configured - missing API key or project ID');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.revenuecat.com/v2/projects/${REVENUECAT_PROJECT_ID}/metrics/overview`,
      {
        headers: {
          'Authorization': `Bearer ${REVENUECAT_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      // Only log to console, don't throw - gracefully degrade
      if (response.status === 401) {
        console.warn('RevenueCat API authentication failed - check REVENUECAT_SECRET_API_KEY env var');
      } else {
        console.error(`RevenueCat API error ${response.status}:`, errorText);
      }
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching RevenueCat metrics:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  // Verify admin password
  const password = request.headers.get('X-Admin-Password');
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Try to get real-time data from RevenueCat API
    const revenueCatData = await fetchRevenueCatMetrics();

    // Get subscription events from our database (future purchases will appear here)
    const { data: subscriptionEvents, error: subError } = await supabase
      .from('subscription_events')
      .select('*')
      .eq('is_sandbox', false)
      .order('created_at', { ascending: false });

    if (subError && subError.code !== 'PGRST116') {
      console.error('Subscription events error:', subError);
    }

    const subEvents = subscriptionEvents || [];

    // Calculate subscription revenue from logged events
    const subscriptionRevenue = {
      total: subEvents
        .filter(e => ['INITIAL_PURCHASE', 'RENEWAL'].includes(e.event_type))
        .reduce((sum, e) => sum + (e.price_usd || 0), 0),
      last30Days: subEvents
        .filter(e =>
          ['INITIAL_PURCHASE', 'RENEWAL'].includes(e.event_type) &&
          new Date(e.created_at) > thirtyDaysAgo
        )
        .reduce((sum, e) => sum + (e.price_usd || 0), 0),
      last7Days: subEvents
        .filter(e =>
          ['INITIAL_PURCHASE', 'RENEWAL'].includes(e.event_type) &&
          new Date(e.created_at) > sevenDaysAgo
        )
        .reduce((sum, e) => sum + (e.price_usd || 0), 0),
      newSubscribers: subEvents
        .filter(e => e.event_type === 'INITIAL_PURCHASE' && new Date(e.created_at) > thirtyDaysAgo)
        .length,
      renewals: subEvents
        .filter(e => e.event_type === 'RENEWAL' && new Date(e.created_at) > thirtyDaysAgo)
        .length,
      cancellations: subEvents
        .filter(e => e.event_type === 'CANCELLATION' && new Date(e.created_at) > thirtyDaysAgo)
        .length,
    };

    // Get credit purchases (these are accurate as they've always been logged)
    const { data: creditPurchases, error: creditError } = await supabase
      .from('swing_lab_credit_purchases')
      .select('*')
      .order('created_at', { ascending: false });

    if (creditError && creditError.code !== 'PGRST116') {
      console.error('Credit purchases error:', creditError);
    }

    const purchases = creditPurchases || [];
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

    // Get profile stats for trial tracking (this is still needed for trial management)
    const { data: subStats, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name, tier, promo_tier_expires_at, created_at')
      .order('created_at', { ascending: false });

    if (profileError) throw profileError;

    // Calculate trial metrics from profiles
    const activeTrials = subStats?.filter(u =>
      u.tier === 'pro' &&
      u.promo_tier_expires_at &&
      new Date(u.promo_tier_expires_at) > now
    ) || [];

    const expiringTrials = activeTrials.filter(u =>
      new Date(u.promo_tier_expires_at!) <= sevenDaysFromNow
    );

    const freeUsers = subStats?.filter(u =>
      u.tier === 'core' || !u.tier
    ) || [];

    // Determine which data source to use for main metrics
    let paidSubscribers: number;
    let estimatedMRR: number;
    let revenueLast28Days: number;
    let dataSource: 'revenuecat' | 'database' | 'estimated';

    if (revenueCatData) {
      // Use RevenueCat API data (most accurate)
      paidSubscribers = revenueCatData.active_subscribers_count || 0;
      estimatedMRR = revenueCatData.mrr?.value || 0;
      revenueLast28Days = revenueCatData.revenue_last_28_days?.value || 0;
      dataSource = 'revenuecat';
    } else if (subEvents.length > 0) {
      // Use our subscription_events table
      // Count unique users with active subscriptions (purchased but not cancelled/expired)
      const activeSubscriberIds = new Set<string>();
      const cancelledIds = new Set<string>();

      subEvents.forEach(e => {
        if (['CANCELLATION', 'EXPIRATION'].includes(e.event_type)) {
          cancelledIds.add(e.user_id);
        }
      });

      subEvents.forEach(e => {
        if (['INITIAL_PURCHASE', 'RENEWAL'].includes(e.event_type)) {
          if (!cancelledIds.has(e.user_id)) {
            activeSubscriberIds.add(e.user_id);
          }
        }
      });

      paidSubscribers = activeSubscriberIds.size;
      estimatedMRR = paidSubscribers * (PRO_SUBSCRIPTION_PRICE / 6);
      revenueLast28Days = subscriptionRevenue.last30Days;
      dataSource = 'database';
    } else {
      // Fallback: estimate from profiles (least accurate)
      const paidProUsers = subStats?.filter(u =>
        u.tier === 'pro' && !u.promo_tier_expires_at
      ) || [];
      paidSubscribers = paidProUsers.length;
      estimatedMRR = paidSubscribers * (PRO_SUBSCRIPTION_PRICE / 6);
      revenueLast28Days = 0;
      dataSource = 'estimated';
    }

    // Build recent activity feed
    const recentActivity: Array<{
      type: string;
      user: string;
      email: string;
      amount?: number;
      date: string;
      details?: string;
    }> = [];

    // Add subscription events to activity
    for (const event of subEvents.slice(0, 10)) {
      const user = subStats?.find(u => u.id === event.user_id);
      let activityType = 'subscription';
      let details = '';

      switch (event.event_type) {
        case 'INITIAL_PURCHASE':
          activityType = 'subscription';
          details = 'New Pro Subscription';
          break;
        case 'RENEWAL':
          activityType = 'renewal';
          details = 'Subscription Renewed';
          break;
        case 'CANCELLATION':
          activityType = 'cancellation';
          details = 'Subscription Cancelled';
          break;
        case 'EXPIRATION':
          activityType = 'expiration';
          details = 'Subscription Expired';
          break;
        default:
          activityType = 'subscription_event';
          details = event.event_type;
      }

      recentActivity.push({
        type: activityType,
        user: user?.name || 'Unknown',
        email: user?.email || event.user_id,
        amount: ['INITIAL_PURCHASE', 'RENEWAL'].includes(event.event_type) ? event.price_usd : undefined,
        date: event.created_at,
        details,
      });
    }

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

    // Get expiring trials with user details
    const expiringTrialsDetails = expiringTrials.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      expiresAt: u.promo_tier_expires_at,
      daysRemaining: Math.ceil(
        (new Date(u.promo_tier_expires_at!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));

    // Calculate conversion rate
    const totalTrialed = activeTrials.length + paidSubscribers;
    const conversionRate = totalTrialed > 0
      ? ((paidSubscribers / totalTrialed) * 100).toFixed(1)
      : '0';

    return NextResponse.json({
      success: true,
      dataSource, // Tell the UI where data is coming from
      stats: {
        totalUsers: subStats?.length || 0,
        paidSubscribers,
        activeTrials: activeTrials.length,
        expiringTrials: expiringTrials.length,
        freeUsers: freeUsers.length,
        estimatedMRR: estimatedMRR.toFixed(2),
        revenueLast28Days: revenueLast28Days.toFixed(2),
        subscriptionRevenue,
        creditRevenue,
        conversionRate,
      },
      expiringTrialsDetails,
      recentActivity: recentActivity.slice(0, 15),
      revenueCatConfigured: !!REVENUECAT_SECRET_KEY,
    });
  } catch (error) {
    console.error('Revenue stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue stats' },
      { status: 500 }
    );
  }
}
