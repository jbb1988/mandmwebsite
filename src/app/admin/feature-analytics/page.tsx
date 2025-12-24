'use client';

import { useEffect, useState } from 'react';
import AdminGate from '@/components/AdminGate';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Card } from '@/components/admin/shared/Card';
import { StatCard } from '@/components/admin/shared/StatCard';
import {
  BarChart3, Users, TrendingUp, TrendingDown, AlertTriangle,
  Loader2, Search, X, ChevronDown, ChevronUp, ArrowUpRight,
  ArrowDownRight, Minus, RefreshCw, Activity, Heart, Target,
  Zap, Shield, Clock, Star, Gift, UserX, Wrench, Download,
  Mail, DollarSign, AlertCircle, CheckCircle2, Video, FlaskConical
} from 'lucide-react';

interface FeatureStats {
  feature_name: string;
  category: string;
  opens_7d: number;
  users_7d: number;
  completions_7d: number;
  completion_rate: number;
  trend_pct: number | null;
}

interface SegmentCounts {
  power_users: number;
  growing: number;
  at_risk: number;
  dormant: number;
}

interface HealthDistribution {
  low: number;
  medium: number;
  at_risk: number;
  high_risk: number;
  unknown: number;
}

interface Overview {
  activeUsers: number;
  totalUsers: number;
  avgFeaturesPerUser: number;
  mostUsedFeature: string | null;
  mostUnderutilized: string | null;
  timeRange: string;
}

interface UserDetail {
  user_id: string;
  email: string;
  name: string | null;
  tier: string;
  features_used: number;
  last_activity: string | null;
  health_score: number;
  risk_level: string;
  segment: string;
}

interface UserFeatureProfile {
  user_id: string;
  email: string;
  name: string | null;
  tier: string;
  features_used: number;
  health_score: number;
  risk_level: string;
  last_activity: string | null;
  segment: string;
  feature_breakdown: {
    feature_name: string;
    total_opens: number;
    total_completions: number;
    last_used_at: string | null;
  }[];
}

interface HealthDetails {
  feature_breadth_score: number;
  data_depth_score: number;
  engagement_recency_score: number;
  streak_score: number;
  social_score: number;
  features_used_count: number;
  analyses_count: number;
  journal_entries_count: number;
  days_since_last_activity: number;
  current_streak: number;
  team_memberships: number;
  messages_sent: number;
}

interface ConversionOpportunity {
  user_id: string;
  email: string;
  name: string | null;
  tier: string;
  features_used: number;
  total_opens: number;
  days_active: number;
  last_activity: string | null;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface ChurnRisk {
  user_id: string;
  email: string;
  name: string | null;
  tier: string;
  promo_tier_expires_at: string | null;
  days_until_expiry: number | null;
  days_inactive: number;
  pro_features_used: number;
  total_pro_features: number;
  health_score: number;
  risk_reason: string;
  risk_level: 'critical' | 'high' | 'medium';
}

interface FeatureHealthIssue {
  feature_name: string;
  opens: number;
  completions: number;
  completion_rate: number;
  unique_users: number;
  issue: string | null;
}

interface Insights {
  conversion_opportunities: {
    total: number;
    high_priority: number;
    users: ConversionOpportunity[];
  };
  churn_risks: {
    total: number;
    critical: number;
    high: number;
    users: ChurnRisk[];
  };
  feature_health: {
    issues_count: number;
    features: FeatureHealthIssue[];
  };
}

interface LabUser {
  user_id: string;
  email: string;
  name: string | null;
  app_version: string | null;
  tier: string;
  swing_lab_count: number;
  pitch_lab_count: number;
  last_swing_analysis: string | null;
  last_pitch_analysis: string | null;
  total_analyses: number;
}

interface LabActivityStats {
  total_swing_analyses: number;
  total_pitch_analyses: number;
  unique_swing_users: number;
  unique_pitch_users: number;
  analyses_today: number;
  analyses_this_week: number;
}

const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || '';

export default function FeatureAnalyticsPage() {
  const { getPassword } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [features, setFeatures] = useState<FeatureStats[]>([]);
  const [segments, setSegments] = useState<SegmentCounts | null>(null);
  const [healthDistribution, setHealthDistribution] = useState<HealthDistribution | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('7');
  const [sortBy, setSortBy] = useState<'opens' | 'users' | 'rate' | 'trend'>('opens');
  const [sortAsc, setSortAsc] = useState(false);

  // Drill-down states
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [drillDownUsers, setDrillDownUsers] = useState<UserDetail[]>([]);
  const [userProfile, setUserProfile] = useState<UserFeatureProfile | null>(null);
  const [healthDetails, setHealthDetails] = useState<HealthDetails | null>(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);
  const [showNonUsers, setShowNonUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recalculating, setRecalculating] = useState(false);

  // New: Insights and actions state
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'labs'>('overview');
  const [insights, setInsights] = useState<Insights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Lab Activity state
  const [labUsers, setLabUsers] = useState<LabUser[]>([]);
  const [labStats, setLabStats] = useState<LabActivityStats | null>(null);
  const [labLoading, setLabLoading] = useState(false);
  const [labTimeRange, setLabTimeRange] = useState('30');
  const [labFilter, setLabFilter] = useState<'all' | 'swing' | 'pitch'>('all');
  const [labSort, setLabSort] = useState<'last_activity' | 'total' | 'swing' | 'pitch'>('last_activity');
  const [labSearchQuery, setLabSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        days: timeRange,
        category: selectedCategory,
      });

