'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Cpu, DollarSign, TrendingUp, TrendingDown, Users, Zap,
  RefreshCw, ChevronDown, ChevronUp, X, BarChart3, PieChart,
  AlertTriangle, Target, Activity, Clock, Wallet, Building,
  Gift, Info, ArrowRight, CheckCircle2, Settings, Plus, Pencil, Trash2
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';

interface Overview {
  totalCostAllTime: number;
  totalCostThisMonth: number;
  totalCostLast30Days: number;
  totalApiCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  uniqueUsers: number;
  costPerUser: number;
  monthOverMonthChange: number | null;
}

interface FeatureCost {
  feature_name: string;
  call_count: number;
  total_cost: number;
  input_tokens: number;
  output_tokens: number;
  avg_cost_per_call: number;
}

interface ModelCost {
  ai_service: string;
  model_name: string;
  call_count: number;
  total_cost: number;
  avg_cost_per_call: number;
}

interface MonthlyCost {
  month: string;
  total_cost: number;
  call_count: number;
  unique_users: number;
}

interface UserCost {
  user_id: string;
  email: string;
  name: string | null;
  tier: string;
  call_count: number;
  total_cost: number;
  features_used: string[];
  subscription_revenue: number;
  margin: number;
}

interface Projections {
  currentMonthlyRun: number;
  projectedNext30Days: number;
  projectedNext60Days: number;
  projectedNext90Days: number;
  userGrowthRate: number;
  avgCostPerUser: number;
  avgCostPerCall: number;
  marginAnalysis: {
    tier: string;
    userCount: number;
    avgRevenue: number;
    avgCost: number;
    avgMargin: number;
    marginPercent: number;
  }[];
  efficiencyAnalysis: {
    feature: string;
    models: {
      model: string;
      calls: number;
      totalCost: number;
      avgCostPerCall: number;
    }[];
  }[];
  heavyUserCosts: {
    breakdown: Record<string, { calls: number; costPerCall: number; monthly: number }>;
    monthly: number;
    sixMonth: number;
    annual: number;
  };
  pricingTiers: Record<string, { label: string; price: number; monthly: number }>;
  marginScenarios: {
    tier: string;
    label: string;
    grossRevenue: number;
    monthlyRevenue: number;
    scenarios: {
      noFees: { netRevenue: number; margin: number; marginPercent: number };
      iapOnly: { netRevenue: number; margin: number; marginPercent: number };
      iapPartner: { netRevenue: number; margin: number; marginPercent: number };
      allFees: { netRevenue: number; margin: number; marginPercent: number };
    };
  }[];
}

interface UserDetail {
  user: {
    id: string;
    email: string;
    name: string | null;
    tier: string;
    created_at: string;
  };
  totalCost: number;
  totalCalls: number;
  featureBreakdown: {
    feature_name: string;
    call_count: number;
    total_cost: number;
    last_call_at: string;
  }[];
  monthlyHistory: {
    month: string;
    cost: number;
    calls: number;
  }[];
  subscriptionValue: number;
  profitMargin: number;
}

type TabType = 'overview' | 'features' | 'users' | 'projections' | 'financial' | 'models';

interface FeatureModelConfig {
  name: string;
  description: string;
  primaryModel: string;
  fallbackModels: string[];
  category: 'coaching' | 'analysis' | 'goals' | 'reports';
  callLimit: string;
}

interface FeatureUsageDetail {
  config: FeatureModelConfig;
  actualUsage: {
    totalCalls: number;
    totalCost: number;
    avgCostPerCall: number;
    byModel: {
      model: string;
      calls: number;
      cost: number;
      percentage: number;
      isPrimary: boolean;
      isFallback: boolean;
    }[];
  };
}

interface FinancialAnalytics {
  currentPhase: {
    stage: string;
    description: string;
    recommendations: string[];
    metrics: {
      totalInvestment: number;
      giftedTrialInvestment: number;
      organicCosts: number;
      costPerTrialUser: number;
      activeTrials: number;
      potentialConversions: number;
    };
  };
  revenue: {
    actual: {
      total: number;
      byStore: { apple: number; google: number };
      byProduct: Record<string, number>;
      transactions: any[];
      lastUpdated: string | null;
    };
    hasRevenue: boolean;
    status: string;
  };
  users: {
    total: number;
    byAcquisition: {
      giftedTrialActive: number;
      giftedTrialExpired: number;
      organic: number;
      paid: number;
    };
    byTier: Record<string, number>;
  };
  costs: {
    total: number;
    byAcquisition: {
      giftedTrial: number;
      organic: number;
      paid: number;
    };
    byModel: Record<string, {
      calls: number;
      inputTokens: number;
      outputTokens: number;
      cost: number;
      provider: string;
      tier: string;
    }>;
    byFeature: Record<string, {
      calls: number;
      cost: number;
      avgCostPerCall: number;
    }>;
    last30Days: number;
    last7Days: number;
  };
  margin: {
    grossRevenue: number;
    estimatedFees: number;
    netRevenue: number;
    aiCosts: number;
    operationalCosts: number;
    totalCosts: number;
    grossProfit: number;
    grossMarginPercent: number;
    userAcquisitionInvestment: number;
  };
  operationalCosts: {
    totalFixed: number;
    totalProviders: number;
    hasVariableCosts: boolean;
    byCategory: Record<string, { total: number; providers: string[] }>;
    costs: {
      id: string;
      provider: string;
      monthly_cost: string;
      actual_cost: string;
      billing_cycle: 'monthly' | 'biannual' | 'annual';
      category: string;
      description: string | null;
      notes: string | null;
      is_variable: boolean;
      is_active: boolean;
    }[];
  };
  projections: {
    scenario: string;
    description: string;
    assumptions: {
      monthlyNewPaidUsers: number;
      churnRate: string;
      trialConversion: string;
      feeProfile: string;
      netRevenueRate: string;
    };
    projections: {
      month: number;
      paidUsers: number;
      grossRevenue: number;
      netRevenue: number;
      aiCosts: number;
      grossProfit: number;
      grossMarginPercent: number;
    }[];
  }[];
  featureUsage: Record<string, FeatureUsageDetail>;
  modelHealth: {
    primaryModelUsage: number;
    fallbackUsage: number;
    recommendation: string;
  };
  models: {
    currentModels: {
      model: string;
      calls: number;
      cost: number;
      provider: string;
      tier: string;
      role: string;
      roleLabel: string;
      pricing: {
        inputCost: number;
        outputCost: number;
        provider: string;
        tier: string;
        notes: string;
        role?: string;
      } | null;
    }[];
    alternativeModels: {
      current: string;
      alternative: string;
      savingsPercent: number;
      tradeoff: string;
    }[];
    pricingReference: Record<string, {
      inputCost: number;
      outputCost: number;
      provider: string;
      tier: string;
      notes: string;
      role?: string;
    }>;
    lastVerified: string;
    pricingSource: string;
  };
  pricingConfig: {
    subscription: {
      pro6Months: number;
      volumeTiers: { seats: string; price: number; discount: number }[];
    };
    fees: {
      iap: number;
      partner: number;
      finderFee: number;
    };
  };
}

interface ModelCatalogEntry {
  provider: string;
  displayName: string;
  inputCost: number;
  outputCost: number;
  contextWindow: string;
  capabilities: string[];
  bestFor: string[];
  tier: 'budget' | 'standard' | 'premium';
  role: 'current' | 'upgrade' | 'downgrade';
  notes: string;
}

interface UpgradeProjection {
  modelId: string;
  modelName: string;
  provider: string;
  projectedMonthlyCost: number;
  delta: number;
  multiplier: number;
  isUpgrade: boolean;
  isCostSaving: boolean;
}

interface FeatureUpgradeProjection {
  feature: string;
  displayName: string;
  currentModel: string;
  currentModelDisplay: string;
  monthlyCalls: number;
  currentMonthlyCost: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  projections: UpgradeProjection[];
}

interface ModelAnalysis {
  summary: {
    totalCalls: number;
    totalCost: number;
    avgCostPerCall: number;
    uniqueModels: number;
    uniqueFeatures: number;
  };
  currentUsageByModel: {
    model: string;
    displayName: string;
    provider: string;
    calls: number;
    cost: number;
    avgCostPerCall: number;
    avgInputTokens: number;
    avgOutputTokens: number;
    percentOfTotal: number;
    tier: string;
  }[];
  currentUsageByFeature: {
    feature: string;
    displayName: string;
    currentModel: string;
    currentModelDisplay: string;
    monthlyCalls: number;
    monthlyCost: number;
    avgInputTokens: number;
    avgOutputTokens: number;
  }[];
  modelCatalog: Record<string, ModelCatalogEntry>;
  upgradeOptions: {
    modelId: string;
    displayName: string;
    provider: string;
    inputCost: number;
    outputCost: number;
    tier: string;
    role: string;
  }[];
  upgradeProjections: FeatureUpgradeProjection[];
  roiContext: {
    proUserCount: number;
    monthlyRevenuePerUser: number;
    ltv: number;
    currentConversionRate: number;
    totalMonthlyRevenue: number;
  };
  monthlyTrend: { month: string; cost: number }[];
}

const FEATURE_COLORS: Record<string, string> = {
  muscle_coach: '#06b6d4',
  weekly_reports: '#a855f7',
  fuel_ai: '#f97316',
  swing_lab: '#10b981',
  pitch_lab: '#fbbf24',
  mind_coach: '#3b82f6',
  ai_assistant_coach: '#ec4899',
  mind_goals: '#8b5cf6',
  muscle_goals: '#14b8a6',
};

