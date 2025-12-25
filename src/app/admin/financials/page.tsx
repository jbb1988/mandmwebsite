'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Settings,
  Server,
  Wrench,
  CreditCard,
  Cpu,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Pencil,
  Trash2,
  Target,
  Users,
  Mail,
  MousePointer,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface FinancialsData {
  success: boolean;
  generatedAt: string;
  period: {
    days: number;
    start: string;
    end: string;
  };
  summary: {
    netRevenue: number;
    totalCosts: number;
    grossMarginPercent: number;
    netMarginPercent: number;
    proUserCount: number;
  };
  pnl: {
    revenue: {
      gross: number;
      refunds: number;
      net: number;
      transactions: number;
    };
    cogs: {
      aiCosts: number;
      aiCostsByModel: Record<string, number>;
      aiCostsByFeature: Record<string, number>;
      paymentProcessing: number;
      iapFees: number;
      total: number;
    };
    grossProfit: {
      amount: number;
      marginPercent: number;
    };
    operatingExpenses: {
      infrastructure: { amount: number; providers: string[] };
      services: { amount: number; providers: string[] };
      tools: { amount: number; providers: string[] };
      payments: { amount: number; providers: string[]; isVariable: boolean };
      total: number;
    };
    netIncome: {
      amount: number;
      marginPercent: number;
    };
  };
  trends: {
    revenueMoM: number;
    costsMoM: number;
    marginChange: number;
  };
  operationalCosts: OperationalCost[];
}

interface OperationalCost {
  id: string;
  provider: string;
  monthly_cost: number;
  actual_cost: number;
  billing_cycle: 'monthly' | 'biannual' | 'annual';
  category: string;
  description: string | null;
  notes: string | null;
  is_variable: boolean;
  is_active: boolean;
}

interface CampaignData {
  totalContacts: number;
  totalSent: number;
  openRate: number;
  clickRate: number;
  calendlyBookings: number;
  contactsInApp: number;
}

interface ForecastInputs {
  projectedSubscribers: number;
  conversionRate: number;
  avgRevenuePerSub: number;
  targetNetProfit: number | null;
}