      const res = await fetch(`/api/admin/feature-analytics?${params}`, {
        headers: { 'X-Admin-Password': getPassword() || adminPassword },
      });
      const data = await res.json();

      if (data.success) {
        setOverview(data.overview);
        setFeatures(data.features);
        setSegments(data.segments);
        setHealthDistribution(data.healthDistribution);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch feature analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatureUsers = async (featureName: string, showNon: boolean = false) => {
    setDrillDownLoading(true);
    try {
      const params = new URLSearchParams({
        feature: featureName,
        showNonUsers: showNon.toString(),
        search: searchQuery,
      });

      const res = await fetch(`/api/admin/feature-analytics/users?${params}`, {
        headers: { 'X-Admin-Password': getPassword() || adminPassword },
      });
      const data = await res.json();

      if (data.success) {
        setDrillDownUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch feature users:', error);
    } finally {
      setDrillDownLoading(false);
    }
  };

  const fetchSegmentUsers = async (segment: string) => {
    setDrillDownLoading(true);
    try {
      const params = new URLSearchParams({
        segment,
        search: searchQuery,
      });

      const res = await fetch(`/api/admin/feature-analytics/users?${params}`, {
        headers: { 'X-Admin-Password': getPassword() || adminPassword },
      });
      const data = await res.json();

      if (data.success) {
        setDrillDownUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch segment users:', error);
    } finally {
      setDrillDownLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    setDrillDownLoading(true);
    try {
      const res = await fetch(`/api/admin/feature-analytics/users?userId=${userId}`, {
        headers: { 'X-Admin-Password': getPassword() || adminPassword },
      });
      const data = await res.json();

      if (data.success) {
        setUserProfile(data.user);
        setHealthDetails(data.healthDetails);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setDrillDownLoading(false);
    }
  };

  const recalculateHealthScores = async () => {
    setRecalculating(true);
    try {
      const res = await fetch('/api/admin/feature-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword() || adminPassword,
        },
        body: JSON.stringify({ action: 'recalculate-health-scores' }),
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to recalculate health scores:', error);
    } finally {
      setRecalculating(false);
    }
  };

  // Fetch actionable insights
  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const res = await fetch('/api/admin/feature-analytics/insights', {
        headers: { 'X-Admin-Password': getPassword() || adminPassword },
      });
      const data = await res.json();

      if (data.success) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Fetch lab activity data
  const fetchLabActivity = async () => {
    setLabLoading(true);
    try {
      const params = new URLSearchParams({
        days: labTimeRange,
        lab: labFilter,
        sort: labSort,
      });

      const res = await fetch(`/api/admin/feature-analytics/lab-activity?${params}`, {
        headers: { 'X-Admin-Password': getPassword() || adminPassword },
      });
      const data = await res.json();

      if (data.success) {
        setLabStats(data.stats);
        setLabUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch lab activity:', error);
    } finally {
      setLabLoading(false);
    }
  };

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Select all users in a list
  const selectAllUsers = (userIds: string[]) => {
    setSelectedUsers(new Set(userIds));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedUsers(new Set());
  };

  // Grant trial extension to selected users
  const grantTrialExtension = async (days: number = 7) => {
    if (selectedUsers.size === 0) return;

    setActionLoading(true);
    setActionResult(null);
    try {
      const res = await fetch('/api/admin/feature-analytics/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword() || adminPassword,
        },
        body: JSON.stringify({
          action: 'grant-trial-extension',
          user_ids: Array.from(selectedUsers),
          days,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setActionResult({ success: true, message: data.message });
        setSelectedUsers(new Set());
        fetchInsights(); // Refresh insights
      } else {
        setActionResult({ success: false, message: data.error || 'Failed to grant trial' });
      }
    } catch (error) {
      setActionResult({ success: false, message: 'Network error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Export selected users as CSV
  const exportSelectedUsers = async () => {
    if (selectedUsers.size === 0) return;

    try {
      const res = await fetch('/api/admin/feature-analytics/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword() || adminPassword,
        },
        body: JSON.stringify({
          action: 'export-csv',
          user_ids: Array.from(selectedUsers),
        }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users-export.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export users:', error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, selectedCategory]);

  // Fetch insights when tab changes to insights
  useEffect(() => {
    if (activeTab === 'insights' && !insights) {
      fetchInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Fetch lab activity when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'labs') {
      fetchLabActivity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, labTimeRange, labFilter, labSort]);

  useEffect(() => {
    if (selectedFeature) {
      fetchFeatureUsers(selectedFeature, showNonUsers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFeature, showNonUsers]);

  useEffect(() => {
    if (selectedSegment) {
      fetchSegmentUsers(selectedSegment);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSegment]);

  useEffect(() => {
    if (selectedUser) {
      fetchUserProfile(selectedUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  const handleSort = (column: 'opens' | 'users' | 'rate' | 'trend') => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(false);
    }
  };

  const sortedFeatures = [...features].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case 'opens':
        aVal = a.opens_7d;
        bVal = b.opens_7d;
        break;
      case 'users':
        aVal = a.users_7d;
        bVal = b.users_7d;
        break;
      case 'rate':
        aVal = a.completion_rate;
        bVal = b.completion_rate;
        break;
      case 'trend':
        aVal = a.trend_pct || 0;
        bVal = b.trend_pct || 0;
        break;
      default:
        return 0;
    }
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const formatFeatureName = (name: string) => {
    return name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-emerald-400';
      case 'medium': return 'text-amber-400';
      case 'at_risk': return 'text-orange-400';
      case 'high_risk': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'power_user': return 'text-emerald-400';
      case 'growing': return 'text-blue-400';
      case 'at_risk': return 'text-orange-400';
      case 'dormant': return 'text-gray-400';
      default: return 'text-white';
    }
  };

  const closeDrillDown = () => {
    setSelectedFeature(null);
    setSelectedSegment(null);
    setSelectedUser(null);
    setDrillDownUsers([]);
    setUserProfile(null);
    setHealthDetails(null);
    setShowNonUsers(false);
    setSearchQuery('');
  };

  return (
    <AdminGate>
      <div className="min-h-screen bg-[#0A0B14] text-white">
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5 pointer-events-none" />

        <div className="relative z-10 pt-28 pb-12 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                <BarChart3 className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Feature Analytics</h1>
              <p className="text-white/50 text-sm sm:text-base">Track feature usage and user engagement</p>
            </div>

            {/* Admin Navigation */}

            {/* Tab Switcher */}
            <div className="flex justify-center gap-2 mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  activeTab === 'overview'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  activeTab === 'insights'
                    ? 'bg-orange-600 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <Zap className="w-4 h-4" />
                Actionable Insights
                {insights && (insights.conversion_opportunities.high_priority > 0 || insights.churn_risks.critical > 0) && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {insights.conversion_opportunities.high_priority + insights.churn_risks.critical}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('labs')}
                className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  activeTab === 'labs'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <Video className="w-4 h-4" />
                Lab Activity
                {labStats && labStats.analyses_today > 0 && (
                  <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {labStats.analyses_today} today
                  </span>
                )}
              </button>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                {/* Filters */}
                <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
                  {/* Time Range Selector */}
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-[#0F1123] border border-white/10 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </select>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-[#0F1123] border border-white/10 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Recalculate Button */}
                  <button
                    onClick={recalculateHealthScores}
                    disabled={recalculating}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm disabled:opacity-50"
                  >
                    {recalculating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Recalculate Scores
                  </button>
                </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <StatCard
                  value={overview?.activeUsers || 0}
                  label={`Active Users (${overview?.timeRange})`}
                  icon={Users}
                  color="cyan"
                />
                <StatCard
                  value={overview?.avgFeaturesPerUser || 0}
                  label="Avg Features/User"
                  icon={Target}
                  color="blue"
                />
                <StatCard
                  value={formatFeatureName(overview?.mostUsedFeature || '-')}
                  label="Most Used"
                  icon={Star}
                  color="emerald"
                  size="sm"
                />
                <StatCard
                  value={formatFeatureName(overview?.mostUnderutilized || '-')}
                  label="Underutilized"
                  icon={AlertTriangle}
                  color="orange"
                  size="sm"
                />
                <StatCard
                  value={overview?.totalUsers || 0}
                  label="Total Users"
                  icon={Users}
                  color="purple"
                />
              </div>

              {/* User Segments & Health Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* User Segments */}
                <Card variant="elevated" className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    User Segments
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { setSelectedSegment('power_user'); setSelectedFeature(null); setSelectedUser(null); }}
                      className="p-4 bg-[#0A0B14]/60 rounded-lg hover:bg-[#0A0B14] transition text-left"
                    >
                      <div className="text-2xl font-bold text-emerald-400">{segments?.power_users || 0}</div>
                      <div className="text-sm text-white/50">Power Users (10+ features)</div>
                    </button>
                    <button
                      onClick={() => { setSelectedSegment('growing'); setSelectedFeature(null); setSelectedUser(null); }}
                      className="p-4 bg-[#0A0B14]/60 rounded-lg hover:bg-[#0A0B14] transition text-left"
                    >
                      <div className="text-2xl font-bold text-blue-400">{segments?.growing || 0}</div>
                      <div className="text-sm text-white/50">Growing (3-9 features)</div>
                    </button>
                    <button
                      onClick={() => { setSelectedSegment('at_risk'); setSelectedFeature(null); setSelectedUser(null); }}
                      className="p-4 bg-[#0A0B14]/60 rounded-lg hover:bg-[#0A0B14] transition text-left"
                    >
                      <div className="text-2xl font-bold text-orange-400">{segments?.at_risk || 0}</div>
                      <div className="text-sm text-white/50">At Risk (1-2 features)</div>
                    </button>
                    <button
                      onClick={() => { setSelectedSegment('dormant'); setSelectedFeature(null); setSelectedUser(null); }}
                      className="p-4 bg-[#0A0B14]/60 rounded-lg hover:bg-[#0A0B14] transition text-left"
                    >
                      <div className="text-2xl font-bold text-gray-400">{segments?.dormant || 0}</div>
                      <div className="text-sm text-white/50">Dormant (no activity)</div>
                    </button>
                  </div>
                </Card>

                {/* Health Score Distribution */}
                <Card variant="elevated" className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-400" />
                    User Health Scores (Switching Cost)
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Low Risk (80-100)', value: healthDistribution?.low || 0, color: 'bg-emerald-500' },
                      { label: 'Medium Risk (60-79)', value: healthDistribution?.medium || 0, color: 'bg-amber-500' },
                      { label: 'At Risk (40-59)', value: healthDistribution?.at_risk || 0, color: 'bg-orange-500' },
                      { label: 'High Risk (0-39)', value: healthDistribution?.high_risk || 0, color: 'bg-red-500' },
                      { label: 'Unknown', value: healthDistribution?.unknown || 0, color: 'bg-gray-500' },
                    ].map(item => {
                      const total = Object.values(healthDistribution || {}).reduce((a, b) => a + b, 0) || 1;
                      const pct = Math.round((item.value / total) * 100);
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/70">{item.label}</span>
                            <span className="text-white/50">{item.value} ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.color} rounded-full transition-all`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Feature Usage Table */}
              <Card variant="elevated" className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Feature Usage ({sortedFeatures.length} features)
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Feature</th>
                        <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Category</th>
                        <th
                          className="text-right py-3 px-4 text-white/50 text-sm font-medium cursor-pointer hover:text-white"
                          onClick={() => handleSort('opens')}
                        >
                          Opens {sortBy === 'opens' && (sortAsc ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
                        </th>
                        <th
                          className="text-right py-3 px-4 text-white/50 text-sm font-medium cursor-pointer hover:text-white"
                          onClick={() => handleSort('users')}
                        >
                          Users {sortBy === 'users' && (sortAsc ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
                        </th>
                        <th
                          className="text-right py-3 px-4 text-white/50 text-sm font-medium cursor-pointer hover:text-white"
                          onClick={() => handleSort('rate')}
                        >
                          Completion {sortBy === 'rate' && (sortAsc ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
                        </th>
                        <th
                          className="text-right py-3 px-4 text-white/50 text-sm font-medium cursor-pointer hover:text-white"
                          onClick={() => handleSort('trend')}
                        >
                          Trend {sortBy === 'trend' && (sortAsc ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />)}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFeatures.map(feature => (
                        <tr
                          key={feature.feature_name}
                          className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition"
                          onClick={() => { setSelectedFeature(feature.feature_name); setSelectedSegment(null); setSelectedUser(null); }}
                        >
                          <td className="py-3 px-4 font-medium">{formatFeatureName(feature.feature_name)}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-white/10 rounded text-xs">{feature.category}</span>
                          </td>
                          <td className="py-3 px-4 text-right">{feature.opens_7d.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{feature.users_7d.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{feature.completion_rate}%</td>
                          <td className="py-3 px-4 text-right">
                            {feature.trend_pct !== null ? (
                              <span className={`flex items-center justify-end gap-1 ${
                                feature.trend_pct > 0 ? 'text-emerald-400' :
                                feature.trend_pct < 0 ? 'text-red-400' : 'text-white/50'
                              }`}>
                                {feature.trend_pct > 0 ? <ArrowUpRight className="w-4 h-4" /> :
                                 feature.trend_pct < 0 ? <ArrowDownRight className="w-4 h-4" /> :
                                 <Minus className="w-4 h-4" />}
                                {Math.abs(feature.trend_pct)}%
                              </span>
                            ) : (
                              <span className="text-white/30">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Drill-Down Modal */}
              {(selectedFeature || selectedSegment || selectedUser) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <Card variant="elevated" className="w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                    {/* Modal Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                      <div>
                        {selectedUser && userProfile ? (
                          <>
                            <h3 className="text-xl font-bold">{userProfile.name || userProfile.email}</h3>
                            <p className="text-white/50 text-sm">{userProfile.email}</p>
                          </>
                        ) : selectedFeature ? (
                          <>
                            <h3 className="text-xl font-bold">{formatFeatureName(selectedFeature)}</h3>
                            <p className="text-white/50 text-sm">Users {showNonUsers ? 'NOT using' : 'using'} this feature</p>
                          </>
                        ) : selectedSegment ? (
                          <>
                            <h3 className="text-xl font-bold">{selectedSegment.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Segment</h3>
                            <p className="text-white/50 text-sm">{drillDownUsers.length} users</p>
                          </>
                        ) : null}
                      </div>
                      <button onClick={closeDrillDown} className="p-2 hover:bg-white/10 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6 overflow-y-auto flex-1">
                      {drillDownLoading ? (
                        <div className="flex items-center justify-center h-48">
                          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                        </div>
                      ) : selectedUser && userProfile ? (
                        /* User Profile View */
                        <div className="space-y-6">
                          {/* User Stats */}
                          <div className="grid grid-cols-4 gap-4">
                            <div className="p-4 bg-[#0A0B14]/60 rounded-lg text-center">
                              <div className={`text-2xl font-bold ${getRiskColor(userProfile.risk_level)}`}>
                                {userProfile.health_score}
                              </div>
                              <div className="text-xs text-white/50">Health Score</div>
                            </div>
                            <div className="p-4 bg-[#0A0B14]/60 rounded-lg text-center">
                              <div className="text-2xl font-bold text-blue-400">{userProfile.features_used}</div>
                              <div className="text-xs text-white/50">Features Used</div>
                            </div>
                            <div className="p-4 bg-[#0A0B14]/60 rounded-lg text-center">
                              <div className={`text-2xl font-bold ${getSegmentColor(userProfile.segment)}`}>
                                {userProfile.segment.replace('_', ' ')}
                              </div>
                              <div className="text-xs text-white/50">Segment</div>
                            </div>
                            <div className="p-4 bg-[#0A0B14]/60 rounded-lg text-center">
                              <div className="text-2xl font-bold text-purple-400">{userProfile.tier}</div>
                              <div className="text-xs text-white/50">Tier</div>
                            </div>
                          </div>

                          {/* Health Score Breakdown */}
                          {healthDetails && (
                            <div>
                              <h4 className="font-semibold mb-3">Health Score Breakdown</h4>
                              <div className="grid grid-cols-5 gap-3">
                                {[
                                  { label: 'Feature Breadth', value: healthDetails.feature_breadth_score, icon: Target },
                                  { label: 'Data Depth', value: healthDetails.data_depth_score, icon: Shield },
                                  { label: 'Recency', value: healthDetails.engagement_recency_score, icon: Clock },
                                  { label: 'Streak', value: healthDetails.streak_score, icon: Zap },
                                  { label: 'Social', value: healthDetails.social_score, icon: Users },
                                ].map(item => (
                                  <div key={item.label} className="p-3 bg-[#0A0B14]/60 rounded-lg text-center">
                                    <item.icon className="w-4 h-4 mx-auto mb-1 text-white/50" />
                                    <div className="text-lg font-bold">{item.value}</div>
                                    <div className="text-xs text-white/50">{item.label}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Feature Breakdown */}
                          <div>
                            <h4 className="font-semibold mb-3">Feature Usage</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {userProfile.feature_breakdown.filter(f => f.total_opens > 0).map(f => (
                                <div key={f.feature_name} className="flex items-center justify-between p-3 bg-[#0A0B14]/60 rounded-lg">
                                  <span>{formatFeatureName(f.feature_name)}</span>
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="text-white/50">{f.total_opens} opens</span>
                                    <span className="text-emerald-400">{f.total_completions} completed</span>
                                    {f.last_used_at && (
                                      <span className="text-white/30">
                                        {new Date(f.last_used_at).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* User List View */
                        <>
                          {/* Controls */}
                          <div className="flex items-center gap-4 mb-4">
                            {selectedFeature && (
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={showNonUsers}
                                  onChange={(e) => setShowNonUsers(e.target.checked)}
                                  className="rounded"
                                />
                                Show users NOT using this feature
                              </label>
                            )}
                            <div className="flex-1" />
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                              <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-[#0A0B14] border border-white/10 rounded-lg text-sm w-64"
                              />
                            </div>
                          </div>

                          {/* User List */}
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {drillDownUsers.map(user => (
                              <div
                                key={user.user_id}
                                className="flex items-center justify-between p-4 bg-[#0A0B14]/60 rounded-lg hover:bg-[#0A0B14] transition cursor-pointer"
                                onClick={() => setSelectedUser(user.user_id)}
                              >
                                <div>
                                  <div className="font-medium">{user.name || user.email}</div>
                                  <div className="text-sm text-white/50">{user.email}</div>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                  <div>
                                    <span className="text-white/50">Features: </span>
                                    <span className="font-medium">{user.features_used}</span>
                                  </div>
                                  <div>
                                    <span className="text-white/50">Health: </span>
                                    <span className={`font-medium ${getRiskColor(user.risk_level)}`}>
                                      {user.health_score}
                                    </span>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    user.tier === 'pro' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10'
                                  }`}>
                                    {user.tier}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {drillDownUsers.length === 0 && (
                              <div className="text-center py-8 text-white/50">
                                No users found
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Back button for user profile */}
                    {selectedUser && (
                      <div className="p-4 border-t border-white/10">
                        <button
                          onClick={() => setSelectedUser(null)}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
                        >
                          Back to User List
                        </button>
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </>
          )}
              </>
            )}

            {/* INSIGHTS TAB */}
            {activeTab === 'insights' && (
              <>
                {/* Action Result Toast */}
                {actionResult && (
                  <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                    actionResult.success ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30'
                  }`}>
                    {actionResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={actionResult.success ? 'text-emerald-300' : 'text-red-300'}>
                      {actionResult.message}
                    </span>
                    <button
                      onClick={() => setActionResult(null)}
                      className="ml-auto text-white/50 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Quick Actions Bar */}
                {selectedUsers.size > 0 && (
                  <div className="mb-6 p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center gap-4">
                    <span className="text-blue-300 font-medium">
                      {selectedUsers.size} user(s) selected
                    </span>
                    <div className="flex-1" />
                    <button
                      onClick={() => grantTrialExtension(7)}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm disabled:opacity-50"
                    >
                      <Gift className="w-4 h-4" />
                      Grant 7-Day Trial
                    </button>
                    <button
                      onClick={() => grantTrialExtension(30)}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm disabled:opacity-50"
                    >
                      <Gift className="w-4 h-4" />
                      Grant 30-Day Trial
                    </button>
                    <button
                      onClick={exportSelectedUsers}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                    <button
                      onClick={clearSelection}
                      className="flex items-center gap-2 px-3 py-2 text-white/50 hover:text-white text-sm"
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </button>
                  </div>
                )}

                {insightsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                  </div>
                ) : insights ? (
                  <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card variant="elevated" className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                          </div>
                          <h3 className="font-semibold">Conversion Opportunities</h3>
                        </div>
                        <div className="text-3xl font-bold text-emerald-400 mb-1">
                          {insights.conversion_opportunities.high_priority}
                        </div>
                        <p className="text-white/50 text-sm">
                          High-priority free users ready to convert ({insights.conversion_opportunities.total} total)
                        </p>
                      </Card>

                      <Card variant="elevated" className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-red-500/20 rounded-lg">
                            <UserX className="w-5 h-5 text-red-400" />
                          </div>
                          <h3 className="font-semibold">Churn Risks</h3>
                        </div>
                        <div className="text-3xl font-bold text-red-400 mb-1">
                          {insights.churn_risks.critical}
                        </div>
                        <p className="text-white/50 text-sm">
                          Critical churn risks ({insights.churn_risks.high} high, {insights.churn_risks.total} total)
                        </p>
                      </Card>

                      <Card variant="elevated" className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Wrench className="w-5 h-5 text-orange-400" />
                          </div>
                          <h3 className="font-semibold">Feature Issues</h3>
                        </div>
                        <div className="text-3xl font-bold text-orange-400 mb-1">
                          {insights.feature_health.issues_count}
                        </div>
                        <p className="text-white/50 text-sm">
                          Features with low completion rates (possible UX issues)
                        </p>
                      </Card>
                    </div>

                    {/* Conversion Opportunities */}
                    <Card variant="elevated" className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-emerald-400" />
                          Conversion Opportunities
                          <span className="text-sm font-normal text-white/50">
                            Free users with high engagement - offer them a trial!
                          </span>
                        </h3>
                        {insights.conversion_opportunities.users.length > 0 && (
                          <button
                            onClick={() => selectAllUsers(insights.conversion_opportunities.users.map(u => u.user_id))}
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            Select All
                          </button>
                        )}
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {insights.conversion_opportunities.users.map(user => (
                          <div
                            key={user.user_id}
                            className={`flex items-center gap-4 p-4 rounded-lg transition cursor-pointer ${
                              selectedUsers.has(user.user_id)
                                ? 'bg-blue-600/20 border border-blue-500/30'
                                : 'bg-[#0A0B14]/60 hover:bg-[#0A0B14]'
                            }`}
                            onClick={() => toggleUserSelection(user.user_id)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedUsers.has(user.user_id)}
                              onChange={() => toggleUserSelection(user.user_id)}
                              className="rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{user.name || user.email}</div>
                              <div className="text-sm text-white/50">{user.email}</div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className={`px-2 py-1 rounded ${
                                user.priority === 'high' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {user.priority}
                              </span>
                              <span className="text-white/50">{user.features_used} features</span>
                              <span className="text-white/50">{user.total_opens} opens</span>
                            </div>
                            <div className="text-xs text-white/30 max-w-48 truncate">
                              {user.reason}
                            </div>
                          </div>
                        ))}
                        {insights.conversion_opportunities.users.length === 0 && (
                          <div className="text-center py-8 text-white/50">
                            No conversion opportunities found
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Churn Risks */}
                    <Card variant="elevated" className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <UserX className="w-5 h-5 text-red-400" />
                          Churn Risks
                          <span className="text-sm font-normal text-white/50">
                            Trial/Pro users at risk of churning - intervene now!
                          </span>
                        </h3>
                        {insights.churn_risks.users.length > 0 && (
                          <button
                            onClick={() => selectAllUsers(insights.churn_risks.users.map(u => u.user_id))}
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            Select All
                          </button>
                        )}
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {insights.churn_risks.users.map(user => (
                          <div
                            key={user.user_id}
                            className={`flex items-center gap-4 p-4 rounded-lg transition cursor-pointer ${
                              selectedUsers.has(user.user_id)
                                ? 'bg-blue-600/20 border border-blue-500/30'
                                : 'bg-[#0A0B14]/60 hover:bg-[#0A0B14]'
                            }`}
                            onClick={() => toggleUserSelection(user.user_id)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedUsers.has(user.user_id)}
                              onChange={() => toggleUserSelection(user.user_id)}
                              className="rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{user.name || user.email}</div>
                              <div className="text-sm text-white/50">{user.email}</div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className={`px-2 py-1 rounded ${
                                user.risk_level === 'critical' ? 'bg-red-500/20 text-red-400' :
                                user.risk_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-amber-500/20 text-amber-400'
                              }`}>
                                {user.risk_level}
                              </span>
                              <span className="text-white/50">{user.tier}</span>
                              {user.days_until_expiry !== null && user.days_until_expiry > 0 && (
                                <span className="text-orange-400">{user.days_until_expiry}d left</span>
                              )}
                              <span className="text-white/50">{user.pro_features_used}/{user.total_pro_features} Pro features</span>
                            </div>
                            <div className="text-xs text-white/30 max-w-48 truncate">
                              {user.risk_reason}
                            </div>
                          </div>
                        ))}
                        {insights.churn_risks.users.length === 0 && (
                          <div className="text-center py-8 text-white/50">
                            No churn risks detected
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Feature Health Issues */}
                    {insights.feature_health.features.length > 0 && (
                      <Card variant="elevated" className="p-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                          <Wrench className="w-5 h-5 text-orange-400" />
                          Feature Health Issues
                          <span className="text-sm font-normal text-white/50">
                            Features with low completion rates may have UX problems
                          </span>
                        </h3>
                        <div className="space-y-2">
                          {insights.feature_health.features.map(feature => (
                            <div
                              key={feature.feature_name}
                              className="flex items-center gap-4 p-4 bg-[#0A0B14]/60 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="font-medium">{formatFeatureName(feature.feature_name)}</div>
                                <div className="text-sm text-orange-400">{feature.issue}</div>
                              </div>
                              <div className="flex items-center gap-6 text-sm">
                                <div>
                                  <span className="text-white/50">Opens: </span>
                                  <span className="font-medium">{feature.opens}</span>
                                </div>
                                <div>
                                  <span className="text-white/50">Completions: </span>
                                  <span className="font-medium">{feature.completions}</span>
                                </div>
                                <div>
                                  <span className="text-white/50">Rate: </span>
                                  <span className={`font-medium ${feature.completion_rate < 20 ? 'text-red-400' : 'text-amber-400'}`}>
                                    {feature.completion_rate}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-white/50">Users: </span>
                                  <span className="font-medium">{feature.unique_users}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Refresh Button */}
                    <div className="flex justify-center">
                      <button
                        onClick={fetchInsights}
                        disabled={insightsLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg"
                      >
                        <RefreshCw className={`w-4 h-4 ${insightsLoading ? 'animate-spin' : ''}`} />
                        Refresh Insights
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/50">
                    Failed to load insights. Please try again.
                  </div>
                )}
              </>
            )}

            {/* LABS TAB */}
            {activeTab === 'labs' && (
              <>
                {/* Filters */}
                <div className="flex flex-wrap justify-center items-center gap-3 mb-6">
                  <select
                    value={labTimeRange}
                    onChange={(e) => setLabTimeRange(e.target.value)}
                    className="bg-[#0F1123] border border-white/10 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">All time</option>
                  </select>

                  <select
                    value={labFilter}
                    onChange={(e) => setLabFilter(e.target.value as 'all' | 'swing' | 'pitch')}
                    className="bg-[#0F1123] border border-white/10 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All Labs</option>
                    <option value="swing">Swing Lab Only</option>
                    <option value="pitch">Pitch Lab Only</option>
                  </select>

                  <select
                    value={labSort}
                    onChange={(e) => setLabSort(e.target.value as 'last_activity' | 'total' | 'swing' | 'pitch')}
                    className="bg-[#0F1123] border border-white/10 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="last_activity">Sort by Last Activity</option>
                    <option value="total">Sort by Total Analyses</option>
                    <option value="swing">Sort by Swing Lab</option>
                    <option value="pitch">Sort by Pitch Lab</option>
                  </select>

                  <button
                    onClick={fetchLabActivity}
                    disabled={labLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm disabled:opacity-50"
                  >
                    {labLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Refresh
                  </button>
                </div>

                {labLoading && !labStats ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                  </div>
                ) : (
                  <>
                    {/* Stats Cards */}
                    {labStats && (
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                        <StatCard
                          value={labStats.total_swing_analyses}
                          label="Swing Lab Analyses"
                          icon={Video}
                          color="purple"
                        />
                        <StatCard
                          value={labStats.total_pitch_analyses}
                          label="Pitch Lab Analyses"
                          icon={FlaskConical}
                          color="blue"
                        />
                        <StatCard
                          value={labStats.unique_swing_users}
                          label="Swing Lab Users"
                          icon={Users}
                          color="emerald"
                        />
                        <StatCard
                          value={labStats.unique_pitch_users}
                          label="Pitch Lab Users"
                          icon={Users}
                          color="cyan"
                        />
                        <StatCard
                          value={labStats.analyses_today}
                          label="Today"
                          icon={Clock}
                          color="orange"
                        />
                        <StatCard
                          value={labStats.analyses_this_week}
                          label="This Week"
                          icon={TrendingUp}
                          color="pink"
                        />
                      </div>
                    )}

                    {/* User Table */}
                    <Card variant="elevated" className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Video className="w-5 h-5 text-purple-400" />
                          Lab Users ({labUsers.length})
                        </h3>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={labSearchQuery}
                            onChange={(e) => setLabSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[#0A0B14] border border-white/10 rounded-lg text-sm w-64"
                          />
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">User</th>
                              <th className="text-left py-3 px-4 text-white/50 text-sm font-medium">Email</th>
                              <th className="text-center py-3 px-4 text-white/50 text-sm font-medium">Swing Lab</th>
                              <th className="text-center py-3 px-4 text-white/50 text-sm font-medium">Last Swing</th>
                              <th className="text-center py-3 px-4 text-white/50 text-sm font-medium">Pitch Lab</th>
                              <th className="text-center py-3 px-4 text-white/50 text-sm font-medium">Last Pitch</th>
                              <th className="text-center py-3 px-4 text-white/50 text-sm font-medium">Total</th>
                              <th className="text-center py-3 px-4 text-white/50 text-sm font-medium">Tier</th>
                              <th className="text-center py-3 px-4 text-white/50 text-sm font-medium">App Version</th>
                            </tr>
                          </thead>
                          <tbody>
                            {labUsers
                              .filter(user =>
                                !labSearchQuery ||
                                user.email.toLowerCase().includes(labSearchQuery.toLowerCase()) ||
                                (user.name && user.name.toLowerCase().includes(labSearchQuery.toLowerCase()))
                              )
                              .map(user => (
                              <tr
                                key={user.user_id}
                                className="border-b border-white/5 hover:bg-white/5 transition"
                              >
                                <td className="py-3 px-4 font-medium">{user.name || '-'}</td>
                                <td className="py-3 px-4 text-white/70 text-sm">{user.email}</td>
                                <td className="py-3 px-4 text-center">
                                  {user.swing_lab_count > 0 ? (
                                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm font-medium">
                                      {user.swing_lab_count}
                                    </span>
                                  ) : (
                                    <span className="text-white/30">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center text-sm text-white/50">
                                  {user.last_swing_analysis
                                    ? new Date(user.last_swing_analysis).toLocaleDateString()
                                    : '-'}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {user.pitch_lab_count > 0 ? (
                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm font-medium">
                                      {user.pitch_lab_count}
                                    </span>
                                  ) : (
                                    <span className="text-white/30">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center text-sm text-white/50">
                                  {user.last_pitch_analysis
                                    ? new Date(user.last_pitch_analysis).toLocaleDateString()
                                    : '-'}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm font-bold">
                                    {user.total_analyses}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    user.tier === 'pro' ? 'bg-purple-500/20 text-purple-400' :
                                    user.tier === 'promo' ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-white/10 text-white/50'
                                  }`}>
                                    {user.tier}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center text-sm text-white/40">
                                  {user.app_version || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {labUsers.length === 0 && (
                          <div className="text-center py-8 text-white/50">
                            No lab activity found in this time period
                          </div>
                        )}
                      </div>
                    </Card>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
