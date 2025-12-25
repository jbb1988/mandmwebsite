import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  const adminPassword = request.headers.get('X-Admin-Password');
  const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  if (adminPassword !== expectedPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, name, tier, created_at')
      .eq('id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all AI calls for this user
    const { data: aiCalls } = await supabase
      .from('ai_api_calls')
      .select('feature_name, ai_service, model_name, estimated_cost, input_tokens, output_tokens, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Feature breakdown
    const featureMap = new Map<string, {
      callCount: number;
      totalCost: number;
      lastCallAt: string;
    }>();

    aiCalls?.forEach(row => {
      const existing = featureMap.get(row.feature_name) || {
        callCount: 0,
        totalCost: 0,
        lastCallAt: row.created_at
      };
      existing.callCount++;
      existing.totalCost += parseFloat(row.estimated_cost || 0);
      if (row.created_at > existing.lastCallAt) {
        existing.lastCallAt = row.created_at;
      }
      featureMap.set(row.feature_name, existing);
    });

    const featureBreakdown = Array.from(featureMap.entries()).map(([feature_name, data]) => ({
      feature_name,
      call_count: data.callCount,
      total_cost: data.totalCost,
      last_call_at: data.lastCallAt
    })).sort((a, b) => b.total_cost - a.total_cost);

    // Monthly history
    const monthlyMap = new Map<string, { cost: number; calls: number }>();
    aiCalls?.forEach(row => {
      const month = row.created_at.substring(0, 7);
      const existing = monthlyMap.get(month) || { cost: 0, calls: 0 };
      existing.cost += parseFloat(row.estimated_cost || 0);
      existing.calls++;
      monthlyMap.set(month, existing);
    });

    const monthlyHistory = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        cost: data.cost,
        calls: data.calls
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate totals
    const totalCost = aiCalls?.reduce((sum, r) => sum + parseFloat(r.estimated_cost || 0), 0) || 0;
    const totalCalls = aiCalls?.length || 0;

    // Subscription value (Pro = $29.99/6mo = ~$5/mo)
    const subscriptionValue = profile.tier === 'pro' ? 5.00 : 0;
    const profitMargin = subscriptionValue - totalCost;

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        tier: profile.tier,
        created_at: profile.created_at
      },
      totalCost,
      totalCalls,
      featureBreakdown,
      monthlyHistory,
      subscriptionValue,
      profitMargin
    });

  } catch (error) {
    console.error('User AI Costs API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch user AI costs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