export default function FinancialsPage() {
  const { getPassword } = useAdminAuth();
  const password = getPassword();
  const router = useRouter();
  const [data, setData] = useState<FinancialsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodDays, setPeriodDays] = useState(30);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showForecast, setShowForecast] = useState(true);

  // Forecasting state
  const [campaignData, setCampaignData] = useState<CampaignData>({
    totalContacts: 0,
    totalSent: 0,
    openRate: 0,
    clickRate: 0,
    calendlyBookings: 0,
    contactsInApp: 0,
  });
  const [forecast, setForecast] = useState<ForecastInputs>({
    projectedSubscribers: 10,
    conversionRate: 2.0,
    avgRevenuePerSub: 49.99,
    targetNetProfit: null,
  });
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  // Operational costs modal
  const [showOpsModal, setShowOpsModal] = useState(false);
  const [editingCost, setEditingCost] = useState<OperationalCost | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<{
    provider: string;
    actual_cost: string;
    billing_cycle: 'monthly' | 'biannual' | 'annual';
    category: string;
    description: string;
    notes: string;
    is_variable: boolean;
  }>({
    provider: '',
    actual_cost: '',
    billing_cycle: 'monthly',
    category: 'infrastructure',
    description: '',
    notes: '',
    is_variable: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/financials?period=${periodDays}`, {
        headers: { 'X-Admin-Password': password },
      });

      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignData = async () => {
    setLoadingCampaigns(true);
    try {
      const res = await fetch('/api/admin/campaigns', {
        headers: { 'X-Admin-Password': password },
      });
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      const json = await res.json();

      // Extract conversion funnel data
      const summary = json.summary || {};
      const funnel = json.conversionFunnel || {};

      setCampaignData({
        totalContacts: summary.totalContacts || 0,
        totalSent: summary.totalSent || 0,
        openRate: summary.overallOpenRate || 0,
        clickRate: summary.overallClickRate || 0,
        calendlyBookings: funnel.calendlyBookings || 0,
        contactsInApp: funnel.contactsInApp || 0,
      });

      // Auto-calculate conversion rate from funnel
      if (funnel.calendlyBookings > 0 && summary.totalContacts > 0) {
        const convRate = (funnel.contactsInApp / summary.totalContacts) * 100;
        setForecast(prev => ({ ...prev, conversionRate: Math.round(convRate * 10) / 10 }));
      }
    } catch (err) {
      console.error('Error fetching campaign data:', err);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCampaignData();
  }, [periodDays, password]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-white/30" />;
  };

  const handleAddCost = async () => {
    try {
      const res = await fetch('/api/admin/ai-costs/operational-costs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to add cost');

      setShowAddForm(false);
      setFormData({
        provider: '',
        actual_cost: '',
        billing_cycle: 'monthly',
        category: 'infrastructure',
        description: '',
        notes: '',
        is_variable: false,
      });
      fetchData();
    } catch (err) {
      console.error('Error adding cost:', err);
    }
  };

  const handleUpdateCost = async () => {
    if (!editingCost) return;

    try {
      const res = await fetch('/api/admin/ai-costs/operational-costs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({
          id: editingCost.id,
          ...formData,
        }),
      });

      if (!res.ok) throw new Error('Failed to update cost');

      setEditingCost(null);
      fetchData();
    } catch (err) {
      console.error('Error updating cost:', err);
    }
  };

  const handleDeleteCost = async (id: string) => {
    if (!confirm('Are you sure you want to remove this cost?')) return;

    try {
      const res = await fetch(`/api/admin/ai-costs/operational-costs?id=${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': password },
      });

      if (!res.ok) throw new Error('Failed to delete cost');
      fetchData();
    } catch (err) {
      console.error('Error deleting cost:', err);
    }
  };

  const startEdit = (cost: OperationalCost) => {
    setEditingCost(cost);
    setFormData({
      provider: cost.provider,
      actual_cost: String(cost.actual_cost || cost.monthly_cost),
      billing_cycle: cost.billing_cycle || 'monthly',
      category: cost.category,
      description: cost.description || '',
      notes: cost.notes || '',
      is_variable: cost.is_variable,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0B14] p-6 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0A0B14] p-6 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0B14] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Financials</h1>
            <p className="text-white/50 text-sm">P&L Breakdown</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Period Selector */}
            <div className="flex gap-1 bg-[#1A1B2E] rounded-lg p-1">
              {[7, 30, 90].map(days => (
                <button
                  key={days}
                  onClick={() => setPeriodDays(days)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    periodDays === days
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>

            <button
              onClick={fetchData}
              className="p-2 bg-[#1A1B2E] hover:bg-[#252642] rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-white/50" />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          {/* Net Revenue */}
          <div className="bg-[#1A1B2E] rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/50 text-sm">Net Revenue</span>
              <TrendIcon value={data.trends.revenueMoM} />
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(data.summary.netRevenue)}
            </div>
            <div className={`text-xs mt-1 ${data.trends.revenueMoM >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercent(data.trends.revenueMoM)} vs prev period
            </div>
          </div>

          {/* Total Costs */}
          <div className="bg-[#1A1B2E] rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/50 text-sm">Total Costs</span>
              <TrendIcon value={-data.trends.costsMoM} />
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(data.summary.totalCosts)}
            </div>
            <div className={`text-xs mt-1 ${data.trends.costsMoM <= 0 ? 'text-green-400' : 'text-orange-400'}`}>
              {formatPercent(data.trends.costsMoM)} vs prev period
            </div>
          </div>

          {/* Gross Margin */}
          <div className="bg-[#1A1B2E] rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/50 text-sm">Gross Margin</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {data.summary.grossMarginPercent.toFixed(1)}%
            </div>
            <div className="text-xs mt-1 text-white/30">
              After COGS
            </div>
          </div>

          {/* Net Margin */}
          <div className="bg-[#1A1B2E] rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/50 text-sm">Net Margin</span>
            </div>
            <div className={`text-2xl font-bold ${data.summary.netMarginPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.summary.netMarginPercent.toFixed(1)}%
            </div>
            <div className="text-xs mt-1 text-white/30">
              After all expenses
            </div>
          </div>
        </div>

        {/* P&L Breakdown */}
        <div className="bg-[#1A1B2E] rounded-xl border border-white/5 overflow-hidden">
          {/* REVENUE Section */}
          <div className="border-b border-white/10">
            <div className="px-6 py-4 bg-green-500/5">
              <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider">Revenue</h3>
            </div>
            <div className="px-6 py-3 flex justify-between items-center hover:bg-white/5">
              <span className="text-white/70">Gross Revenue (Subscriptions)</span>
              <span className="text-white font-medium">{formatCurrency(data.pnl.revenue.gross)}</span>
            </div>
            <div className="px-6 py-3 flex justify-between items-center hover:bg-white/5">
              <span className="text-white/70">- Refunds</span>
              <span className="text-red-400">-{formatCurrency(data.pnl.revenue.refunds)}</span>
            </div>
            <div className="px-6 py-3 flex justify-between items-center bg-white/5 border-t border-white/10">
              <span className="text-white font-medium">Net Revenue</span>
              <span className="text-white font-bold">{formatCurrency(data.pnl.revenue.net)}</span>
            </div>
          </div>

          {/* COGS Section */}
          <div className="border-b border-white/10">
            <div className="px-6 py-4 bg-orange-500/5">
              <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Cost of Goods Sold</h3>
            </div>
            <button
              onClick={() => router.push('/admin/ai-costs')}
              className="w-full px-6 py-3 flex justify-between items-center hover:bg-white/5 group"
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-white/40" />
                <span className="text-white/70">AI Costs (OpenAI, Google, Anthropic)</span>
                <ArrowRight className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-white font-medium">{formatCurrency(data.pnl.cogs.aiCosts)}</span>
            </button>
            <div className="px-6 py-3 flex justify-between items-center hover:bg-white/5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-white/40" />
                <span className="text-white/70">Payment Processing (Stripe ~2.9%)</span>
              </div>
              <span className="text-white font-medium">{formatCurrency(data.pnl.cogs.paymentProcessing)}</span>
            </div>
            <div className="px-6 py-3 flex justify-between items-center hover:bg-white/5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-white/40" />
                <span className="text-white/70">IAP Fees (Apple/Google 15%)</span>
              </div>
              <span className="text-white font-medium">{formatCurrency(data.pnl.cogs.iapFees)}</span>
            </div>
            <div className="px-6 py-3 flex justify-between items-center bg-white/5 border-t border-white/10">
              <span className="text-white font-medium">Total COGS</span>
              <span className="text-white font-bold">{formatCurrency(data.pnl.cogs.total)}</span>
            </div>
          </div>

          {/* GROSS PROFIT */}
          <div className="px-6 py-4 flex justify-between items-center bg-cyan-500/10 border-b border-white/10">
            <span className="text-cyan-400 font-semibold uppercase text-sm">Gross Profit</span>
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm">({data.pnl.grossProfit.marginPercent.toFixed(1)}%)</span>
              <span className="text-cyan-400 font-bold text-lg">{formatCurrency(data.pnl.grossProfit.amount)}</span>
            </div>
          </div>

          {/* OPERATING EXPENSES Section */}
          <div className="border-b border-white/10">
            <div className="px-6 py-4 bg-purple-500/5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Operating Expenses</h3>
              <button
                onClick={() => setShowOpsModal(true)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Manage operating expenses"
              >
                <Settings className="w-4 h-4 text-purple-400" />
              </button>
            </div>
            <button
              onClick={() => setExpandedSection(expandedSection === 'infrastructure' ? null : 'infrastructure')}
              className="w-full px-6 py-3 flex justify-between items-center hover:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-white/40" />
                <span className="text-white/70">Infrastructure</span>
                <span className="text-white/30 text-xs">
                  {data.pnl.operatingExpenses.infrastructure.providers.join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{formatCurrency(data.pnl.operatingExpenses.infrastructure.amount)}</span>
                {expandedSection === 'infrastructure' ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
              </div>
            </button>
            <button
              onClick={() => setExpandedSection(expandedSection === 'services' ? null : 'services')}
              className="w-full px-6 py-3 flex justify-between items-center hover:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-white/40" />
                <span className="text-white/70">Services</span>
                <span className="text-white/30 text-xs">
                  {data.pnl.operatingExpenses.services.providers.join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{formatCurrency(data.pnl.operatingExpenses.services.amount)}</span>
                {expandedSection === 'services' ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
              </div>
            </button>
            <button
              onClick={() => setExpandedSection(expandedSection === 'tools' ? null : 'tools')}
              className="w-full px-6 py-3 flex justify-between items-center hover:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-white/40" />
                <span className="text-white/70">Tools</span>
                <span className="text-white/30 text-xs">
                  {data.pnl.operatingExpenses.tools.providers.join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{formatCurrency(data.pnl.operatingExpenses.tools.amount)}</span>
                {expandedSection === 'tools' ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
              </div>
            </button>
            <div className="px-6 py-3 flex justify-between items-center bg-white/5 border-t border-white/10">
              <span className="text-white font-medium">Total Operating Expenses</span>
              <span className="text-white font-bold">{formatCurrency(data.pnl.operatingExpenses.total)}</span>
            </div>
          </div>

          {/* NET INCOME */}
          <div className={`px-6 py-5 flex justify-between items-center ${data.pnl.netIncome.amount >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <span className={`font-bold uppercase text-sm ${data.pnl.netIncome.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              Net Income
            </span>
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm">({data.pnl.netIncome.marginPercent.toFixed(1)}%)</span>
              <span className={`font-bold text-xl ${data.pnl.netIncome.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(data.pnl.netIncome.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/admin/ai-costs')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A1B2E] hover:bg-[#252642] rounded-xl border border-white/5 transition-colors"
          >
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span className="text-white">AI Cost Analysis</span>
            <ArrowRight className="w-4 h-4 text-white/30" />
          </button>
          <button
            onClick={() => setShowOpsModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A1B2E] hover:bg-[#252642] rounded-xl border border-white/5 transition-colors"
          >
            <Settings className="w-5 h-5 text-purple-400" />
            <span className="text-white">Manage Operating Expenses</span>
            <ArrowRight className="w-4 h-4 text-white/30" />
          </button>
        </div>

        {/* Revenue Forecast Section */}
        <div className="bg-[#1A1B2E] rounded-xl border border-white/5 overflow-hidden">
          <button
            onClick={() => setShowForecast(!showForecast)}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-purple-500/10"
          >
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Revenue Forecast</h3>
              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                Campaign-Driven
              </span>
            </div>
            {showForecast ? (
              <ChevronUp className="w-5 h-5 text-white/30" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/30" />
            )}
          </button>

          {showForecast && (
            <div className="p-6 space-y-6">
              {/* Forecast Inputs */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-white/70 uppercase tracking-wider">Forecast Inputs</h4>
                  <button
                    onClick={fetchCampaignData}
                    disabled={loadingCampaigns}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingCampaigns ? 'animate-spin' : ''}`} />
                    Refresh from Campaigns
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#252642] rounded-xl p-4">
                    <label className="block text-white/50 text-xs mb-2">
                      <Users className="w-3 h-3 inline mr-1" />
                      Projected New Subs
                    </label>
                    <input
                      type="number"
                      value={forecast.projectedSubscribers}
                      onChange={e => setForecast({ ...forecast, projectedSubscribers: parseInt(e.target.value) || 0 })}
                      className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none"
                    />
                    <p className="text-white/30 text-xs mt-1">per month</p>
                  </div>
                  <div className="bg-[#252642] rounded-xl p-4">
                    <label className="block text-white/50 text-xs mb-2">
                      <UserCheck className="w-3 h-3 inline mr-1" />
                      Conversion Rate
                    </label>
                    <div className="flex items-baseline gap-1">
                      <input
                        type="number"
                        step="0.1"
                        value={forecast.conversionRate}
                        onChange={e => setForecast({ ...forecast, conversionRate: parseFloat(e.target.value) || 0 })}
                        className="w-20 bg-transparent text-2xl font-bold text-white focus:outline-none"
                      />
                      <span className="text-white/50 text-lg">%</span>
                    </div>
                    <p className="text-white/30 text-xs mt-1">from campaigns</p>
                  </div>
                  <div className="bg-[#252642] rounded-xl p-4">
                    <label className="block text-white/50 text-xs mb-2">
                      <DollarSign className="w-3 h-3 inline mr-1" />
                      Avg Revenue/Sub
                    </label>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white/50 text-lg">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={forecast.avgRevenuePerSub}
                        onChange={e => setForecast({ ...forecast, avgRevenuePerSub: parseFloat(e.target.value) || 0 })}
                        className="w-24 bg-transparent text-2xl font-bold text-white focus:outline-none"
                      />
                    </div>
                    <p className="text-white/30 text-xs mt-1">Pro annual</p>
                  </div>
                </div>
              </div>

              {/* Campaign Funnel */}
              <div>
                <h4 className="text-sm font-medium text-white/70 uppercase tracking-wider mb-4">Campaign Funnel</h4>
                <div className="flex items-center justify-between bg-[#252642] rounded-xl p-4">
                  <div className="text-center flex-1">
                    <Mail className="w-5 h-5 text-white/40 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{campaignData.totalContacts.toLocaleString()}</div>
                    <div className="text-xs text-white/40">Contacts</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20" />
                  <div className="text-center flex-1">
                    <Mail className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{campaignData.openRate.toFixed(1)}%</div>
                    <div className="text-xs text-white/40">Open Rate</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20" />
                  <div className="text-center flex-1">
                    <MousePointer className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{campaignData.clickRate.toFixed(1)}%</div>
                    <div className="text-xs text-white/40">Click Rate</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20" />
                  <div className="text-center flex-1">
                    <Calendar className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">{campaignData.calendlyBookings}</div>
                    <div className="text-xs text-white/40">Bookings</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20" />
                  <div className="text-center flex-1">
                    <UserCheck className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-green-400">{campaignData.contactsInApp}</div>
                    <div className="text-xs text-white/40">Converted</div>
                  </div>
                </div>
              </div>

              {/* Projected P&L */}
              {(() => {
                const projectedRevenue = forecast.projectedSubscribers * forecast.avgRevenuePerSub;
                const aiCostPerUser = data.summary.proUserCount > 0
                  ? data.pnl.cogs.aiCosts / data.summary.proUserCount
                  : 1.80;
                const projectedAiCosts = forecast.projectedSubscribers * aiCostPerUser;
                const projectedPaymentFees = projectedRevenue * 0.029;
                const projectedIapFees = projectedRevenue * 0.15;
                const fixedOpEx = data.pnl.operatingExpenses.total;
                const projectedNetProfit = projectedRevenue - projectedAiCosts - projectedPaymentFees - projectedIapFees - fixedOpEx;
                const projectedMargin = projectedRevenue > 0 ? (projectedNetProfit / projectedRevenue) * 100 : 0;

                // Target mode calculations
                const targetProfit = forecast.targetNetProfit;
                const netRevenuePerSub = forecast.avgRevenuePerSub * (1 - 0.029 - 0.15) - aiCostPerUser;
                const subscribersForTarget = targetProfit !== null && netRevenuePerSub > 0
                  ? Math.ceil((targetProfit + fixedOpEx) / netRevenuePerSub)
                  : null;

                return (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-white/70 uppercase tracking-wider">Projected P&L (Monthly)</h4>
                    <div className="bg-[#252642] rounded-xl overflow-hidden">
                      <div className="px-4 py-3 flex justify-between items-center border-b border-white/5">
                        <span className="text-white/70">Projected Revenue</span>
                        <span className="text-white font-medium">{formatCurrency(projectedRevenue)}</span>
                      </div>
                      <div className="px-4 py-3 flex justify-between items-center border-b border-white/5">
                        <span className="text-white/50 text-sm pl-4">- AI Costs ({forecast.projectedSubscribers} × {formatCurrency(aiCostPerUser)}/user)</span>
                        <span className="text-orange-400 text-sm">-{formatCurrency(projectedAiCosts)}</span>
                      </div>
                      <div className="px-4 py-3 flex justify-between items-center border-b border-white/5">
                        <span className="text-white/50 text-sm pl-4">- Payment Fees (2.9%)</span>
                        <span className="text-orange-400 text-sm">-{formatCurrency(projectedPaymentFees)}</span>
                      </div>
                      <div className="px-4 py-3 flex justify-between items-center border-b border-white/5">
                        <span className="text-white/50 text-sm pl-4">- IAP Fees (15%)</span>
                        <span className="text-orange-400 text-sm">-{formatCurrency(projectedIapFees)}</span>
                      </div>
                      <div className="px-4 py-3 flex justify-between items-center border-b border-white/5">
                        <span className="text-white/50 text-sm pl-4">- Fixed OpEx</span>
                        <span className="text-orange-400 text-sm">-{formatCurrency(fixedOpEx)}</span>
                      </div>
                      <div className={`px-4 py-4 flex justify-between items-center ${projectedNetProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        <span className={`font-semibold ${projectedNetProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          Projected Net Profit
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-white/50 text-sm">({projectedMargin.toFixed(1)}%)</span>
                          <span className={`font-bold text-lg ${projectedNetProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(projectedNetProfit)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Target Mode */}
                    <div className="bg-[#252642] rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-400" />
                          <span className="text-white/70 text-sm">Target Net Profit</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/50">$</span>
                          <input
                            type="number"
                            placeholder="1000"
                            value={forecast.targetNetProfit ?? ''}
                            onChange={e => setForecast({ ...forecast, targetNetProfit: e.target.value ? parseFloat(e.target.value) : null })}
                            className="w-24 bg-[#1A1B2E] px-3 py-1.5 rounded-lg text-white text-right focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                      {subscribersForTarget !== null && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-white/50 text-sm">
                            → Need <span className="text-purple-400 font-medium">{subscribersForTarget}</span> subscribers to reach {formatCurrency(targetProfit!)} profit
                            {subscribersForTarget > forecast.projectedSubscribers && (
                              <span className="text-orange-400 ml-1">
                                ({Math.round(((subscribersForTarget - forecast.projectedSubscribers) / forecast.projectedSubscribers) * 100)}% more than projected)
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Operational Costs Modal */}
      {showOpsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1B2E] rounded-2xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Operating Expenses</h2>
                <p className="text-white/50 text-sm">Monthly fixed costs</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Cost
                </button>
                <button
                  onClick={() => setShowOpsModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Add Form */}
              {(showAddForm || editingCost) && (
                <div className="mb-6 p-4 bg-[#252642] rounded-xl border border-white/10">
                  <h3 className="text-white font-medium mb-4">
                    {editingCost ? 'Edit Cost' : 'Add New Cost'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/50 text-sm mb-1">Provider</label>
                      <input
                        type="text"
                        value={formData.provider}
                        onChange={e => setFormData({ ...formData, provider: e.target.value })}
                        className="w-full px-3 py-2 bg-[#1A1B2E] border border-white/10 rounded-lg text-white"
                        placeholder="e.g., Vercel"
                      />
                    </div>
                    <div>
                      <label className="block text-white/50 text-sm mb-1">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.actual_cost}
                        onChange={e => setFormData({ ...formData, actual_cost: e.target.value })}
                        className="w-full px-3 py-2 bg-[#1A1B2E] border border-white/10 rounded-lg text-white"
                        placeholder="20.00"
                      />
                    </div>
                    <div>
                      <label className="block text-white/50 text-sm mb-1">Billing Cycle</label>
                      <select
                        value={formData.billing_cycle}
                        onChange={e => setFormData({ ...formData, billing_cycle: e.target.value as any })}
                        className="w-full px-3 py-2 bg-[#1A1B2E] border border-white/10 rounded-lg text-white"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="biannual">Bi-Annual (6 months)</option>
                        <option value="annual">Annual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/50 text-sm mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-[#1A1B2E] border border-white/10 rounded-lg text-white"
                      >
                        <option value="infrastructure">Infrastructure</option>
                        <option value="services">Services</option>
                        <option value="tools">Tools</option>
                        <option value="payments">Payments</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-white/50 text-sm mb-1">Description</label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 bg-[#1A1B2E] border border-white/10 rounded-lg text-white"
                        placeholder="Web hosting and deployment"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-white/50 text-sm mb-1">Notes</label>
                      <input
                        type="text"
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3 py-2 bg-[#1A1B2E] border border-white/10 rounded-lg text-white"
                        placeholder="Optional notes"
                      />
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_variable"
                        checked={formData.is_variable}
                        onChange={e => setFormData({ ...formData, is_variable: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label htmlFor="is_variable" className="text-white/70 text-sm">
                        Variable cost (per-transaction)
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingCost(null);
                        setFormData({
                          provider: '',
                          actual_cost: '',
                          billing_cycle: 'monthly',
                          category: 'infrastructure',
                          description: '',
                          notes: '',
                          is_variable: false,
                        });
                      }}
                      className="px-4 py-2 text-white/50 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingCost ? handleUpdateCost : handleAddCost}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                    >
                      {editingCost ? 'Update' : 'Add'}
                    </button>
                  </div>
                </div>
              )}

              {/* Costs List */}
              <div className="space-y-2">
                {data.operationalCosts?.map(cost => (
                  <div
                    key={cost.id}
                    className="flex items-center justify-between px-4 py-3 bg-[#252642] rounded-lg hover:bg-[#2d2e4a] transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{cost.provider}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          cost.category === 'infrastructure' ? 'bg-blue-500/20 text-blue-400' :
                          cost.category === 'services' ? 'bg-green-500/20 text-green-400' :
                          cost.category === 'tools' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {cost.category}
                        </span>
                        {cost.billing_cycle !== 'monthly' && (
                          <span className="text-xs text-white/30">
                            ({cost.billing_cycle})
                          </span>
                        )}
                      </div>
                      {cost.description && (
                        <p className="text-white/40 text-sm mt-0.5">{cost.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {cost.is_variable ? 'Variable' : formatCurrency(cost.monthly_cost)}
                          <span className="text-white/30 text-xs">/mo</span>
                        </div>
                        {cost.billing_cycle !== 'monthly' && cost.actual_cost && (
                          <div className="text-white/30 text-xs">
                            {formatCurrency(cost.actual_cost)}/{cost.billing_cycle === 'annual' ? 'yr' : '6mo'}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(cost)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-white/40" />
                        </button>
                        <button
                          onClick={() => handleDeleteCost(cost.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400/60" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#252642]">
              <div className="flex justify-between items-center">
                <span className="text-white/50">Total Fixed Monthly</span>
                <span className="text-white font-bold text-lg">
                  {formatCurrency(data.operationalCosts?.reduce((sum, c) => c.is_variable ? sum : sum + parseFloat(String(c.monthly_cost)), 0) || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
