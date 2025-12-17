'use client';

import { useState, useEffect } from 'react';
import AdminGate from '@/components/AdminGate';
import AdminNav from '@/components/AdminNav';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Clock, RefreshCw, Search, Download, Users, Gift, Tag, Calendar,
  Mail, CheckCircle, XCircle, Facebook, Twitter
} from 'lucide-react';

// Card component matching admin styling
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
  const glowClass = glow ? 'shadow-lg shadow-blue-500/10' : '';

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${glowClass} ${className}`}>
      {children}
    </div>
  );
}

interface ActiveTrial {
  id: string;
  email: string;
  tier: string;
  promo_tier_expires_at: string;
  created_at: string;
  source: string;
  source_detail: string | null;
  days_remaining: number;
}

interface TrialGrant {
  id: string;
  user_email: string;
  user_profile_id: string;
  granted_by_admin: string;
  source: string;
  created_at: string;
  current_tier: string;
  trial_active: boolean;
  expires_at: string | null;
}

interface Redemption {
  id: string;
  promo_code: string;
  redeemer_email: string;
  redeemed_at: string;
  code_description: string;
  code_type: string;
  tier_duration_days: number | null;
  discount_percent: number | null;
  user_current_tier: string;
  user_trial_expires: string | null;
}

interface Stats {
  total_active: number;
  from_promo: number;
  from_fb_outreach: number;
  from_x_outreach: number;
  from_manual: number;
}

type TabView = 'active' | 'grants' | 'redemptions';

export default function AdminTrialsPage() {
  const [activeTab, setActiveTab] = useState<TabView>('active');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data states
  const [activeTrials, setActiveTrials] = useState<ActiveTrial[]>([]);
  const [trialStats, setTrialStats] = useState<Stats | null>(null);
  const [trialGrants, setTrialGrants] = useState<TrialGrant[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [redemptionStats, setRedemptionStats] = useState<{ total: number; trial_codes: number; discount_codes: number } | null>(null);

  const { getPassword } = useAdminAuth();
  const adminPassword = getPassword();

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (view: TabView) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/trials?view=${view}`, {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await res.json();

      if (data.success) {
        if (view === 'active') {
          setActiveTrials(data.trials);
          setTrialStats(data.stats);
        } else if (view === 'grants') {
          setTrialGrants(data.grants);
        } else if (view === 'redemptions') {
          setRedemptions(data.redemptions);
          setRedemptionStats(data.stats);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch data' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    let csvContent = '';
    let filename = '';

    if (activeTab === 'active') {
      csvContent = 'Email,Source,Source Detail,Days Remaining,Expires At\n';
      activeTrials.forEach((trial) => {
        csvContent += `${trial.email},${trial.source},${trial.source_detail || ''},${trial.days_remaining},${trial.promo_tier_expires_at}\n`;
      });
      filename = 'active-trials.csv';
    } else if (activeTab === 'grants') {
      csvContent = 'Email,Source,Granted At,Trial Active,Expires At\n';
      trialGrants.forEach((grant) => {
        csvContent += `${grant.user_email},${grant.source || grant.granted_by_admin},${grant.created_at},${grant.trial_active},${grant.expires_at || ''}\n`;
      });
      filename = 'trial-grants.csv';
    } else if (activeTab === 'redemptions') {
      csvContent = 'Email,Code,Type,Redeemed At,Trial Expires\n';
      redemptions.forEach((r) => {
        csvContent += `${r.redeemer_email},${r.promo_code},${r.code_type},${r.redeemed_at},${r.user_trial_expires || ''}\n`;
      });
      filename = 'promo-redemptions.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSourceIcon = (source: string) => {
    const lower = source.toLowerCase();
    if (lower.includes('fb') || lower.includes('facebook')) {
      return <Facebook className="w-4 h-4 text-blue-400" />;
    }
    if (lower.includes('x') || lower.includes('twitter')) {
      return <Twitter className="w-4 h-4 text-sky-400" />;
    }
    if (source === 'Promo Code') {
      return <Tag className="w-4 h-4 text-purple-400" />;
    }
    return <Gift className="w-4 h-4 text-green-400" />;
  };

  // Filter data based on search
  const filteredActiveTrials = activeTrials.filter(
    (t) =>
      t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.source_detail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGrants = trialGrants.filter(
    (g) =>
      g.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.granted_by_admin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRedemptions = redemptions.filter(
    (r) =>
      r.redeemer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.promo_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminGate>
      <div className="min-h-screen bg-[#0A0B14] pt-28">
        <AdminNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Clock className="w-7 h-7 text-blue-400" />
                Trial Management
              </h1>
              <p className="text-white/60 mt-1">
                View active trials, grants, and promo redemptions
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => fetchData(activeTab)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {message.text}
              <button
                onClick={() => setMessage(null)}
                className="float-right text-white/60 hover:text-white"
              >
                &times;
              </button>
            </div>
          )}

          {/* Stats (only for active tab) */}
          {activeTab === 'active' && trialStats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
              <Card className="p-4">
                <div className="text-2xl font-bold text-white">{trialStats.total_active}</div>
                <div className="text-sm text-white/60">Active Trials</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-purple-400">{trialStats.from_promo}</div>
                <div className="text-sm text-white/60">From Promo</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-blue-400">{trialStats.from_fb_outreach}</div>
                <div className="text-sm text-white/60">FB Outreach</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-sky-400">{trialStats.from_x_outreach}</div>
                <div className="text-sm text-white/60">X Outreach</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-green-400">{trialStats.from_manual}</div>
                <div className="text-sm text-white/60">Manual/Other</div>
              </Card>
            </div>
          )}

          {/* Stats for redemptions */}
          {activeTab === 'redemptions' && redemptionStats && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="p-4">
                <div className="text-2xl font-bold text-white">{redemptionStats.total}</div>
                <div className="text-sm text-white/60">Total Redemptions</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-purple-400">{redemptionStats.trial_codes}</div>
                <div className="text-sm text-white/60">Trial Codes</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-cyan-400">{redemptionStats.discount_codes}</div>
                <div className="text-sm text-white/60">Discount Codes</div>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Card className="p-2 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'active'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                Active Trials
              </button>
              <button
                onClick={() => setActiveTab('grants')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'grants'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Gift className="w-4 h-4" />
                Trial Grants
              </button>
              <button
                onClick={() => setActiveTab('redemptions')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'redemptions'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Tag className="w-4 h-4" />
                Promo Redemptions
              </button>
            </div>
          </Card>

          {/* Search */}
          <Card className="p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search by email, source, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
              />
            </div>
          </Card>

          {/* Content */}
          <Card variant="elevated" className="overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-white/60">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                Loading...
              </div>
            ) : (
              <>
                {/* Active Trials Tab */}
                {activeTab === 'active' && (
                  <>
                    <div className="p-4 border-b border-white/10">
                      <h2 className="text-lg font-semibold text-white">
                        Active Trials ({filteredActiveTrials.length})
                      </h2>
                    </div>
                    {filteredActiveTrials.length === 0 ? (
                      <div className="p-8 text-center text-white/60">
                        No active trials found
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-white/5">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Source</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-white/60 uppercase">Days Left</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Expires</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredActiveTrials.map((trial) => (
                              <tr key={trial.id} className="hover:bg-white/5">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-white/40" />
                                    <span className="text-white">{trial.email}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {getSourceIcon(trial.source)}
                                    <span className="text-white/80">{trial.source}</span>
                                    {trial.source_detail && (
                                      <span className="text-xs text-white/40">({trial.source_detail})</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                    trial.days_remaining <= 3
                                      ? 'bg-red-500/20 text-red-400'
                                      : trial.days_remaining <= 7
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'bg-green-500/20 text-green-400'
                                  }`}>
                                    {trial.days_remaining} days
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2 text-white/60">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(trial.promo_tier_expires_at).toLocaleDateString()}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                {/* Trial Grants Tab */}
                {activeTab === 'grants' && (
                  <>
                    <div className="p-4 border-b border-white/10">
                      <h2 className="text-lg font-semibold text-white">
                        Trial Grants History ({filteredGrants.length})
                      </h2>
                    </div>
                    {filteredGrants.length === 0 ? (
                      <div className="p-8 text-center text-white/60">
                        No trial grants found
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-white/5">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Source</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Granted</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-white/60 uppercase">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Expires</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredGrants.map((grant) => (
                              <tr key={grant.id} className="hover:bg-white/5">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-white/40" />
                                    <span className="text-white">{grant.user_email}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {getSourceIcon(grant.source || grant.granted_by_admin)}
                                    <span className="text-white/80">{grant.source || grant.granted_by_admin}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2 text-white/60">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(grant.created_at).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {grant.trial_active ? (
                                    <span className="inline-flex items-center gap-1 text-green-400">
                                      <CheckCircle className="w-4 h-4" />
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-white/40">
                                      <XCircle className="w-4 h-4" />
                                      Expired
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-white/60">
                                  {grant.expires_at
                                    ? new Date(grant.expires_at).toLocaleDateString()
                                    : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                {/* Redemptions Tab */}
                {activeTab === 'redemptions' && (
                  <>
                    <div className="p-4 border-b border-white/10">
                      <h2 className="text-lg font-semibold text-white">
                        Promo Code Redemptions ({filteredRedemptions.length})
                      </h2>
                    </div>
                    {filteredRedemptions.length === 0 ? (
                      <div className="p-8 text-center text-white/60">
                        No redemptions found
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-white/5">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Code</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Type</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Redeemed</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Trial Expires</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredRedemptions.map((r) => (
                              <tr key={r.id} className="hover:bg-white/5">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-white/40" />
                                    <span className="text-white">{r.redeemer_email}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-mono text-blue-400">{r.promo_code}</span>
                                </td>
                                <td className="px-4 py-3">
                                  {r.code_type === 'trial' ? (
                                    <span className="inline-flex items-center gap-1 text-purple-400">
                                      <Gift className="w-4 h-4" />
                                      {r.tier_duration_days}-Day Trial
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-cyan-400">
                                      <Tag className="w-4 h-4" />
                                      {r.discount_percent}% Off
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2 text-white/60">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(r.redeemed_at).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-white/60">
                                  {r.user_trial_expires
                                    ? new Date(r.user_trial_expires).toLocaleDateString()
                                    : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </AdminGate>
  );
}
