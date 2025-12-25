import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Financials API - P&L Style Breakdown
 *
 * Provides comprehensive financial metrics:
 * - Revenue (gross, refunds, net)
 * - Cost of Goods Sold (AI costs, payment processing)
 * - Gross Profit
 * - Operating Expenses (infrastructure, services, tools)
 * - Net Income
 */

export async function GET(request: NextRequest) {
  const adminPassword = request.headers.get('X-Admin-Password');
  const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  if (adminPassword !== expectedPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get period from query params (default 30 days)
  const { searchParams } = new URL(request.url);
  const periodDays = parseInt(searchParams.get('period') || '30');
  const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  try {
    // ========================================
    // 1. REVENUE FROM SUBSCRIPTIONS
    // ========================================
    const { data: subscriptionEvents } = await supabase
      .from('subscription_events')
      .select('*')
      .gte('created_at', periodStart.toISOString())
      .order('created_at', { ascending: false });

    let grossRevenue = 0;
    let refunds = 0;
    const transactions: { date: string; product: string; amount: number; store: string; type: string }[] = [];

    subscriptionEvents?.forEach(event => {
      if (event.is_sandbox) return;

      const price = parseFloat(event.price_usd || 0);

      if (event.event_type === 'INITIAL_PURCHASE' && !event.is_trial) {
        grossRevenue += price;
        transactions.push({
          date: event.purchased_at,
          product: event.product_id,
          amount: price,
          store: event.store,
          type: 'purchase',
        });
      } else if (event.event_type === 'CANCELLATION' && event.refunded_at) {
        refunds += price;
        transactions.push({
          date: event.refunded_at,
          product: event.product_id,
          amount: -price,
          store: event.store,
          type: 'refund',
        });
      }
    });

    const netRevenue = grossRevenue - refunds;

    // ========================================
    // 2. AI COSTS (COGS)
    // ========================================
    const { data: aiCalls } = await supabase
      .from('ai_api_calls')
      .select('estimated_cost, model_name, feature_name, created_at')
      .gte('created_at', periodStart.toISOString());

    let aiCosts = 0;
    const aiCostsByModel: Record<string, number> = {};
    const aiCostsByFeature: Record<string, number> = {};

    aiCalls?.forEach(call => {
      const cost = parseFloat(call.estimated_cost || 0);
      aiCosts += cost;

      const model = call.model_name || 'unknown';
      aiCostsByModel[model] = (aiCostsByModel[model] || 0) + cost;

      const feature = call.feature_name || 'unknown';
      aiCostsByFeature[feature] = (aiCostsByFeature[feature] || 0) + cost;
    });

    // ========================================
    // 3. PAYMENT PROCESSING FEES (COGS)
    // ========================================
    // Stripe: 2.9% + $0.30 per transaction
    const stripePercentage = 0.029;
    const stripePerTransaction = 0.30;
    const transactionCount = transactions.filter(t => t.type === 'purchase').length;
    const paymentProcessingFees = (grossRevenue * stripePercentage) + (transactionCount * stripePerTransaction);

    // IAP fees (Apple/Google take 15% for small business program)
    const iapFeeRate = 0.15;
    const iapFees = grossRevenue * iapFeeRate;

    const totalCOGS = aiCosts + paymentProcessingFees + iapFees;
    const grossProfit = netRevenue - totalCOGS;
    const grossMarginPercent = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    // ========================================
    // 4. OPERATING EXPENSES
    // ========================================
    const { data: operationalCostsData } = await supabase
      .from('operational_costs')
      .select('*')
      .eq('is_active', true)
      .order('monthly_cost', { ascending: false });

    const operatingExpenses = {
      infrastructure: { amount: 0, providers: [] as string[] },
      services: { amount: 0, providers: [] as string[] },
      tools: { amount: 0, providers: [] as string[] },
      payments: { amount: 0, providers: [] as string[], isVariable: true },
      total: 0,
    };

    operationalCostsData?.forEach(cost => {
      const category = cost.category as 'infrastructure' | 'services' | 'tools' | 'payments';
      if (!cost.is_variable && category !== 'payments') {
        const monthlyAmount = parseFloat(cost.monthly_cost);
        // Pro-rate to the period (monthly_cost is normalized)
        const periodAmount = (monthlyAmount / 30) * periodDays;

        if (category === 'infrastructure' || category === 'services' || category === 'tools') {
          operatingExpenses[category].amount += periodAmount;
          operatingExpenses[category].providers.push(cost.provider);
        }
      }
      if (cost.is_variable && cost.category === 'payments') {
        operatingExpenses.payments.providers.push(cost.provider);
      }
    });

    operatingExpenses.total =
      operatingExpenses.infrastructure.amount +
      operatingExpenses.services.amount +
      operatingExpenses.tools.amount;

    // ========================================
    // 5. NET INCOME
    // ========================================
    const netIncome = grossProfit - operatingExpenses.total;
    const netMarginPercent = netRevenue > 0 ? (netIncome / netRevenue) * 100 : 0;

    // ========================================
    // 6. TRENDS (Compare to previous period)
    // ========================================
    const previousPeriodStart = new Date(periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Previous period revenue
    const { data: prevSubscriptions } = await supabase
      .from('subscription_events')
      .select('price_usd, event_type, is_trial, is_sandbox')
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', periodStart.toISOString());

    let prevRevenue = 0;
    prevSubscriptions?.forEach(event => {
      if (!event.is_sandbox && event.event_type === 'INITIAL_PURCHASE' && !event.is_trial) {
        prevRevenue += parseFloat(event.price_usd || 0);
      }
    });

    // Previous period AI costs
    const { data: prevAiCalls } = await supabase
      .from('ai_api_calls')
      .select('estimated_cost')
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', periodStart.toISOString());

    let prevAiCosts = 0;
    prevAiCalls?.forEach(call => {
      prevAiCosts += parseFloat(call.estimated_cost || 0);
    });

    const revenueMoM = prevRevenue > 0
      ? ((netRevenue - prevRevenue) / prevRevenue) * 100
      : netRevenue > 0 ? 100 : 0;

    const costsMoM = prevAiCosts > 0
      ? ((aiCosts - prevAiCosts) / prevAiCosts) * 100
      : aiCosts > 0 ? 100 : 0;

    // ========================================
    // 7. USER METRICS FOR CONTEXT
    // ========================================
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, tier')
      .eq('tier', 'pro');

    const proUserCount = profiles?.length || 0;

    // ========================================
    // RESPONSE
    // ========================================
    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      period: {
        days: periodDays,
        start: periodStart.toISOString(),
        end: new Date().toISOString(),
      },

      // Key Metrics (for top cards)
      summary: {
        netRevenue,
        totalCosts: totalCOGS + operatingExpenses.total,
        grossMarginPercent,
        netMarginPercent,
        proUserCount,
      },

      // P&L Breakdown
      pnl: {
        revenue: {
          gross: grossRevenue,
          refunds,
          net: netRevenue,
          transactions: transactions.length,
        },

        cogs: {
          aiCosts,
          aiCostsByModel,
          aiCostsByFeature,
          paymentProcessing: paymentProcessingFees,
          iapFees,
          total: totalCOGS,
        },

        grossProfit: {
          amount: grossProfit,
          marginPercent: grossMarginPercent,
        },

        operatingExpenses,

        netIncome: {
          amount: netIncome,
          marginPercent: netMarginPercent,
        },
      },

      // Trends
      trends: {
        revenueMoM,
        costsMoM,
        marginChange: 0, // Would need historical margin data
      },

      // Raw data for drill-downs
      operationalCosts: operationalCostsData || [],
      recentTransactions: transactions.slice(0, 10),
    });

  } catch (error) {
    console.error('Financials API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch financials',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
