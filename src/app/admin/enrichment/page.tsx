'use client';

import { useEffect, useState } from 'react';
import AdminGate from '@/components/AdminGate';
import {
  Mail, Building2, Search, Play, CheckCircle2, XCircle, Clock,
  AlertCircle, RefreshCw, Users, Globe, Plus, ChevronDown, ChevronUp,
  Database, Zap, Eye, BarChart3
} from 'lucide-react';

const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

// Card component matching existing admin style
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

// Stat card for quick metrics
function StatCard({ value, label, icon: Icon, color = 'white' }: {
  value: number | string;
  label: string;
  icon?: typeof Mail;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    white: 'text-white',
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
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

// Segment badge component
function SegmentBadge({ segment }: { segment: string }) {
  const segmentStyles: Record<string, string> = {
    dbat_facility: 'bg-orange-500/20 text-orange-400',
    facility: 'bg-emerald-500/20 text-emerald-400',
    frozen_ropes_facility: 'bg-blue-500/20 text-blue-400',
    influencer: 'bg-pink-500/20 text-pink-400',
    little_league: 'bg-yellow-500/20 text-yellow-400',
    travel_org: 'bg-purple-500/20 text-purple-400',
    national_org: 'bg-cyan-500/20 text-cyan-400',
  };

  const displayNames: Record<string, string> = {
    dbat_facility: 'D-BAT',
    facility: 'Facility',
    frozen_ropes_facility: 'Frozen Ropes',
    influencer: 'Influencer',
    little_league: 'Little League',
    travel_org: 'Travel Org',
    national_org: 'National Org',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${segmentStyles[segment] || 'bg-white/10 text-white/60'}`}>
      {displayNames[segment] || segment}
    </span>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, { bg: string; icon: typeof CheckCircle2 }> = {
    pending: { bg: 'bg-gray-500/20 text-gray-400', icon: Clock },
    processing: { bg: 'bg-blue-500/20 text-blue-400', icon: RefreshCw },
    completed: { bg: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle2 },
    failed: { bg: 'bg-red-500/20 text-red-400', icon: XCircle },
    skipped: { bg: 'bg-yellow-500/20 text-yellow-400', icon: AlertCircle },
  };

  const style = statusStyles[status] || statusStyles.pending;
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg ${style.bg}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

interface SegmentStat {
  segment: string;
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  skipped: number;
  has_website: number;
  emails_found: number;
  contacts: number;
  coverage: number;
}

interface RecentActivity {
  id: string;
  name: string;
  segment: string;
  enrichment_status: string;
  enriched_at: string;
  emails_found: string[] | null;
  enrichment_error: string | null;
}

interface ReadyOrg {
  id: string;
  name: string;
  segment: string;
  website: string;
}

export default function EnrichmentPage() {
  const [stats, setStats] = useState<SegmentStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [readyToEnrich, setReadyToEnrich] = useState<ReadyOrg[]>([]);
  const [summary, setSummary] = useState({
    totalOrgs: 0,
    totalContacts: 0,
    pendingEnrichment: 0,
    completedEnrichment: 0,
    failedEnrichment: 0,
  });
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapeResults, setScrapeResults] = useState<any>(null);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set());
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualAddOrg, setManualAddOrg] = useState<ReadyOrg | null>(null);
  const [manualEmail, setManualEmail] = useState('');
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/enrichment', {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await response.json();

      if (data.success) {
        setStats(data.stats || []);
        setRecentActivity(data.recentActivity || []);
        setReadyToEnrich(data.readyToEnrich || []);
        setSummary(data.summary || {
          totalOrgs: 0,
          totalContacts: 0,
          pendingEnrichment: 0,
          completedEnrichment: 0,
          failedEnrichment: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching enrichment data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScrape = async (segment?: string, orgIds?: string[]) => {
    setScraping(true);
    setScrapeResults(null);

    try {
      const response = await fetch('/api/admin/enrichment/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          segment: segment !== 'all' ? segment : undefined,
          organization_ids: orgIds,
          limit: 10,
          create_contacts: true,
        }),
      });

      const data = await response.json();
      setScrapeResults(data);

      // Refresh data after scraping
      await fetchData();
    } catch (error) {
      console.error('Error scraping:', error);
      setScrapeResults({ success: false, message: 'Scrape failed' });
    } finally {
      setScraping(false);
    }
  };

  const handleManualAdd = async () => {
    if (!manualAddOrg || !manualEmail) return;

    try {
      const response = await fetch('/api/admin/enrichment/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({
          organization_id: manualAddOrg.id,
          email: manualEmail,
          create_contact: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowManualAdd(false);
        setManualAddOrg(null);
        setManualEmail('');
        await fetchData();
      }
    } catch (error) {
      console.error('Error adding manual email:', error);
    }
  };

  const toggleOrgSelection = (orgId: string) => {
    const newSelected = new Set(selectedOrgs);
    if (newSelected.has(orgId)) {
      newSelected.delete(orgId);
    } else {
      newSelected.add(orgId);
    }
    setSelectedOrgs(newSelected);
  };

  const filteredReadyOrgs = selectedSegment === 'all'
    ? readyToEnrich
    : readyToEnrich.filter(org => org.segment === selectedSegment);

  return (
    <AdminGate>
      <div className="min-h-screen bg-[#0A0B14] text-white p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-400" />
                Lead Enrichment
              </h1>
              <p className="text-white/50 mt-1">
                Find emails from organization websites to grow your contact database
              </p>
            </div>
            <button
              onClick={() => fetchData()}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              value={summary.totalOrgs}
              label="Total Organizations"
              icon={Building2}
              color="white"
            />
            <StatCard
              value={summary.totalContacts}
              label="Total Contacts"
              icon={Users}
              color="blue"
            />
            <StatCard
              value={summary.pendingEnrichment}
              label="Pending Enrichment"
              icon={Clock}
              color="orange"
            />
            <StatCard
              value={summary.completedEnrichment}
              label="Enriched"
              icon={CheckCircle2}
              color="green"
            />
            <StatCard
              value={summary.failedEnrichment}
              label="Failed"
              icon={XCircle}
              color="purple"
            />
          </div>

          {/* Segment Stats */}
          <Card variant="elevated" className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Enrichment by Segment
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-white/50 text-sm border-b border-white/10">
                    <th className="pb-3">Segment</th>
                    <th className="pb-3 text-center">Orgs</th>
                    <th className="pb-3 text-center">Has Website</th>
                    <th className="pb-3 text-center">Pending</th>
                    <th className="pb-3 text-center">Completed</th>
                    <th className="pb-3 text-center">Emails Found</th>
                    <th className="pb-3 text-center">Contacts</th>
                    <th className="pb-3 text-center">Coverage</th>
                    <th className="pb-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((stat) => (
                    <tr key={stat.segment} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3">
                        <SegmentBadge segment={stat.segment} />
                      </td>
                      <td className="py-3 text-center">{stat.total}</td>
                      <td className="py-3 text-center text-blue-400">{stat.has_website}</td>
                      <td className="py-3 text-center text-orange-400">{stat.pending}</td>
                      <td className="py-3 text-center text-emerald-400">{stat.completed}</td>
                      <td className="py-3 text-center text-cyan-400">{stat.emails_found}</td>
                      <td className="py-3 text-center text-purple-400">{stat.contacts}</td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                              style={{ width: `${stat.coverage}%` }}
                            />
                          </div>
                          <span className="text-sm">{stat.coverage}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleScrape(stat.segment)}
                          disabled={scraping || stat.pending === 0}
                          className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 mx-auto"
                        >
                          <Zap className="w-3 h-3" />
                          Scrape 10
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Scrape Results */}
          {scrapeResults && (
            <Card variant="bordered" className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                {scrapeResults.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                Scrape Results
              </h2>
              {scrapeResults.summary && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold">{scrapeResults.summary.total}</p>
                    <p className="text-xs text-white/50">Processed</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-400">{scrapeResults.summary.successful}</p>
                    <p className="text-xs text-white/50">Successful</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-blue-400">{scrapeResults.summary.emails_found}</p>
                    <p className="text-xs text-white/50">Emails Found</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-purple-400">{scrapeResults.summary.contacts_created}</p>
                    <p className="text-xs text-white/50">Contacts Created</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-red-400">{scrapeResults.summary.failed}</p>
                    <p className="text-xs text-white/50">Failed</p>
                  </div>
                </div>
              )}
              {scrapeResults.results && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {scrapeResults.results.map((result: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${result.success ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.name || result.id}</span>
                        <StatusBadge status={result.success ? 'completed' : 'failed'} />
                      </div>
                      {result.emails_found && result.emails_found.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {result.emails_found.map((email: string, i: number) => (
                            <span
                              key={i}
                              className={`px-2 py-1 text-xs rounded ${email === result.best_email ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/10 text-white/70'}`}
                            >
                              {email} {email === result.best_email && '(selected)'}
                            </span>
                          ))}
                        </div>
                      )}
                      {result.error && (
                        <p className="text-xs text-red-400 mt-1">{result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Ready to Enrich */}
          <Card variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Organizations Ready to Enrich
              </h2>
              <div className="flex items-center gap-3">
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Segments</option>
                  {stats.map((stat) => (
                    <option key={stat.segment} value={stat.segment}>
                      {stat.segment} ({stat.pending})
                    </option>
                  ))}
                </select>
                {selectedOrgs.size > 0 && (
                  <button
                    onClick={() => handleScrape(undefined, Array.from(selectedOrgs))}
                    disabled={scraping}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {scraping ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    Scrape Selected ({selectedOrgs.size})
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredReadyOrgs.slice(0, 50).map((org) => (
                <div
                  key={org.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedOrgs.has(org.id)
                      ? 'bg-blue-500/20 border-blue-500/50'
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                  onClick={() => toggleOrgSelection(org.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedOrgs.has(org.id)}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-white/30 bg-white/10"
                      />
                      <div>
                        <p className="font-medium">{org.name}</p>
                        <a
                          href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" />
                          {org.website}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SegmentBadge segment={org.segment} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setManualAddOrg(org);
                          setShowManualAdd(true);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Add email manually"
                      >
                        <Plus className="w-4 h-4 text-white/50" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredReadyOrgs.length === 0 && (
                <p className="text-center text-white/50 py-8">
                  No organizations pending enrichment in this segment
                </p>
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card variant="elevated" className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              Recent Enrichment Activity
            </h2>
            <div className="space-y-2">
              {recentActivity.slice(0, 10).map((activity) => (
                <div key={activity.id} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <SegmentBadge segment={activity.segment} />
                      <span className="font-medium">{activity.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={activity.enrichment_status} />
                      <span className="text-xs text-white/50">
                        {new Date(activity.enriched_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {activity.emails_found && activity.emails_found.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activity.emails_found.map((email, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-300 rounded">
                          {email}
                        </span>
                      ))}
                    </div>
                  )}
                  {activity.enrichment_error && (
                    <p className="text-xs text-red-400 mt-2">{activity.enrichment_error}</p>
                  )}
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-center text-white/50 py-8">
                  No enrichment activity yet. Start by scraping some organizations!
                </p>
              )}
            </div>
          </Card>

          {/* Manual Add Modal */}
          {showManualAdd && manualAddOrg && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card variant="elevated" className="p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Add Email Manually</h3>
                <p className="text-white/50 mb-4">{manualAddOrg.name}</p>
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowManualAdd(false);
                      setManualAddOrg(null);
                      setManualEmail('');
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleManualAdd}
                    disabled={!manualEmail}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg disabled:opacity-50"
                  >
                    Add Email
                  </button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminGate>
  );
}
