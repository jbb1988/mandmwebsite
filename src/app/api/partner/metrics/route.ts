import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TOLT_API_KEY = process.env.TOLT_API_KEY;
const TOLT_PROGRAM_ID = process.env.TOLT_PROGRAM_ID;
const TOLT_API_BASE = 'https://api.tolt.com/v1';

interface ToltTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  partner_id: string;
  customer_id: string;
  created_at: string;
}

interface ToltCommission {
  id: string;
  amount: number;
  currency: string;
  status: string; // 'Approved', 'Pending', 'Rejected'
  partner_id: string;
  transaction_id: string;
  created_at: string;
  paid_at?: string;
  customer?: {
    email?: string;
    name?: string;
  };
}

interface EarningsTransaction {
  id: string;
  date: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  customerEmail?: string;
  paidAt?: string;
}

interface ToltClick {
  id: string;
  partner_id: string;
  link_id?: string;
  created_at: string;
}

async function fetchFromTolt(endpoint: string, params: Record<string, string> = {}) {
  if (!TOLT_API_KEY) {
    throw new Error('TOLT_API_KEY not configured');
  }

  if (!TOLT_PROGRAM_ID) {
    throw new Error('TOLT_PROGRAM_ID not configured');
  }

  const url = new URL(`${TOLT_API_BASE}${endpoint}`);
  // program_id is required for all list endpoints
  url.searchParams.append('program_id', TOLT_PROGRAM_ID);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${TOLT_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error(`Tolt API error ${response.status} for ${endpoint}:`, errorText);
    throw new Error(`Tolt API error: ${response.status}`);
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const { email, includeTransactions } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get partner's Tolt ID from our database
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('tolt_partner_id, email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    // If no Tolt partner ID, return zeros
    if (!partner.tolt_partner_id) {
      return NextResponse.json({
        totalEarnings: 0,
        pendingPayout: 0,
        totalReferrals: 0,
        totalClicks: 0,
        lastUpdated: new Date().toISOString(),
      });
    }

    // Check if we have cached metrics (less than 5 minutes old)
    const { data: cachedMetrics } = await supabase
      .from('partner_metrics_cache')
      .select('*')
      .eq('partner_email', email.toLowerCase().trim())
      .maybeSingle();

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (cachedMetrics && new Date(cachedMetrics.updated_at) > fiveMinutesAgo) {
      return NextResponse.json({
        totalEarnings: cachedMetrics.total_earnings,
        pendingPayout: cachedMetrics.pending_payout,
        totalReferrals: cachedMetrics.total_referrals,
        totalClicks: cachedMetrics.total_clicks || 0,
        lastUpdated: cachedMetrics.updated_at,
      });
    }

    // Fetch fresh data from Tolt
    let totalEarnings = 0;
    let pendingPayout = 0;
    let totalReferrals = 0;
    let totalClicks = 0;
    let earningsHistory: EarningsTransaction[] = [];

    try {
      // Fetch commissions
      const commissionsData = await fetchFromTolt('/commissions', {
        partner_id: partner.tolt_partner_id,
      });

      const commissions: ToltCommission[] = commissionsData.data || commissionsData || [];

      // Calculate earnings and build transaction history
      commissions.forEach((commission: ToltCommission) => {
        const amount = commission.amount / 100; // Convert cents to dollars
        let status: EarningsTransaction['status'] = 'pending';

        if (commission.status === 'Approved') {
          totalEarnings += amount;
          status = 'approved';
        } else if (commission.status === 'Pending') {
          pendingPayout += amount;
          status = 'pending';
        } else if (commission.status === 'Paid') {
          totalEarnings += amount;
          status = 'paid';
        } else if (commission.status === 'Rejected') {
          status = 'rejected';
        }

        // Build transaction record for history
        if (includeTransactions) {
          earningsHistory.push({
            id: commission.id,
            date: commission.created_at,
            amount,
            status,
            customerEmail: commission.customer?.email,
            paidAt: commission.paid_at,
          });
        }
      });

      // Sort transactions by date (newest first)
      if (includeTransactions) {
        earningsHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }

      // Fetch transactions to count referrals
      const transactionsData = await fetchFromTolt('/transactions', {
        partner_id: partner.tolt_partner_id,
      });

      const transactions: ToltTransaction[] = transactionsData.data || transactionsData || [];

      // Count unique customers as referrals
      const uniqueCustomers = new Set(transactions.map((t: ToltTransaction) => t.customer_id));
      totalReferrals = uniqueCustomers.size;

      // Note: Tolt API doesn't have a /clicks endpoint
      // Click tracking would need to be done via Tolt dashboard or webhooks
      totalClicks = 0;

    } catch (toltError) {
      console.error('Error fetching from Tolt:', toltError);
      // Return cached data if available, otherwise zeros
      if (cachedMetrics) {
        return NextResponse.json({
          totalEarnings: cachedMetrics.total_earnings,
          pendingPayout: cachedMetrics.pending_payout,
          totalReferrals: cachedMetrics.total_referrals,
          totalClicks: cachedMetrics.total_clicks || 0,
          lastUpdated: cachedMetrics.updated_at,
          error: 'Using cached data',
        });
      }
    }

    // Cache the metrics (upsert)
    await supabase
      .from('partner_metrics_cache')
      .upsert({
        partner_email: email.toLowerCase().trim(),
        total_earnings: totalEarnings,
        pending_payout: pendingPayout,
        total_referrals: totalReferrals,
        total_clicks: totalClicks,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'partner_email',
      });

    const response: {
      totalEarnings: number;
      pendingPayout: number;
      totalReferrals: number;
      totalClicks: number;
      lastUpdated: string;
      earningsHistory?: EarningsTransaction[];
    } = {
      totalEarnings,
      pendingPayout,
      totalReferrals,
      totalClicks,
      lastUpdated: new Date().toISOString(),
    };

    // Include transaction history if requested
    if (includeTransactions) {
      response.earningsHistory = earningsHistory;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in partner metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
