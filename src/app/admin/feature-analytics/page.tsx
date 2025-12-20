'use client';

import { useEffect, useState } from 'react';
import AdminGate from '@/components/AdminGate';
import AdminNav from '@/components/AdminNav';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Card } from '@/components/admin/shared/Card';
import { StatCard } from '@/components/admin/shared/StatCard';
import {
  BarChart3, Users, TrendingUp, TrendingDown, AlertTriangle,
  Loader2, Search, X, ChevronDown, ChevronUp, ArrowUpRight,
  ArrowDownRight, Minus, RefreshCw, Activity, Heart, Target,
  Zap, Shield, Clock, Star
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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, selectedCategory]);

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
        <AdminNav />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-2xl font-bold">Feature Analytics</h1>
                <p className="text-white/50 text-sm">Track feature usage and user engagement</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
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
        </main>
      </div>
    </AdminGate>
  );
}