const CHART_COLORS = ['#06b6d4', '#a855f7', '#f97316', '#10b981', '#fbbf24', '#3b82f6', '#ec4899'];

const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || '';

export default function AICostsPage() {
  const { getPassword } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [byFeature, setByFeature] = useState<FeatureCost[]>([]);
  const [byModel, setByModel] = useState<ModelCost[]>([]);
  const [byMonth, setByMonth] = useState<MonthlyCost[]>([]);
  const [topUsers, setTopUsers] = useState<UserCost[]>([]);
  const [projections, setProjections] = useState<Projections | null>(null);

  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  const [financialData, setFinancialData] = useState<FinancialAnalytics | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>('Moderate');
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());
  const [customUserForecast, setCustomUserForecast] = useState<number | null>(null);
  const [customChurnRate, setCustomChurnRate] = useState<number | null>(null);

  // Model Analysis state
  const [modelAnalysis, setModelAnalysis] = useState<ModelAnalysis | null>(null);
  const [selectedUpgradeFeature, setSelectedUpgradeFeature] = useState<string | null>(null);
  const [selectedUpgradeModel, setSelectedUpgradeModel] = useState<string | null>(null);
  const [expandedModelCards, setExpandedModelCards] = useState<Set<string>>(new Set());

  // Operational Costs modal state
  const [showOpsCostModal, setShowOpsCostModal] = useState(false);
  const [editingOpsCost, setEditingOpsCost] = useState<{
    id?: string;
    provider: string;
    actual_cost: string;
    billing_cycle: 'monthly' | 'biannual' | 'annual';
    category: string;
    description: string;
    notes: string;
    is_variable: boolean;
  } | null>(null);
  const [opsCostSaving, setOpsCostSaving] = useState(false);

  // Fee toggles for margin calculation
  const [includeIAP, setIncludeIAP] = useState(true); // 15% Apple/Google
  const [includePartner, setIncludePartner] = useState(false); // 10% affiliate
  const [includeFinderFee, setIncludeFinderFee] = useState(false); // 10% finder fee
  const [priceTier, setPriceTier] = useState<'base' | 'tier2' | 'tier3' | 'tier4'>('base');

  // Use API data for pricing tiers, with fallback
  const PRICING_TIERS = projections?.pricingTiers || {
    base: { label: '1-11 seats', price: 79.00, monthly: 13.17 },
    tier2: { label: '12-120 seats (10% off)', price: 71.10, monthly: 11.85 },
    tier3: { label: '121-199 seats (15% off)', price: 67.15, monthly: 11.19 },
    tier4: { label: '200+ seats (20% off)', price: 63.20, monthly: 10.53 },
  };

  // Use API data for heavy user costs, with fallback
  const heavyUserData = projections?.heavyUserCosts || {
    breakdown: {
      muscle_coach: { calls: 30, costPerCall: 0.00245, monthly: 0.0735 },
      weekly_reports: { calls: 4, costPerCall: 0.00053, monthly: 0.0021 },
      fuel_ai: { calls: 10, costPerCall: 0.00076, monthly: 0.0076 },
      swing_lab: { calls: 10, costPerCall: 0.00293, monthly: 0.0293 },
      pitch_lab: { calls: 10, costPerCall: 0.00293, monthly: 0.0293 },
    },
    monthly: 0.1418,
    sixMonth: 0.8508,
    annual: 1.7016,
  };

  const heavyUserMonthly = heavyUserData.monthly;
  const heavyUser6Mo = heavyUserData.sixMonth;
  const heavyUserAnnual = heavyUserData.annual;

  // Calculate true margin with all deductions
  const calculateTrueMargin = (grossRevenue: number, aiCost: number) => {
    let netRevenue = grossRevenue;
    if (includeIAP) netRevenue -= grossRevenue * 0.15;
    if (includePartner) netRevenue -= grossRevenue * 0.10;
    if (includeFinderFee) netRevenue -= grossRevenue * 0.10;
    return netRevenue - aiCost;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mainRes, projRes, finRes, modelRes] = await Promise.all([
        fetch(`/api/admin/ai-costs?timeRange=${timeRange}`, {
          headers: { 'X-Admin-Password': getPassword() || adminPassword }
        }),
        fetch('/api/admin/ai-costs/projections', {
          headers: { 'X-Admin-Password': getPassword() || adminPassword }
        }),
        fetch('/api/admin/ai-costs/financial-analytics', {
          headers: { 'X-Admin-Password': getPassword() || adminPassword }
        }),
        fetch('/api/admin/ai-costs/model-analysis', {
          headers: { 'X-Admin-Password': getPassword() || adminPassword }
        })
      ]);

      if (!mainRes.ok) throw new Error('Failed to fetch AI costs');
      if (!projRes.ok) throw new Error('Failed to fetch projections');

      const mainData = await mainRes.json();
      const projData = await projRes.json();

      setOverview(mainData.overview);
      setByFeature(mainData.byFeature);
      setByModel(mainData.byModel);
      setByMonth(mainData.byMonth);
      setTopUsers(mainData.topUsers);
      setProjections(projData);

      if (finRes.ok) {
        const finData = await finRes.json();
        setFinancialData(finData);
      }

      if (modelRes.ok) {
        const modelData = await modelRes.json();
        setModelAnalysis(modelData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId: string) => {
    setUserLoading(true);
    try {
      const res = await fetch(`/api/admin/ai-costs/users?userId=${userId}`, {
        headers: { 'X-Admin-Password': getPassword() || adminPassword }
      });
      if (!res.ok) throw new Error('Failed to fetch user details');
      const data = await res.json();
      setSelectedUser(data);
      setUserModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setUserLoading(false);
    }
  };

  // Operational Costs CRUD functions
  const saveOpsCost = async () => {
    if (!editingOpsCost) return;
    setOpsCostSaving(true);
    try {
      const method = editingOpsCost.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/ai-costs/operational-costs', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword() || adminPassword
        },
        body: JSON.stringify(editingOpsCost)
      });
      if (!res.ok) throw new Error('Failed to save operational cost');
      setEditingOpsCost(null);
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Failed to save ops cost:', err);
    } finally {
      setOpsCostSaving(false);
    }
  };

  const deleteOpsCost = async (id: string) => {
    if (!confirm('Are you sure you want to remove this cost?')) return;
    try {
      const res = await fetch(`/api/admin/ai-costs/operational-costs?id=${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': getPassword() || adminPassword }
      });
      if (!res.ok) throw new Error('Failed to delete operational cost');
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Failed to delete ops cost:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const formatCost = (cost: number) => {
    if (cost < 0.01) return `$${cost.toFixed(4)}`;
    if (cost < 1) return `$${cost.toFixed(3)}`;
    return `$${cost.toFixed(2)}`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  const formatFeatureName = (name: string) => {
    return name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (loading && !overview) {
    return (
      <div className="min-h-screen bg-[#0A0B14] flex items-center justify-center">
        <div className="text-white/50">Loading AI costs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0B14] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Cost Dashboard</h1>
            <p className="text-white/50 text-sm">Track and optimize AI API spending</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#1B1F39] text-white/80 rounded-lg px-3 py-2 text-sm border border-white/10"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="0">All time</option>
          </select>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B1F39] text-white/80 rounded-lg hover:bg-[#252A4A] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'overview', label: 'Overview', color: 'cyan' },
          { id: 'features', label: 'By Feature', color: 'purple' },
          { id: 'users', label: 'By User', color: 'orange' },
          { id: 'projections', label: 'Projections', color: 'emerald' },
          { id: 'financial', label: 'Financial', color: 'yellow' },
          { id: 'models', label: 'Model Analysis', color: 'pink' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/30`
                : 'bg-[#1B1F39] text-white/60 hover:text-white/80'
            }`}
            style={activeTab === tab.id ? {
              backgroundColor: tab.color === 'cyan' ? 'rgba(6, 182, 212, 0.2)' :
                              tab.color === 'purple' ? 'rgba(168, 85, 247, 0.2)' :
                              tab.color === 'orange' ? 'rgba(249, 115, 22, 0.2)' :
                              tab.color === 'yellow' ? 'rgba(234, 179, 8, 0.2)' :
                              'rgba(16, 185, 129, 0.2)',
              color: tab.color === 'cyan' ? '#22d3ee' :
                     tab.color === 'purple' ? '#c084fc' :
                     tab.color === 'orange' ? '#fb923c' :
                     tab.color === 'yellow' ? '#facc15' :
                     '#34d399',
              borderColor: tab.color === 'cyan' ? 'rgba(6, 182, 212, 0.3)' :
                           tab.color === 'purple' ? 'rgba(168, 85, 247, 0.3)' :
                           tab.color === 'orange' ? 'rgba(249, 115, 22, 0.3)' :
                           tab.color === 'yellow' ? 'rgba(234, 179, 8, 0.3)' :
                           'rgba(16, 185, 129, 0.3)',
            } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              icon={DollarSign}
              label="Total Cost (All Time)"
              value={formatCost(overview.totalCostAllTime)}
              color="cyan"
            />
            <StatCard
              icon={Activity}
              label="This Month"
              value={formatCost(overview.totalCostThisMonth)}
              trend={overview.monthOverMonthChange}
              color="purple"
            />
            <StatCard
              icon={Zap}
              label="API Calls"
              value={overview.totalApiCalls.toLocaleString()}
              subtitle={`${overview.uniqueUsers} users`}
              color="orange"
            />
            <StatCard
              icon={Users}
              label="Cost Per User"
              value={formatCost(overview.costPerUser)}
              color="emerald"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <div className="bg-[#0F1123] rounded-2xl p-6 border border-white/5">
              <h3 className="text-white font-semibold mb-4">Monthly Cost Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1B1F39" />
                  <XAxis dataKey="month" stroke="#ffffff50" fontSize={12} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1B1F39', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => [`$${(value as number)?.toFixed(4) ?? '0'}`, 'Cost']}
                  />
                  <Line type="monotone" dataKey="total_cost" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Cost by Feature */}
            <div className="bg-[#0F1123] rounded-2xl p-6 border border-white/5">
              <h3 className="text-white font-semibold mb-4">Cost by Feature</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={byFeature} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1B1F39" />
                  <XAxis type="number" stroke="#ffffff50" fontSize={12} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                  <YAxis type="category" dataKey="feature_name" stroke="#ffffff50" fontSize={11} width={100}
                    tickFormatter={(v) => formatFeatureName(v)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1B1F39', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => [`$${(value as number)?.toFixed(4) ?? '0'}`, 'Cost']}
                  />
                  <Bar dataKey="total_cost" radius={[0, 4, 4, 0]}>
                    {byFeature.map((entry, index) => (
                      <Cell key={entry.feature_name} fill={FEATURE_COLORS[entry.feature_name] || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Token Usage */}
          <div className="bg-[#0F1123] rounded-2xl p-6 border border-white/5">
            <h3 className="text-white font-semibold mb-4">Token Usage Summary</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">{formatTokens(overview.totalInputTokens)}</div>
                <div className="text-white/50 text-sm mt-1">Input Tokens</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{formatTokens(overview.totalOutputTokens)}</div>
                <div className="text-white/50 text-sm mt-1">Output Tokens</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">
                  {formatTokens(overview.totalInputTokens + overview.totalOutputTokens)}
                </div>
                <div className="text-white/50 text-sm mt-1">Total Tokens</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Tab */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          {/* Feature Breakdown Table */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-white font-semibold">Feature Cost Breakdown</h3>
            </div>
            <table className="w-full">
              <thead className="bg-[#1B1F39]">
                <tr>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Feature</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Calls</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Input Tokens</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Output Tokens</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Total Cost</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Avg/Call</th>
                </tr>
              </thead>
              <tbody>
                {byFeature.map((f, i) => (
                  <tr key={f.feature_name} className={i % 2 === 0 ? 'bg-[#0A0B14]' : 'bg-[#0F1123]'}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: FEATURE_COLORS[f.feature_name] || '#888' }}
                        />
                        <span className="text-white">{formatFeatureName(f.feature_name)}</span>
                      </div>
                    </td>
                    <td className="text-right text-white/80 px-4 py-3">{f.call_count.toLocaleString()}</td>
                    <td className="text-right text-white/80 px-4 py-3">{formatTokens(f.input_tokens)}</td>
                    <td className="text-right text-white/80 px-4 py-3">{formatTokens(f.output_tokens)}</td>
                    <td className="text-right text-cyan-400 font-medium px-4 py-3">{formatCost(f.total_cost)}</td>
                    <td className="text-right text-white/60 px-4 py-3">{formatCost(f.avg_cost_per_call)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Model Breakdown */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-white font-semibold">Model Usage</h3>
            </div>
            <table className="w-full">
              <thead className="bg-[#1B1F39]">
                <tr>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Provider</th>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Model</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Calls</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Total Cost</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Avg/Call</th>
                </tr>
              </thead>
              <tbody>
                {byModel.map((m, i) => (
                  <tr key={`${m.ai_service}-${m.model_name}`} className={i % 2 === 0 ? 'bg-[#0A0B14]' : 'bg-[#0F1123]'}>
                    <td className="px-4 py-3 text-white capitalize">{m.ai_service}</td>
                    <td className="px-4 py-3 text-white/80 font-mono text-sm">{m.model_name}</td>
                    <td className="text-right text-white/80 px-4 py-3">{m.call_count.toLocaleString()}</td>
                    <td className="text-right text-cyan-400 font-medium px-4 py-3">{formatCost(m.total_cost)}</td>
                    <td className="text-right text-white/60 px-4 py-3">{formatCost(m.avg_cost_per_call)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-white font-semibold">Top 20 Users by AI Cost</h3>
            </div>
            <table className="w-full">
              <thead className="bg-[#1B1F39]">
                <tr>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">User</th>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Tier</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Calls</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">AI Cost</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Revenue</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Margin</th>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Features</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u, i) => (
                  <tr
                    key={u.user_id}
                    className={`${i % 2 === 0 ? 'bg-[#0A0B14]' : 'bg-[#0F1123]'} hover:bg-[#1B1F39] cursor-pointer transition-colors`}
                    onClick={() => fetchUserDetail(u.user_id)}
                  >
                    <td className="px-4 py-3">
                      <div className="text-white">{u.email}</div>
                      {u.name && <div className="text-white/50 text-xs">{u.name}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        u.tier === 'pro' ? 'bg-purple-500/20 text-purple-400' :
                        u.tier === 'core' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-white/10 text-white/50'
                      }`}>
                        {u.tier}
                      </span>
                    </td>
                    <td className="text-right text-white/80 px-4 py-3">{u.call_count}</td>
                    <td className="text-right text-orange-400 font-medium px-4 py-3">{formatCost(u.total_cost)}</td>
                    <td className="text-right text-emerald-400 px-4 py-3">{formatCost(u.subscription_revenue)}</td>
                    <td className={`text-right font-medium px-4 py-3 ${u.margin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {u.margin >= 0 ? '+' : ''}{formatCost(u.margin)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.features_used.slice(0, 3).map(f => (
                          <span
                            key={f}
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: `${FEATURE_COLORS[f] || '#888'}20`,
                              color: FEATURE_COLORS[f] || '#888'
                            }}
                          >
                            {formatFeatureName(f)}
                          </span>
                        ))}
                        {u.features_used.length > 3 && (
                          <span className="text-white/40 text-xs">+{u.features_used.length - 3}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projections Tab */}
      {activeTab === 'projections' && projections && (
        <div className="space-y-6">
          {/* Forecast Cards */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              icon={Clock}
              label="Current Monthly Run"
              value={formatCost(projections.currentMonthlyRun)}
              color="cyan"
            />
            <StatCard
              icon={TrendingUp}
              label="Next 30 Days"
              value={formatCost(projections.projectedNext30Days)}
              color="purple"
            />
            <StatCard
              icon={TrendingUp}
              label="Next 60 Days"
              value={formatCost(projections.projectedNext60Days)}
              color="orange"
            />
            <StatCard
              icon={TrendingUp}
              label="Next 90 Days"
              value={formatCost(projections.projectedNext90Days)}
              color="emerald"
            />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0F1123] rounded-2xl p-6 border border-white/5">
              <div className="text-white/50 text-sm mb-2">User Growth Rate</div>
              <div className={`text-3xl font-bold ${projections.userGrowthRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {projections.userGrowthRate >= 0 ? '+' : ''}{projections.userGrowthRate.toFixed(1)}%
              </div>
              <div className="text-white/30 text-xs mt-1">Month over month</div>
            </div>
            <div className="bg-[#0F1123] rounded-2xl p-6 border border-white/5">
              <div className="text-white/50 text-sm mb-2">Avg Cost Per User</div>
              <div className="text-3xl font-bold text-cyan-400">{formatCost(projections.avgCostPerUser)}</div>
              <div className="text-white/30 text-xs mt-1">Last 30 days</div>
            </div>
            <div className="bg-[#0F1123] rounded-2xl p-6 border border-white/5">
              <div className="text-white/50 text-sm mb-2">Avg Cost Per Call</div>
              <div className="text-3xl font-bold text-purple-400">{formatCost(projections.avgCostPerCall)}</div>
              <div className="text-white/30 text-xs mt-1">All features</div>
            </div>
          </div>

          {/* Heavy User Cost Projection */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-6">
            <h3 className="text-white font-semibold mb-2">Heavy User AI Cost Projection</h3>
            <p className="text-white/50 text-sm mb-4">User who maxes out all AI features + 10 Swing/Pitch Lab credits monthly</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#1B1F39] rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-cyan-400">{formatCost(heavyUserMonthly)}</div>
                <div className="text-white/50 text-sm mt-1">Per Month</div>
              </div>
              <div className="bg-[#1B1F39] rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-purple-400">{formatCost(heavyUser6Mo)}</div>
                <div className="text-white/50 text-sm mt-1">Per 6 Months (License Term)</div>
              </div>
              <div className="bg-[#1B1F39] rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-orange-400">{formatCost(heavyUserAnnual)}</div>
                <div className="text-white/50 text-sm mt-1">Per Year</div>
              </div>
            </div>

            <div className="bg-[#1B1F39] rounded-xl p-4">
              <div className="text-white/70 text-sm font-medium mb-2">Usage Breakdown (from actual data):</div>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 text-xs">
                {Object.entries(heavyUserData.breakdown).map(([feature, data]) => (
                  <div key={feature} className="text-center">
                    <div className="text-white/50">{formatFeatureName(feature)}</div>
                    <div className="text-white">{data.calls} calls</div>
                    <div className="text-purple-400">{formatCost(data.costPerCall)}/call</div>
                    <div className="text-cyan-400">{formatCost(data.monthly)}/mo</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* True Margin Calculator */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-6">
            <h3 className="text-white font-semibold mb-2">True Margin Calculator</h3>
            <p className="text-white/50 text-sm mb-4">Calculate actual profit after all fees and costs</p>

            <div className="grid grid-cols-2 gap-6">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">Pricing Tier</label>
                  <select
                    value={priceTier}
                    onChange={(e) => setPriceTier(e.target.value as typeof priceTier)}
                    className="w-full bg-[#1B1F39] text-white rounded-lg px-3 py-2 border border-white/10"
                  >
                    {Object.entries(PRICING_TIERS).map(([key, tier]) => (
                      <option key={key} value={key}>{tier.label} - ${tier.price}/6mo</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium block">Fee Deductions</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeIAP}
                      onChange={(e) => setIncludeIAP(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#1B1F39] border-white/20"
                    />
                    <span className="text-white/80">IAP Fee (15% - Apple/Google)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePartner}
                      onChange={(e) => setIncludePartner(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#1B1F39] border-white/20"
                    />
                    <span className="text-white/80">Partner Program (10%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeFinderFee}
                      onChange={(e) => setIncludeFinderFee(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#1B1F39] border-white/20"
                    />
                    <span className="text-white/80">Finder Fee (10%)</span>
                  </label>
                </div>
              </div>

              {/* Calculation Results */}
              <div className="bg-[#1B1F39] rounded-xl p-4">
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/70">Gross Revenue (6mo)</span>
                    <span className="text-white font-medium">${PRICING_TIERS[priceTier].price.toFixed(2)}</span>
                  </div>
                  {includeIAP && (
                    <div className="flex justify-between text-red-400">
                      <span>- IAP Fee (15%)</span>
                      <span>-${(PRICING_TIERS[priceTier].price * 0.15).toFixed(2)}</span>
                    </div>
                  )}
                  {includePartner && (
                    <div className="flex justify-between text-red-400">
                      <span>- Partner Commission (10%)</span>
                      <span>-${(PRICING_TIERS[priceTier].price * 0.10).toFixed(2)}</span>
                    </div>
                  )}
                  {includeFinderFee && (
                    <div className="flex justify-between text-red-400">
                      <span>- Finder Fee (10%)</span>
                      <span>-${(PRICING_TIERS[priceTier].price * 0.10).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-orange-400">
                    <span>- Heavy User AI Cost (6mo)</span>
                    <span>-${heavyUser6Mo.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 text-lg font-bold">
                    <span className="text-white">Net Margin (6mo)</span>
                    <span className={calculateTrueMargin(PRICING_TIERS[priceTier].price, heavyUser6Mo) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      ${calculateTrueMargin(PRICING_TIERS[priceTier].price, heavyUser6Mo).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/50 text-sm">
                    <span>Monthly equivalent</span>
                    <span>${(calculateTrueMargin(PRICING_TIERS[priceTier].price, heavyUser6Mo) / 6).toFixed(2)}/mo</span>
                  </div>
                  <div className="flex justify-between text-white/50 text-sm">
                    <span>Margin %</span>
                    <span>{((calculateTrueMargin(PRICING_TIERS[priceTier].price, heavyUser6Mo) / PRICING_TIERS[priceTier].price) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Margin Analysis by Tier */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-white font-semibold">Profit Margin by Tier (Actual Users)</h3>
              <p className="text-white/50 text-sm">Based on actual AI usage - gross margin before fees</p>
            </div>
            <table className="w-full">
              <thead className="bg-[#1B1F39]">
                <tr>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Tier</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Users</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Avg Revenue</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Avg AI Cost</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Avg Margin</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {projections.marginAnalysis.map((m, i) => (
                  <tr key={m.tier} className={i % 2 === 0 ? 'bg-[#0A0B14]' : 'bg-[#0F1123]'}>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        m.tier === 'pro' ? 'bg-purple-500/20 text-purple-400' :
                        m.tier === 'core' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-white/10 text-white/50'
                      }`}>
                        {m.tier}
                      </span>
                    </td>
                    <td className="text-right text-white/80 px-4 py-3">{m.userCount}</td>
                    <td className="text-right text-emerald-400 px-4 py-3">{formatCost(m.avgRevenue)}</td>
                    <td className="text-right text-orange-400 px-4 py-3">{formatCost(m.avgCost)}</td>
                    <td className={`text-right font-medium px-4 py-3 ${m.avgMargin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.avgMargin >= 0 ? '+' : ''}{formatCost(m.avgMargin)}
                    </td>
                    <td className={`text-right font-medium px-4 py-3 ${m.marginPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.marginPercent >= 0 ? '+' : ''}{m.marginPercent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Model Efficiency */}
          {projections.efficiencyAnalysis.length > 0 && (
            <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-6">
              <h3 className="text-white font-semibold mb-4">Model Efficiency by Feature</h3>
              <div className="grid grid-cols-2 gap-4">
                {projections.efficiencyAnalysis.map(f => (
                  <div key={f.feature} className="bg-[#1B1F39] rounded-xl p-4">
                    <div className="text-white font-medium mb-3">{formatFeatureName(f.feature)}</div>
                    <div className="space-y-2">
                      {f.models.map(m => (
                        <div key={m.model} className="flex items-center justify-between text-sm">
                          <span className="text-white/60 font-mono">{m.model}</span>
                          <div className="text-right">
                            <span className="text-cyan-400">{formatCost(m.avgCostPerCall)}</span>
                            <span className="text-white/30 ml-1">/ call</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === 'financial' && financialData && (
        <div className="space-y-6">
          {/* Current Phase Banner */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Building className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-white">{financialData.currentPhase.stage}</h3>
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Current Stage</span>
                </div>
                <p className="text-white/70 text-sm mb-2">{financialData.currentPhase.description}</p>
                {financialData.currentPhase.recommendations.length > 0 && (
                  <div className="flex items-start gap-2 bg-black/20 rounded-lg p-3">
                    <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <p className="text-cyan-400 text-sm">{financialData.currentPhase.recommendations[0]}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-[#0F1123] rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{formatCost(financialData.revenue.actual.total)}</div>
              <div className="text-white/50 text-sm mt-1">Total Revenue</div>
              <div className="text-white/30 text-xs mt-0.5">
                {financialData.revenue.hasRevenue ? financialData.revenue.status : 'Pre-revenue phase'}
              </div>
            </div>
            <div className="bg-[#0F1123] rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{formatCost(financialData.costs.total)}</div>
              <div className="text-white/50 text-sm mt-1">Total AI Spend</div>
              <div className="text-white/30 text-xs mt-0.5">All time investment</div>
            </div>
            <div className="bg-[#0F1123] rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{formatCost(financialData.costs.byAcquisition.giftedTrial)}</div>
              <div className="text-white/50 text-sm mt-1">Gifted Trial Investment</div>
              <div className="text-white/30 text-xs mt-0.5">{financialData.users.byAcquisition.giftedTrialActive} active trials</div>
            </div>
            <div className="bg-[#0F1123] rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{financialData.users.total}</div>
              <div className="text-white/50 text-sm mt-1">Total Users</div>
              <div className="text-white/30 text-xs mt-0.5">
                {financialData.users.byAcquisition.giftedTrialActive} gifted, {financialData.users.byAcquisition.organic} organic
              </div>
            </div>
            {/* Operational Costs Card - Clickable for drill-down */}
            <div
              onClick={() => setShowOpsCostModal(true)}
              className="bg-[#0F1123] rounded-2xl p-5 border border-white/5 cursor-pointer hover:border-red-500/30 hover:bg-[#0F1123]/80 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Building className="w-5 h-5 text-red-400" />
                </div>
                <Settings className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCost(financialData.operationalCosts?.totalFixed || 0)}/mo
              </div>
              <div className="text-white/50 text-sm mt-1">Ops Costs</div>
              <div className="text-white/30 text-xs mt-0.5">
                {financialData.operationalCosts?.totalProviders || 0} services
                {financialData.operationalCosts?.hasVariableCosts && ' (+ variable)'}
              </div>
              {/* Mini breakdown preview */}
              {financialData.operationalCosts?.byCategory && (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                  {Object.entries(financialData.operationalCosts.byCategory).slice(0, 3).map(([cat, data]) => (
                    <div key={cat} className="flex justify-between text-xs">
                      <span className="text-white/40 capitalize">{cat}</span>
                      <span className="text-white/60">{formatCost(data.total)}</span>
                    </div>
                  ))}
                  {Object.keys(financialData.operationalCosts.byCategory).length > 3 && (
                    <div className="text-white/30 text-xs text-center">+ more</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* User Acquisition Investment */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-6">
            <h3 className="text-white font-semibold mb-4">User Acquisition Investment</h3>
            <p className="text-white/50 text-sm mb-4">
              AI costs represent your investment in acquiring and retaining users. Track the ROI of different acquisition channels.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#1B1F39] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-medium">Gifted Trials</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">Active Users</span>
                    <span className="text-white">{financialData.users.byAcquisition.giftedTrialActive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Total Cost</span>
                    <span className="text-orange-400">{formatCost(financialData.costs.byAcquisition.giftedTrial)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Cost per User</span>
                    <span className="text-cyan-400">{formatCost(financialData.currentPhase.metrics.costPerTrialUser)}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <div className="text-purple-400 text-xs">Marketing investment for user adoption</div>
                  </div>
                </div>
              </div>
              <div className="bg-[#1B1F39] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-medium">Organic Users</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">Users</span>
                    <span className="text-white">{financialData.users.byAcquisition.organic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Total Cost</span>
                    <span className="text-orange-400">{formatCost(financialData.costs.byAcquisition.organic)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Cost per User</span>
                    <span className="text-cyan-400">
                      {financialData.users.byAcquisition.organic > 0
                        ? formatCost(financialData.costs.byAcquisition.organic / financialData.users.byAcquisition.organic)
                        : '$0.00'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <div className="text-emerald-400 text-xs">Users who signed up independently</div>
                  </div>
                </div>
              </div>
              <div className="bg-[#1B1F39] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">Paid Subscribers</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">Users</span>
                    <span className="text-white">{financialData.users.byAcquisition.paid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Total Cost</span>
                    <span className="text-orange-400">{formatCost(financialData.costs.byAcquisition.paid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Cost per User</span>
                    <span className="text-cyan-400">
                      {financialData.users.byAcquisition.paid > 0
                        ? formatCost(financialData.costs.byAcquisition.paid / financialData.users.byAcquisition.paid)
                        : '$0.00'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <div className="text-yellow-400 text-xs">Revenue-generating users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Model Health Summary */}
          {financialData.modelHealth && (
            <div className={`rounded-2xl p-4 border ${
              financialData.modelHealth.fallbackUsage > 10
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-emerald-500/10 border-emerald-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    financialData.modelHealth.fallbackUsage > 10
                      ? 'bg-yellow-500/20'
                      : 'bg-emerald-500/20'
                  }`}>
                    <CheckCircle2 className={`w-5 h-5 ${
                      financialData.modelHealth.fallbackUsage > 10
                        ? 'text-yellow-400'
                        : 'text-emerald-400'
                    }`} />
                  </div>
                  <div>
                    <div className="text-white font-medium">Model Health</div>
                    <div className="text-white/50 text-sm">{financialData.modelHealth.recommendation}</div>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{financialData.modelHealth.primaryModelUsage}%</div>
                    <div className="text-white/40 text-xs">Primary Model</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      financialData.modelHealth.fallbackUsage > 10 ? 'text-yellow-400' : 'text-white/40'
                    }`}>{financialData.modelHealth.fallbackUsage}%</div>
                    <div className="text-white/40 text-xs">Fallback</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feature → Model Mapping */}
          {financialData.featureUsage && (
            <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">AI Features → Model Mapping</h3>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">Primary</span>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">Fallback</span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">Specialized</span>
                </div>
              </div>
              <p className="text-white/50 text-sm mb-4">
                Click any feature to see actual model usage breakdown. gpt-4o-mini is the primary model; gpt-4-turbo and claude-3-haiku are fallbacks only.
              </p>

              <div className="space-y-2">
                {Object.entries(financialData.featureUsage).map(([featureName, feature]) => {
                  const isExpanded = expandedFeatures.has(featureName);
                  const hasUsage = feature.actualUsage.totalCalls > 0;

                  return (
                    <div key={featureName} className="bg-[#1B1F39] rounded-xl overflow-hidden">
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedFeatures);
                          if (isExpanded) {
                            newExpanded.delete(featureName);
                          } else {
                            newExpanded.add(featureName);
                          }
                          setExpandedFeatures(newExpanded);
                        }}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: FEATURE_COLORS[featureName] || '#888' }}
                          />
                          <div className="text-left">
                            <div className="text-white font-medium">{feature.config.name}</div>
                            <div className="text-white/40 text-xs">{feature.config.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-sm font-mono ${
                              feature.config.primaryModel.includes('gemini')
                                ? 'text-purple-400'
                                : 'text-emerald-400'
                            }`}>
                              {feature.config.primaryModel}
                            </div>
                            <div className="text-white/30 text-xs">{feature.config.callLimit}</div>
                          </div>
                          {hasUsage && (
                            <div className="text-right min-w-[80px]">
                              <div className="text-cyan-400 text-sm">{feature.actualUsage.totalCalls} calls</div>
                              <div className="text-white/40 text-xs">{formatCost(feature.actualUsage.totalCost)}</div>
                            </div>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-white/40" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-white/40" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-white/5">
                          <div className="pt-4 space-y-3">
                            {/* Expected Model */}
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white/50">Expected Primary:</span>
                              <span className="text-emerald-400 font-mono">{feature.config.primaryModel}</span>
                            </div>
                            {feature.config.fallbackModels.length > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-white/50">Fallback Chain:</span>
                                <span className="text-yellow-400 font-mono text-xs">
                                  {feature.config.fallbackModels.join(' → ')}
                                </span>
                              </div>
                            )}

                            {/* Actual Usage */}
                            {hasUsage ? (
                              <div className="mt-4">
                                <div className="text-white/70 text-sm font-medium mb-2">Actual Usage:</div>
                                <div className="space-y-2">
                                  {feature.actualUsage.byModel.map(model => (
                                    <div
                                      key={model.model}
                                      className={`flex items-center justify-between p-2 rounded-lg ${
                                        model.isPrimary
                                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                                          : model.isFallback
                                          ? 'bg-yellow-500/10 border border-yellow-500/20'
                                          : 'bg-white/5'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm text-white">{model.model}</span>
                                        {model.isPrimary && (
                                          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">PRIMARY</span>
                                        )}
                                        {model.isFallback && (
                                          <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">FALLBACK</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-4 text-sm">
                                        <span className="text-white">{model.calls} calls</span>
                                        <span className="text-white/40">({model.percentage}%)</span>
                                        <span className="text-cyan-400">{formatCost(model.cost)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-2 text-right">
                                  <span className="text-white/40 text-xs">Avg cost per call: </span>
                                  <span className="text-cyan-400 text-sm">{formatCost(feature.actualUsage.avgCostPerCall)}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-4 text-white/30 text-sm italic">No usage data yet</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scenario Projections */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">Scenario-Based Projections</h3>
                <p className="text-white/50 text-sm">Toggle scenarios or enter custom user numbers to see projections</p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-white/50 text-sm">Users/Mo:</label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={customUserForecast ?? ''}
                    onChange={(e) => setCustomUserForecast(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Auto"
                    className="w-20 bg-[#1B1F39] text-white rounded-lg px-2 py-1 text-sm border border-white/10 focus:border-yellow-500/50 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-white/50 text-sm">Churn %:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={customChurnRate ?? ''}
                    onChange={(e) => setCustomChurnRate(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Auto"
                    className="w-16 bg-[#1B1F39] text-white rounded-lg px-2 py-1 text-sm border border-white/10 focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
                {(customUserForecast !== null || customChurnRate !== null) && (
                  <button
                    onClick={() => {
                      setCustomUserForecast(null);
                      setCustomChurnRate(null);
                    }}
                    className="text-white/40 hover:text-white/60 flex items-center gap-1 text-xs"
                    title="Reset to scenario defaults"
                  >
                    <X className="w-3 h-3" /> Reset
                  </button>
                )}
                <div className="flex gap-2">
                  {financialData.projections.map(proj => (
                    <button
                      key={proj.scenario}
                      onClick={() => {
                        setSelectedScenario(proj.scenario);
                        setCustomUserForecast(null);
                        setCustomChurnRate(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedScenario === proj.scenario && customUserForecast === null && customChurnRate === null
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : (customUserForecast !== null || customChurnRate !== null)
                          ? 'bg-[#1B1F39] text-white/40'
                          : 'bg-[#1B1F39] text-white/60 hover:text-white/80'
                      }`}
                    >
                      {proj.scenario}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {financialData.projections
              .filter(p => p.scenario === selectedScenario)
              .map(scenarioData => {
                // Calculate projections with custom values if set
                const monthlyUsers = customUserForecast ?? scenarioData.assumptions.monthlyNewPaidUsers;
                const effectiveChurnRate = customChurnRate ?? parseFloat(scenarioData.assumptions.churnRate);
                const isCustom = customUserForecast !== null || customChurnRate !== null;

                // Calculate custom projections if any custom value is set
                const calculateCustomProjections = (months: number[]) => {
                  const monthlyRevenue = financialData.pricingConfig.subscription.pro6Months / 6;
                  const feeMultipliers: Record<string, number> = {
                    noFees: 1.00,
                    iapOnly: 0.85,
                    iapPartner: 0.75,
                    allFees: 0.65,
                  };
                  const feeMultiplier = feeMultipliers[scenarioData.assumptions.feeProfile] || 0.75;
                  const churnRate = effectiveChurnRate / 100;
                  const avgCostPerUser = projections?.avgCostPerUser || 0.05;

                  return months.map(month => {
                    let paidUsers = 0;
                    for (let m = 1; m <= month; m++) {
                      paidUsers += monthlyUsers;
                      paidUsers = Math.round(paidUsers * (1 - churnRate));
                    }
                    const grossRevenue = paidUsers * monthlyRevenue * month;
                    const netRevenue = grossRevenue * feeMultiplier;
                    const aiCosts = paidUsers * avgCostPerUser * month;
                    const grossProfit = netRevenue - aiCosts;
                    const grossMarginPercent = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

                    return { month, paidUsers, grossRevenue, netRevenue, aiCosts, grossProfit, grossMarginPercent };
                  });
                };

                const displayProjections = isCustom
                  ? calculateCustomProjections([1, 3, 6, 12])
                  : scenarioData.projections;

                // Get 6-month projection for display
                const proj6Mo = displayProjections.find(p => p.month === 6) || displayProjections[displayProjections.length - 1];
                const proj12Mo = displayProjections.find(p => p.month === 12);

                return (
                  <div key={scenarioData.scenario} className="space-y-4">
                    <div className={`rounded-xl p-3 mb-4 ${isCustom ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-[#1B1F39]'}`}>
                      {isCustom && (
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 text-sm font-medium">
                            Custom Forecast: {monthlyUsers} users/month, {effectiveChurnRate}% churn
                          </span>
                        </div>
                      )}
                      <p className="text-white/60 text-sm">{scenarioData.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-white/40">
                        <span className={customUserForecast !== null ? 'text-yellow-400' : ''}>
                          New users/mo: {monthlyUsers}
                        </span>
                        <span className={customChurnRate !== null ? 'text-purple-400' : ''}>
                          Churn: {effectiveChurnRate}%
                        </span>
                        <span>Trial conversion: {scenarioData.assumptions.trialConversion}</span>
                        <span>Net revenue: {scenarioData.assumptions.netRevenueRate}</span>
                      </div>
                      <div className="mt-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <p className="text-blue-400 text-xs flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          User counts reflect monthly churn. E.g., {monthlyUsers} users/mo × 6mo with {effectiveChurnRate}% churn = {displayProjections.find(p => p.month === 6)?.paidUsers || 0} active users (not {monthlyUsers * 6}).
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-[#1B1F39] rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-white">{proj6Mo?.paidUsers || 0}</div>
                        <div className="text-white/50 text-sm mt-1">Paid Users (6mo)</div>
                      </div>
                      <div className="bg-[#1B1F39] rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-emerald-400">${(proj6Mo?.grossRevenue || 0).toFixed(0)}</div>
                        <div className="text-white/50 text-sm mt-1">Gross Revenue (6mo)</div>
                      </div>
                      <div className="bg-[#1B1F39] rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-orange-400">${(proj6Mo?.aiCosts || 0).toFixed(2)}</div>
                        <div className="text-white/50 text-sm mt-1">AI Cost (6mo)</div>
                      </div>
                      <div className="bg-[#1B1F39] rounded-xl p-4 text-center">
                        <div className={`text-3xl font-bold ${(proj6Mo?.grossProfit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          ${(proj6Mo?.grossProfit || 0).toFixed(0)}
                        </div>
                        <div className="text-white/50 text-sm mt-1">Net Profit (6mo)</div>
                      </div>
                    </div>

                    <div className="bg-[#1B1F39] rounded-xl p-4">
                      <h4 className="text-white font-medium mb-3">Projection Timeline</h4>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        {displayProjections.map(p => (
                          <div key={p.month}>
                            <div className="text-white/50 mb-1">{p.month} Month{p.month > 1 ? 's' : ''}</div>
                            <div className="text-white font-medium">{p.paidUsers} users</div>
                            <div className="text-emerald-400">${p.grossRevenue.toFixed(0)} rev</div>
                            <div className={p.grossProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                              ${p.grossProfit.toFixed(0)} profit
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {proj12Mo && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#1B1F39] rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white/50 text-sm">Annual Revenue (12mo)</div>
                              <div className="text-2xl font-bold text-emerald-400">${proj12Mo.grossRevenue.toLocaleString()}</div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-white/30" />
                            <div>
                              <div className="text-white/50 text-sm">Annual Profit</div>
                              <div className={`text-2xl font-bold ${proj12Mo.grossProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                ${proj12Mo.grossProfit.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-[#1B1F39] rounded-xl p-4">
                          <div className="text-white/50 text-sm">Gross Margin</div>
                          <div className="text-2xl font-bold text-yellow-400">
                            {proj12Mo.grossMarginPercent.toFixed(1)}%
                          </div>
                          <div className="text-white/30 text-xs mt-1">After fees and AI costs</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* OpenRouter Models */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">OpenRouter Models in Use</h3>
              <span className="text-white/40 text-xs">Last verified: {financialData.models.lastVerified}</span>
            </div>
            <p className="text-white/50 text-sm mb-4">
              All AI features use models through OpenRouter. Pricing is per 1M tokens.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {financialData.models.currentModels.map(model => (
                <div
                  key={model.model}
                  className={`bg-[#1B1F39] rounded-xl p-4 border ${
                    model.tier === 'budget' ? 'border-emerald-500/30' :
                    model.tier === 'standard' ? 'border-cyan-500/30' :
                    'border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium font-mono text-sm">{model.model}</span>
                      {model.roleLabel && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          model.roleLabel === 'PRIMARY' ? 'bg-yellow-500/20 text-yellow-400' :
                          model.roleLabel === 'SPECIALIZED' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {model.roleLabel}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      model.tier === 'budget' ? 'bg-emerald-500/20 text-emerald-400' :
                      model.tier === 'standard' ? 'bg-cyan-500/20 text-cyan-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {model.tier}
                    </span>
                  </div>
                  <div className="text-white/50 text-xs mb-3">{model.provider}</div>
                  {model.pricing && (
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <div className="text-white/40 text-xs">Input</div>
                        <div className="text-cyan-400">${model.pricing.inputCost.toFixed(2)}/1M</div>
                      </div>
                      <div>
                        <div className="text-white/40 text-xs">Output</div>
                        <div className="text-purple-400">${model.pricing.outputCost.toFixed(2)}/1M</div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">{model.calls} calls</span>
                    <span className="text-cyan-400">{formatCost(model.cost)} total</span>
                  </div>
                  {model.pricing?.notes && (
                    <div className="text-white/60 text-xs mt-2">{model.pricing.notes}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Alternative Models Recommendations */}
            {financialData.models.alternativeModels.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-medium text-sm">Cost Optimization Opportunities</span>
                </div>
                {financialData.models.alternativeModels.map(alt => (
                  <div key={alt.current} className="text-sm mt-2">
                    <span className="text-white/70">Switch from </span>
                    <span className="text-red-400 font-mono">{alt.current}</span>
                    <span className="text-white/70"> to </span>
                    <span className="text-emerald-400 font-mono">{alt.alternative}</span>
                    <span className="text-emerald-400"> ({alt.savingsPercent}% savings)</span>
                    <div className="text-white/50 text-xs mt-1">{alt.tradeoff}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cost by Model Table */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-white font-semibold">Actual Spend by Model</h3>
            </div>
            <table className="w-full">
              <thead className="bg-[#1B1F39]">
                <tr>
                  <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Model</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Calls</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Total Cost</th>
                  <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Avg/Call</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(financialData.costs.byModel).map(([model, data], i) => (
                  <tr key={model} className={i % 2 === 0 ? 'bg-[#0A0B14]' : 'bg-[#0F1123]'}>
                    <td className="px-4 py-3 text-white font-mono text-sm">{model}</td>
                    <td className="text-right text-white/80 px-4 py-3">{data.calls.toLocaleString()}</td>
                    <td className="text-right text-cyan-400 font-medium px-4 py-3">{formatCost(data.cost)}</td>
                    <td className="text-right text-white/60 px-4 py-3">{formatCost(data.calls > 0 ? data.cost / data.calls : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financial Tab - No Data State */}
      {activeTab === 'financial' && !financialData && !loading && (
        <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Financial Analytics Unavailable</h3>
          <p className="text-white/50 text-sm">Unable to load financial analytics data. Please try refreshing.</p>
        </div>
      )}

      {/* Model Analysis Tab */}
      {activeTab === 'models' && modelAnalysis && (
        <div className="space-y-6">
          {/* Current Usage Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-white/50 text-sm">Total Calls (30d)</div>
              </div>
              <div className="text-2xl font-bold text-white">{modelAnalysis.summary.totalCalls.toLocaleString()}</div>
            </div>
            <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-white/50 text-sm">Total Cost (30d)</div>
              </div>
              <div className="text-2xl font-bold text-emerald-400">{formatCost(modelAnalysis.summary.totalCost)}</div>
            </div>
            <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-white/50 text-sm">Avg Cost/Call</div>
              </div>
              <div className="text-2xl font-bold text-purple-400">{formatCost(modelAnalysis.summary.avgCostPerCall)}</div>
            </div>
            <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-white/50 text-sm">Active Models</div>
              </div>
              <div className="text-2xl font-bold text-orange-400">{modelAnalysis.summary.uniqueModels}</div>
            </div>
          </div>

          {/* Current Model Usage */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-6">
            <h3 className="text-white font-semibold mb-4">Current Model Usage (Last 30 Days)</h3>
            <div className="space-y-3">
              {modelAnalysis.currentUsageByModel.map(model => (
                <div key={model.model} className="bg-[#1B1F39] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        model.tier === 'budget' ? 'bg-emerald-400' :
                        model.tier === 'standard' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`} />
                      <div>
                        <div className="text-white font-medium">{model.displayName}</div>
                        <div className="text-white/40 text-xs">{model.provider} • {model.tier}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="text-white font-medium">{model.calls.toLocaleString()}</div>
                        <div className="text-white/40 text-xs">calls</div>
                      </div>
                      <div className="text-center">
                        <div className="text-cyan-400 font-medium">{formatCost(model.cost)}</div>
                        <div className="text-white/40 text-xs">total cost</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-400 font-medium">{formatCost(model.avgCostPerCall)}</div>
                        <div className="text-white/40 text-xs">per call</div>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <div className="text-white font-medium">{model.percentOfTotal.toFixed(1)}%</div>
                        <div className="text-white/40 text-xs">of total</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Simulator */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-6">
            <h3 className="text-white font-semibold mb-2">Upgrade Simulator</h3>
            <p className="text-white/50 text-sm mb-4">Select a feature and model to see projected cost impact</p>

            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="text-white/50 text-xs mb-1 block">Feature</label>
                <select
                  value={selectedUpgradeFeature || ''}
                  onChange={(e) => setSelectedUpgradeFeature(e.target.value || null)}
                  className="w-full bg-[#1B1F39] text-white rounded-lg px-3 py-2 border border-white/10 focus:border-pink-500/50 focus:outline-none"
                >
                  <option value="">Select a feature...</option>
                  {modelAnalysis.upgradeProjections.map(proj => (
                    <option key={proj.feature} value={proj.feature}>
                      {proj.displayName} ({proj.monthlyCalls} calls/mo, {formatCost(proj.currentMonthlyCost)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-white/50 text-xs mb-1 block">Upgrade To</label>
                <select
                  value={selectedUpgradeModel || ''}
                  onChange={(e) => setSelectedUpgradeModel(e.target.value || null)}
                  className="w-full bg-[#1B1F39] text-white rounded-lg px-3 py-2 border border-white/10 focus:border-pink-500/50 focus:outline-none"
                >
                  <option value="">Select a model...</option>
                  {modelAnalysis.upgradeOptions.map(opt => (
                    <option key={opt.modelId} value={opt.modelId}>
                      {opt.displayName} ({opt.provider}) - ${opt.inputCost}/${opt.outputCost} per 1M
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedUpgradeFeature && selectedUpgradeModel && (() => {
              const featureProj = modelAnalysis.upgradeProjections.find(p => p.feature === selectedUpgradeFeature);
              const modelProj = featureProj?.projections.find(p => p.modelId === selectedUpgradeModel);
              if (!featureProj || !modelProj) return null;

              const monthlyCostDelta = modelProj.delta;
              const breakEvenConversions = Math.ceil(Math.abs(monthlyCostDelta) / (modelAnalysis.roiContext.ltv / 6));
              const breakEvenRetentionPct = (Math.abs(monthlyCostDelta) / modelAnalysis.roiContext.totalMonthlyRevenue) * 100;

              return (
                <div className={`rounded-xl p-4 ${modelProj.isCostSaving ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-pink-500/10 border border-pink-500/20'}`}>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-white/50 text-xs mb-1">Current Cost</div>
                      <div className="text-white font-bold text-xl">{formatCost(featureProj.currentMonthlyCost)}</div>
                      <div className="text-white/40 text-xs">per month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl text-white/30">→</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white/50 text-xs mb-1">Projected Cost</div>
                      <div className={`font-bold text-xl ${modelProj.isCostSaving ? 'text-emerald-400' : 'text-pink-400'}`}>
                        {formatCost(modelProj.projectedMonthlyCost)}
                      </div>
                      <div className="text-white/40 text-xs">per month</div>
                    </div>
                  </div>

                  <div className={`text-center mb-4 py-2 rounded-lg ${modelProj.isCostSaving ? 'bg-emerald-500/20' : 'bg-pink-500/20'}`}>
                    <span className={`text-2xl font-bold ${modelProj.isCostSaving ? 'text-emerald-400' : 'text-pink-400'}`}>
                      {modelProj.isCostSaving ? '-' : '+'}{formatCost(Math.abs(monthlyCostDelta))}
                    </span>
                    <span className="text-white/50 text-sm ml-2">
                      ({modelProj.multiplier.toFixed(1)}x {modelProj.isCostSaving ? 'cheaper' : 'more expensive'})
                    </span>
                  </div>

                  {!modelProj.isCostSaving && (
                    <div className="bg-[#1B1F39] rounded-lg p-4">
                      <div className="text-white/70 text-sm font-medium mb-3">To break even, you need ONE of:</div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                          <span className="text-white">+{breakEvenConversions} new conversions/month</span>
                          <span className="text-white/40">(at $79/6mo LTV)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                          <span className="text-white">+{breakEvenRetentionPct.toFixed(2)}% retention improvement</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                          <span className="text-white">+${(Math.abs(monthlyCostDelta) / Math.max(1, modelAnalysis.roiContext.proUserCount)).toFixed(2)}/user price increase</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Feature Upgrade Matrix */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-6">
            <h3 className="text-white font-semibold mb-2">Feature Upgrade Matrix</h3>
            <p className="text-white/50 text-sm mb-4">Monthly cost projections for each feature with different models</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/50 font-medium py-2 px-3">Feature</th>
                    <th className="text-center text-white/50 font-medium py-2 px-3">Current</th>
                    <th className="text-center text-white/50 font-medium py-2 px-3">Calls/Mo</th>
                    {modelAnalysis.upgradeOptions.slice(0, 4).map(opt => (
                      <th key={opt.modelId} className="text-center text-white/50 font-medium py-2 px-3">
                        {opt.displayName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modelAnalysis.upgradeProjections.map(feature => (
                    <tr key={feature.feature} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: FEATURE_COLORS[feature.feature] || '#888' }}
                          />
                          <span className="text-white">{feature.displayName}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-3 text-cyan-400">{formatCost(feature.currentMonthlyCost)}</td>
                      <td className="text-center py-3 px-3 text-white/60">{feature.monthlyCalls}</td>
                      {modelAnalysis.upgradeOptions.slice(0, 4).map(opt => {
                        const proj = feature.projections.find(p => p.modelId === opt.modelId);
                        if (!proj) return <td key={opt.modelId} className="text-center py-3 px-3 text-white/30">-</td>;
                        return (
                          <td key={opt.modelId} className="text-center py-3 px-3">
                            <div className={proj.isCostSaving ? 'text-emerald-400' : proj.delta > 0 ? 'text-pink-400' : 'text-white'}>
                              {formatCost(proj.projectedMonthlyCost)}
                            </div>
                            <div className={`text-xs ${proj.isCostSaving ? 'text-emerald-400/60' : 'text-pink-400/60'}`}>
                              {proj.isCostSaving ? '-' : '+'}{formatCost(Math.abs(proj.delta))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Model Capability Cards */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-6">
            <h3 className="text-white font-semibold mb-4">Model Reference</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(modelAnalysis.modelCatalog).slice(0, 8).map(([modelId, model]) => {
                const isExpanded = expandedModelCards.has(modelId);
                return (
                  <div key={modelId} className="bg-[#1B1F39] rounded-xl overflow-hidden">
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedModelCards);
                        if (isExpanded) {
                          newExpanded.delete(modelId);
                        } else {
                          newExpanded.add(modelId);
                        }
                        setExpandedModelCards(newExpanded);
                      }}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          model.tier === 'budget' ? 'bg-emerald-400' :
                          model.tier === 'standard' ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`} />
                        <div className="text-left">
                          <div className="text-white font-medium">{model.displayName}</div>
                          <div className="text-white/40 text-xs">{model.provider} • {model.contextWindow}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-cyan-400 text-sm">${model.inputCost}/${model.outputCost}</div>
                          <div className="text-white/40 text-xs">per 1M tokens</div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-white/40" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-white/40" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
                        <div>
                          <div className="text-white/50 text-xs mb-1">Role</div>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            model.role === 'current' ? 'bg-cyan-500/20 text-cyan-400' :
                            model.role === 'upgrade' ? 'bg-pink-500/20 text-pink-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {model.role.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-white/50 text-xs mb-1">Best For</div>
                          <div className="flex flex-wrap gap-1">
                            {model.bestFor.map((use, i) => (
                              <span key={i} className="px-2 py-0.5 bg-white/5 text-white/70 text-xs rounded">
                                {use}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/50 text-xs mb-1">Notes</div>
                          <div className="text-white/60 text-sm">{model.notes}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ROI Context */}
          <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-6">
            <h3 className="text-white font-semibold mb-4">ROI Context</h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-[#1B1F39] rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{modelAnalysis.roiContext.proUserCount}</div>
                <div className="text-white/40 text-xs">Pro Users</div>
              </div>
              <div className="bg-[#1B1F39] rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">${modelAnalysis.roiContext.monthlyRevenuePerUser.toFixed(2)}</div>
                <div className="text-white/40 text-xs">Rev/User/Mo</div>
              </div>
              <div className="bg-[#1B1F39] rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">${modelAnalysis.roiContext.ltv}</div>
                <div className="text-white/40 text-xs">6-Month LTV</div>
              </div>
              <div className="bg-[#1B1F39] rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{modelAnalysis.roiContext.currentConversionRate.toFixed(1)}%</div>
                <div className="text-white/40 text-xs">Trial Conversion</div>
              </div>
              <div className="bg-[#1B1F39] rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">${modelAnalysis.roiContext.totalMonthlyRevenue.toFixed(0)}</div>
                <div className="text-white/40 text-xs">Monthly Revenue</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Analysis Tab - No Data State */}
      {activeTab === 'models' && !modelAnalysis && !loading && (
        <div className="bg-[#0F1123] rounded-2xl border border-white/5 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-pink-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Model Analysis Unavailable</h3>
          <p className="text-white/50 text-sm">Unable to load model analysis data. Please try refreshing.</p>
        </div>
      )}

      {/* User Detail Modal */}
      {userModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1123] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">{selectedUser.user.email}</h3>
                <p className="text-white/50 text-sm">{selectedUser.user.name || 'No name'}</p>
              </div>
              <button
                onClick={() => setUserModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
              {/* User Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#1B1F39] rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{formatCost(selectedUser.totalCost)}</div>
                  <div className="text-white/50 text-xs">Total Cost</div>
                </div>
                <div className="bg-[#1B1F39] rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">{selectedUser.totalCalls}</div>
                  <div className="text-white/50 text-xs">API Calls</div>
                </div>
                <div className="bg-[#1B1F39] rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{formatCost(selectedUser.subscriptionValue)}</div>
                  <div className="text-white/50 text-xs">Revenue/mo</div>
                </div>
                <div className="bg-[#1B1F39] rounded-xl p-3 text-center">
                  <div className={`text-2xl font-bold ${selectedUser.profitMargin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedUser.profitMargin >= 0 ? '+' : ''}{formatCost(selectedUser.profitMargin)}
                  </div>
                  <div className="text-white/50 text-xs">Margin</div>
                </div>
              </div>

              {/* Feature Breakdown */}
              <div>
                <h4 className="text-white font-medium mb-2">Feature Usage</h4>
                <div className="space-y-2">
                  {selectedUser.featureBreakdown.map(f => (
                    <div key={f.feature_name} className="flex items-center justify-between bg-[#1B1F39] rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: FEATURE_COLORS[f.feature_name] || '#888' }}
                        />
                        <span className="text-white">{formatFeatureName(f.feature_name)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-cyan-400">{formatCost(f.total_cost)}</span>
                        <span className="text-white/30 ml-2">({f.call_count} calls)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly History */}
              {selectedUser.monthlyHistory.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Monthly History</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={selectedUser.monthlyHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1B1F39" />
                      <XAxis dataKey="month" stroke="#ffffff50" fontSize={10} />
                      <YAxis stroke="#ffffff50" fontSize={10} tickFormatter={(v) => `$${v.toFixed(2)}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1B1F39', border: 'none', borderRadius: '8px' }}
                        formatter={(value) => [`$${(value as number)?.toFixed(4) ?? '0'}`, 'Cost']}
                      />
                      <Bar dataKey="cost" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Operational Costs Management Modal */}
      {showOpsCostModal && financialData?.operationalCosts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1123] rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Operational Costs</h3>
                <p className="text-white/50 text-sm">Manage monthly infrastructure & service costs</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingOpsCost({
                    provider: '',
                    actual_cost: '',
                    billing_cycle: 'monthly',
                    category: 'infrastructure',
                    description: '',
                    notes: '',
                    is_variable: false
                  })}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Cost
                </button>
                <button
                  onClick={() => setShowOpsCostModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[65vh]">
              {/* Summary by Category */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {Object.entries(financialData.operationalCosts.byCategory).map(([category, data]) => (
                  <div key={category} className="bg-[#1B1F39] rounded-xl p-4">
                    <div className="text-white/50 text-xs uppercase mb-1">{category}</div>
                    <div className="text-xl font-bold text-white">{formatCost(data.total)}</div>
                    <div className="text-white/30 text-xs mt-1">{data.providers.length} services</div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-4 mb-6 border border-red-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/70 text-sm">Total Fixed Monthly</div>
                    <div className="text-2xl font-bold text-white">{formatCost(financialData.operationalCosts.totalFixed)}/mo</div>
                  </div>
                  {financialData.operationalCosts.hasVariableCosts && (
                    <div className="text-orange-400 text-sm">+ variable costs (Stripe)</div>
                  )}
                </div>
              </div>

              {/* Costs Table */}
              <table className="w-full">
                <thead className="bg-[#1B1F39]">
                  <tr>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Provider</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Category</th>
                    <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Monthly Cost</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Notes</th>
                    <th className="text-right text-white/50 text-sm font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {financialData.operationalCosts.costs.map((cost, i) => (
                    <tr key={cost.id} className={i % 2 === 0 ? 'bg-[#0A0B14]' : 'bg-[#0F1123]'}>
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{cost.provider}</div>
                        {cost.description && <div className="text-white/40 text-xs">{cost.description}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          cost.category === 'infrastructure' ? 'bg-blue-500/20 text-blue-400' :
                          cost.category === 'services' ? 'bg-purple-500/20 text-purple-400' :
                          cost.category === 'tools' ? 'bg-cyan-500/20 text-cyan-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {cost.category}
                        </span>
                      </td>
                      <td className="text-right px-4 py-3">
                        {cost.is_variable ? (
                          <span className="text-orange-400 italic">Variable</span>
                        ) : (
                          <div>
                            <span className="text-white font-medium">{formatCost(parseFloat(cost.monthly_cost))}/mo</span>
                            {cost.billing_cycle && cost.billing_cycle !== 'monthly' && (
                              <div className="text-white/40 text-xs">
                                ({formatCost(parseFloat(cost.actual_cost || cost.monthly_cost))} {cost.billing_cycle === 'annual' ? 'annually' : 'bi-annually'})
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/40 text-sm max-w-[200px] truncate">
                        {cost.notes || '-'}
                      </td>
                      <td className="text-right px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingOpsCost({
                              id: cost.id,
                              provider: cost.provider,
                              actual_cost: cost.actual_cost || cost.monthly_cost,
                              billing_cycle: cost.billing_cycle || 'monthly',
                              category: cost.category,
                              description: cost.description || '',
                              notes: cost.notes || '',
                              is_variable: cost.is_variable
                            })}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 text-white/50 hover:text-cyan-400" />
                          </button>
                          <button
                            onClick={() => deleteOpsCost(cost.id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-white/50 hover:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Operational Cost Modal */}
      {editingOpsCost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[#0F1123] rounded-2xl max-w-md w-full border border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-semibold">
                {editingOpsCost.id ? 'Edit Cost' : 'Add Operational Cost'}
              </h3>
              <button
                onClick={() => setEditingOpsCost(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Provider</label>
                <input
                  type="text"
                  value={editingOpsCost.provider}
                  onChange={(e) => setEditingOpsCost({ ...editingOpsCost, provider: e.target.value })}
                  className="w-full bg-[#1B1F39] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="e.g., AWS, Stripe"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingOpsCost.actual_cost}
                    onChange={(e) => setEditingOpsCost({ ...editingOpsCost, actual_cost: e.target.value })}
                    className="w-full bg-[#1B1F39] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    placeholder="0.00"
                    disabled={editingOpsCost.is_variable}
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Billing Cycle</label>
                  <select
                    value={editingOpsCost.billing_cycle}
                    onChange={(e) => setEditingOpsCost({ ...editingOpsCost, billing_cycle: e.target.value as 'monthly' | 'biannual' | 'annual' })}
                    className="w-full bg-[#1B1F39] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                    disabled={editingOpsCost.is_variable}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="biannual">Bi-Annual (6 mo)</option>
                    <option value="annual">Annual (12 mo)</option>
                  </select>
                </div>
              </div>
              {editingOpsCost.billing_cycle !== 'monthly' && editingOpsCost.actual_cost && (
                <div className="text-xs text-cyan-400 -mt-2">
                  = ${(parseFloat(editingOpsCost.actual_cost) / (editingOpsCost.billing_cycle === 'annual' ? 12 : 6)).toFixed(2)}/month
                </div>
              )}
              <div>
                <label className="block text-white/70 text-sm mb-1">Category</label>
                <select
                  value={editingOpsCost.category}
                  onChange={(e) => setEditingOpsCost({ ...editingOpsCost, category: e.target.value })}
                  className="w-full bg-[#1B1F39] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="infrastructure">Infrastructure</option>
                  <option value="services">Services</option>
                  <option value="tools">Tools</option>
                  <option value="payments">Payments</option>
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Description</label>
                <input
                  type="text"
                  value={editingOpsCost.description}
                  onChange={(e) => setEditingOpsCost({ ...editingOpsCost, description: e.target.value })}
                  className="w-full bg-[#1B1F39] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="e.g., Web hosting and deployment"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Notes</label>
                <input
                  type="text"
                  value={editingOpsCost.notes}
                  onChange={(e) => setEditingOpsCost({ ...editingOpsCost, notes: e.target.value })}
                  className="w-full bg-[#1B1F39] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="e.g., Free tier, ~2.9% per transaction"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingOpsCost.is_variable}
                  onChange={(e) => setEditingOpsCost({ ...editingOpsCost, is_variable: e.target.checked, actual_cost: e.target.checked ? '0' : editingOpsCost.actual_cost })}
                  className="w-4 h-4 rounded bg-[#1B1F39] border-white/20"
                />
                <span className="text-white/80">Variable cost (per-transaction)</span>
              </label>
            </div>
            <div className="p-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setEditingOpsCost(null)}
                className="px-4 py-2 text-white/50 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveOpsCost}
                disabled={opsCostSaving || !editingOpsCost.provider || (!editingOpsCost.is_variable && !editingOpsCost.actual_cost)}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {opsCostSaving && <RefreshCw className="w-4 h-4 animate-spin" />}
                {editingOpsCost.id ? 'Save Changes' : 'Add Cost'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  color
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
  trend?: number | null;
  color: 'cyan' | 'purple' | 'orange' | 'emerald';
}) {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400',
    orange: 'from-orange-500/20 to-orange-500/5 text-orange-400',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} rounded-2xl p-5 border border-white/5`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[2]}`} />
        </div>
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-white/50 text-sm mt-1">{label}</div>
      {subtitle && <div className="text-white/30 text-xs mt-0.5">{subtitle}</div>}
    </div>
  );
}
