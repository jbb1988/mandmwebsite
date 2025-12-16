'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminGate from '@/components/AdminGate';
import {
  Twitter, BarChart3, Plus, Search, Users, MessageCircle,
  Handshake, TrendingUp, ExternalLink, Pencil, Trash2, X, Check,
  ChevronDown, Send, AlertCircle, Clock
} from 'lucide-react';

// Card component
function Card({ children, className = '', variant = 'default', glow = false }: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
  glow?: boolean;
}) {
  const baseClasses = 'rounded-2xl transition-all duration-200';
  const variantClasses = {
    default: 'bg-[#0F1123]/80 border border-white/[0.08]',
    elevated: 'bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] shadow-xl',
    bordered: 'bg-[#0A0B14]/60 border-2 border-white/[0.1]',
  };
  const glowClass = glow ? 'shadow-lg shadow-cyan-500/10' : '';

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${glowClass} ${className}`}>
      {children}
    </div>
  );
}

// Stat card
function StatCard({ value, label, icon: Icon, color = 'white' }: {
  value: number | string;
  label: string;
  icon?: typeof Twitter;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    white: 'text-white',
    cyan: 'text-cyan-400',
    green: 'text-emerald-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    blue: 'text-blue-400',
  };

  return (
    <Card variant="elevated" className="p-4">
      <div className="text-center">
        {Icon && <Icon className={`w-5 h-5 ${colorClasses[color]} mx-auto mb-2`} />}
        <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
        <p className="text-xs text-white/50 mt-1">{label}</p>
      </div>
    </Card>
  );
}

// Tab button
function TabButton({ active, onClick, icon: Icon, label, color = 'cyan', badge }: {
  active: boolean;
  onClick: () => void;
  icon: typeof Twitter;
  label: string;
  color?: string;
  badge?: number;
}) {
  const colorMap: Record<string, string> = {
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
    green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
        active
          ? colorMap[color]
          : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-white/20' : 'bg-white/10'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

interface XTarget {
  id: string;
  handle: string;
  display_name: string | null;
  follower_count: number | null;
  category: string | null;
  bio: string | null;
  outreach_status: string;
  dm_sent_at: string | null;
  response_status: string;
  response_at: string | null;
  deal_status: string | null;
  partnership_type: string | null;
  engagement_notes: string | null;
  priority_score: number | null;
  notes: string | null;
}

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  byResponse: Record<string, number>;
  byCategory: Record<string, number>;
  dmsSent: number;
  responses: number;
  partnerships: number;
  totalFollowers: number;
  responseRate: number;
}

const OUTREACH_STATUSES = [
  { value: 'not_started', label: 'Not Started', color: 'gray' },
  { value: 'dm_sent', label: 'DM Sent', color: 'blue' },
  { value: 'engaged', label: 'Engaged', color: 'cyan' },
  { value: 'negotiating', label: 'Negotiating', color: 'orange' },
  { value: 'partner', label: 'Partner', color: 'green' },
  { value: 'declined', label: 'Declined', color: 'red' },
  { value: 'inactive', label: 'Inactive', color: 'gray' },
];

const RESPONSE_STATUSES = [
  { value: 'no_response', label: 'No Response' },
  { value: 'pending', label: 'Pending' },
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'needs_follow_up', label: 'Needs Follow-Up' },
];

const CATEGORIES = [
  { value: 'influencer', label: 'Influencer' },
  { value: 'coach', label: 'Coach' },
  { value: 'player', label: 'Player' },
  { value: 'organization', label: 'Organization' },
  { value: 'media', label: 'Media' },
  { value: 'brand', label: 'Brand' },
];

const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

export default function XOutreachPage() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'add'>('pipeline');
  const [targets, setTargets] = useState<XTarget[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    byStatus: {},
    byResponse: {},
    byCategory: {},
    dmsSent: 0,
    responses: 0,
    partnerships: 0,
    totalFollowers: 0,
    responseRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTarget, setEditingTarget] = useState<XTarget | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state for adding new target
  const [newTarget, setNewTarget] = useState({
    handle: '',
    display_name: '',
    follower_count: '',
    category: 'influencer',
    bio: '',
    notes: '',
  });

  const fetchTargets = useCallback(async () => {

    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/admin/x-outreach/targets?${params}`, {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await res.json();
      if (data.success) {
        setTargets(data.targets || []);
      }
    } catch (error) {
      console.error('Failed to fetch targets:', error);
    }
  }, [statusFilter, categoryFilter, searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/x-outreach/stats', {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchTargets(), fetchStats()]).finally(() => setLoading(false));
  }, [fetchTargets, fetchStats]);

  async function handleAddTarget(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch('/api/admin/x-outreach/targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          ...newTarget,
          follower_count: newTarget.follower_count ? parseInt(newTarget.follower_count) : null,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Target added successfully!' });
        setNewTarget({
          handle: '',
          display_name: '',
          follower_count: '',
          category: 'influencer',
          bio: '',
          notes: '',
        });
        fetchTargets();
        fetchStats();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add target' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add target' });
    }

    setTimeout(() => setMessage(null), 3000);
  }

  async function handleUpdateTarget(targetId: string, updates: Partial<XTarget>) {
    try {
      const res = await fetch('/api/admin/x-outreach/targets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({ id: targetId, ...updates }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Updated!' });
        fetchTargets();
        fetchStats();
        setEditingTarget(null);
      } else {
        setMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Update failed' });
    }

    setTimeout(() => setMessage(null), 2000);
  }

  async function handleDeleteTarget(targetId: string) {
    if (!confirm('Delete this target?')) return;

    try {
      const res = await fetch(`/api/admin/x-outreach/targets?id=${targetId}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Deleted!' });
        fetchTargets();
        fetchStats();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Delete failed' });
    }

    setTimeout(() => setMessage(null), 2000);
  }

  function formatFollowers(count: number | null): string {
    if (!count) return '-';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  }

  function getStatusColor(status: string): string {
    const statusObj = OUTREACH_STATUSES.find(s => s.value === status);
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colorMap[statusObj?.color || 'gray'];
  }

  return (
    <AdminGate
      title="Admin: X/Twitter Outreach"
      description="Enter admin password to access dashboard"
    >
      <div className="min-h-screen bg-[#0A0B14] text-white">
        {/* Subtle gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5 pointer-events-none" />

        <div className="relative z-10 pt-28 pb-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                X/Twitter Outreach Pipeline
              </h1>
              <p className="text-white/50 text-sm sm:text-base">
                Track influencer DMs and partnerships
              </p>
            </div>

            {/* Message Toast */}
            {message && (
              <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-10">
              <StatCard value={stats.total} label="Total Targets" icon={Users} color="white" />
              <StatCard value={stats.byStatus?.not_started || 0} label="Not Started" color="white" />
              <StatCard value={stats.dmsSent} label="DMs Sent" icon={Send} color="cyan" />
              <StatCard value={stats.responses} label="Responses" icon={MessageCircle} color="blue" />
              <StatCard value={`${stats.responseRate}%`} label="Response Rate" icon={TrendingUp} color="orange" />
              <StatCard value={stats.partnerships} label="Partners" icon={Handshake} color="green" />
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center gap-3 mb-8">
              <TabButton
                active={activeTab === 'pipeline'}
                onClick={() => setActiveTab('pipeline')}
                icon={BarChart3}
                label="Pipeline"
                color="cyan"
              />
              <TabButton
                active={activeTab === 'add'}
                onClick={() => setActiveTab('add')}
                icon={Plus}
                label="Add Target"
                color="green"
              />
            </div>

            {/* Pipeline Tab */}
            {activeTab === 'pipeline' && (
              <Card variant="elevated" className="p-6">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      placeholder="Search by handle or name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="all">All Statuses</option>
                    {OUTREACH_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Targets List */}
                {loading ? (
                  <div className="text-center py-12 text-white/50">Loading...</div>
                ) : targets.length === 0 ? (
                  <div className="text-center py-12 text-white/50">No targets found</div>
                ) : (
                  <div className="space-y-3">
                    {targets.map((target) => (
                      <div
                        key={target.id}
                        className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.05] hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <a
                                href={`https://x.com/${target.handle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 font-semibold hover:underline flex items-center gap-1"
                              >
                                @{target.handle}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              {target.display_name && (
                                <span className="text-white/60">{target.display_name}</span>
                              )}
                              <span className="text-white/40 text-sm">
                                {formatFollowers(target.follower_count)} followers
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className={`px-2 py-1 rounded-lg text-xs border ${getStatusColor(target.outreach_status)}`}>
                                {OUTREACH_STATUSES.find(s => s.value === target.outreach_status)?.label || target.outreach_status}
                              </span>
                              {target.category && (
                                <span className="px-2 py-1 rounded-lg text-xs bg-white/5 text-white/60 border border-white/10">
                                  {target.category}
                                </span>
                              )}
                              {target.dm_sent_at && (
                                <span className="px-2 py-1 rounded-lg text-xs bg-white/5 text-white/40 border border-white/10 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  DM: {new Date(target.dm_sent_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {target.notes && (
                              <p className="text-sm text-white/40 mt-2">{target.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={target.outreach_status}
                              onChange={(e) => handleUpdateTarget(target.id, { outreach_status: e.target.value })}
                              className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none"
                            >
                              {OUTREACH_STATUSES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => setEditingTarget(target)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-white/50" />
                            </button>
                            <button
                              onClick={() => handleDeleteTarget(target.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400/50" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Add Target Tab */}
            {activeTab === 'add' && (
              <Card variant="elevated" className="p-6 max-w-xl mx-auto">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  Add New Target
                </h2>
                <form onSubmit={handleAddTarget} className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">X Handle *</label>
                    <input
                      type="text"
                      required
                      placeholder="@username"
                      value={newTarget.handle}
                      onChange={(e) => setNewTarget({ ...newTarget, handle: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Display Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={newTarget.display_name}
                      onChange={(e) => setNewTarget({ ...newTarget, display_name: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Followers</label>
                      <input
                        type="number"
                        placeholder="10000"
                        value={newTarget.follower_count}
                        onChange={(e) => setNewTarget({ ...newTarget, follower_count: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Category</label>
                      <select
                        value={newTarget.category}
                        onChange={(e) => setNewTarget({ ...newTarget, category: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Bio</label>
                    <textarea
                      placeholder="Brief description..."
                      value={newTarget.bio}
                      onChange={(e) => setNewTarget({ ...newTarget, bio: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Notes</label>
                    <textarea
                      placeholder="Internal notes..."
                      value={newTarget.notes}
                      onChange={(e) => setNewTarget({ ...newTarget, notes: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Add Target
                  </button>
                </form>
              </Card>
            )}

            {/* Edit Modal */}
            {editingTarget && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <Card variant="elevated" className="w-full max-w-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">Edit Target</h2>
                    <button onClick={() => setEditingTarget(null)} className="p-2 hover:bg-white/10 rounded-lg">
                      <X className="w-5 h-5 text-white/50" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Response Status</label>
                      <select
                        value={editingTarget.response_status}
                        onChange={(e) => setEditingTarget({ ...editingTarget, response_status: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                      >
                        {RESPONSE_STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Deal Status</label>
                      <select
                        value={editingTarget.deal_status || ''}
                        onChange={(e) => setEditingTarget({ ...editingTarget, deal_status: e.target.value || null })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                      >
                        <option value="">None</option>
                        <option value="discussing">Discussing</option>
                        <option value="negotiating">Negotiating</option>
                        <option value="agreed">Agreed</option>
                        <option value="active">Active Partner</option>
                        <option value="paused">Paused</option>
                        <option value="ended">Ended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Engagement Notes</label>
                      <textarea
                        value={editingTarget.engagement_notes || ''}
                        onChange={(e) => setEditingTarget({ ...editingTarget, engagement_notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none resize-none"
                      />
                    </div>
                    <button
                      onClick={() => handleUpdateTarget(editingTarget.id, {
                        response_status: editingTarget.response_status,
                        deal_status: editingTarget.deal_status,
                        engagement_notes: editingTarget.engagement_notes,
                      })}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Save Changes
                    </button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
