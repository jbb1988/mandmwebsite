'use client';

import { useEffect, useState } from 'react';
import AdminGate from '@/components/AdminGate';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Database, Zap, CheckCircle2, XCircle, Clock, RefreshCw,
  Users, Mail, Building2, AlertCircle
} from 'lucide-react';

interface SegmentStat {
  segment: string;
  total: number;
  pending: number;
  completed: number;
  failed: number;
  contacts: number;
  coverage: number;
}

interface DiscoveryResult {
  email: string | null;
  source: 'website' | 'google' | 'pattern' | 'whois' | null;
  confidence: 'high' | 'verified' | 'medium' | 'low' | null;
  all_emails_found: string[];
  attempts: string[];
}

interface ScrapeResult {
  id: string;
  name: string;
  success: boolean;
  result: DiscoveryResult;
  contact_created?: boolean;
  error?: string;
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  website: { label: 'Website', color: 'bg-emerald-500/20 text-emerald-300' },
  google: { label: 'Google', color: 'bg-blue-500/20 text-blue-300' },
  pattern: { label: 'Pattern', color: 'bg-purple-500/20 text-purple-300' },
  whois: { label: 'WHOIS', color: 'bg-orange-500/20 text-orange-300' },
};

const CONFIDENCE_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  high: { label: 'High Quality', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  verified: { label: 'Verified', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  medium: { label: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  low: { label: 'Low Quality', color: 'text-red-400', bgColor: 'bg-red-500/10' },
};

const SEGMENT_NAMES: Record<string, string> = {
  dbat_facility: 'D-BAT Facilities',
  facility: 'Batting Cages',
  frozen_ropes_facility: 'Frozen Ropes',
  influencer: 'Influencers',
  little_league: 'Little Leagues',
  travel_org: 'Travel Orgs',
  national_org: 'National Orgs',
};

const SEGMENT_COLORS: Record<string, string> = {
  dbat_facility: 'from-orange-500 to-red-500',
  facility: 'from-emerald-500 to-teal-500',
  frozen_ropes_facility: 'from-blue-500 to-indigo-500',
  influencer: 'from-pink-500 to-rose-500',
  little_league: 'from-yellow-500 to-amber-500',
  travel_org: 'from-purple-500 to-violet-500',
  national_org: 'from-cyan-500 to-sky-500',
};

export default function EnrichmentPage() {
  const { getPassword } = useAdminAuth();
  const [stats, setStats] = useState<SegmentStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState<string | null>(null);
  const [results, setResults] = useState<{ segment: string; data: any } | null>(null);
  const [manualMode, setManualMode] = useState<{ segment: string; orgId: string; orgName: string } | null>(null);
  const [manualEmail, setManualEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/enrichment', {
        headers: { 'X-Admin-Password': getPassword() },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const scrapeSegment = async (segment: string, count: number = 25) => {
    setScraping(segment);
    setResults(null);

    try {
      const response = await fetch('/api/admin/enrichment/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword(),
        },
        body: JSON.stringify({
          segment,
          limit: count,
          create_contacts: true,
        }),
      });

      const data = await response.json();
      setResults({ segment, data });
      await fetchStats();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setScraping(null);
    }
  };

  const saveManualEmail = async () => {
    if (!manualMode || !manualEmail) return;
    setSaving(true);

    try {
      await fetch('/api/admin/enrichment/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword(),
        },
        body: JSON.stringify({
          organization_id: manualMode.orgId,
          email: manualEmail,
          create_contact: true,
        }),
      });

      setManualMode(null);
      setManualEmail('');
      await fetchStats();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const totalOrgs = stats.reduce((sum, s) => sum + s.total, 0);
  const totalContacts = stats.reduce((sum, s) => sum + s.contacts, 0);
  const totalPending = stats.reduce((sum, s) => sum + s.pending, 0);
  const overallCoverage = totalOrgs > 0 ? Math.round((totalContacts / totalOrgs) * 100) : 0;

  if (loading) {
    return (
      <AdminGate>
        <div className="min-h-screen bg-[#0A0B14] text-white flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </AdminGate>
    );
  }

  return (
    <AdminGate>
      <div className="min-h-screen bg-[#0A0B14] text-white p-6">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Lead Enrichment</h1>
            <p className="text-white/50">Find contact emails from organization websites</p>
          </div>

          {/* Big Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-white/50" />
              <p className="text-3xl font-bold">{totalOrgs.toLocaleString()}</p>
              <p className="text-sm text-white/50">Organizations</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              <p className="text-3xl font-bold text-emerald-400">{totalContacts.toLocaleString()}</p>
              <p className="text-sm text-white/50">Contacts</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <p className="text-3xl font-bold text-orange-400">{totalPending.toLocaleString()}</p>
              <p className="text-sm text-white/50">Need Enrichment</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <Mail className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <p className="text-3xl font-bold text-blue-400">{overallCoverage}%</p>
              <p className="text-sm text-white/50">Coverage</p>
            </div>
          </div>

          {/* Segment Cards */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Segments</h2>

            {stats.map((stat) => {
              const isActive = scraping === stat.segment;
              const hasResults = results?.segment === stat.segment;
              const gradient = SEGMENT_COLORS[stat.segment] || 'from-gray-500 to-gray-600';

              return (
                <div
                  key={stat.segment}
                  className="bg-[#0F1123] border border-white/10 rounded-2xl overflow-hidden"
                >
                  {/* Segment Header */}
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <Database className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{SEGMENT_NAMES[stat.segment] || stat.segment}</h3>
                        <div className="flex items-center gap-4 text-sm text-white/50">
                          <span>{stat.total} orgs</span>
                          <span className="text-emerald-400">{stat.contacts} contacts</span>
                          <span className="text-orange-400">{stat.pending} pending</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Coverage Bar */}
                      <div className="w-32 text-right">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <span className="text-sm font-bold">{stat.coverage}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${gradient}`}
                            style={{ width: `${stat.coverage}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => scrapeSegment(stat.segment)}
                        disabled={isActive || stat.pending === 0}
                        className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                          stat.pending === 0
                            ? 'bg-white/5 text-white/30 cursor-not-allowed'
                            : isActive
                            ? 'bg-blue-500 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Scraping...
                          </>
                        ) : stat.pending === 0 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Done
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            Scrape 25
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Results Panel */}
                  {hasResults && results.data && (
                    <div className="border-t border-white/10 bg-white/[0.02] p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">
                          <span className="text-sm text-white/50">Processed:</span>
                          <span className="font-bold">{results.data.summary?.total || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-lg">
                          <Mail className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-emerald-400">{results.data.summary?.emails_found || 0} emails found</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-lg">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span className="font-bold text-purple-400">{results.data.summary?.contacts_created || 0} contacts created</span>
                        </div>
                      </div>

                      {/* Result List */}
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {results.data.results?.map((r: ScrapeResult, i: number) => {
                          const sourceInfo = r.result?.source ? SOURCE_LABELS[r.result.source] : null;
                          const confidenceInfo = r.result?.confidence ? CONFIDENCE_LABELS[r.result.confidence] : null;

                          return (
                            <div
                              key={i}
                              className={`p-3 rounded-lg ${
                                r.success && r.result?.confidence !== 'low'
                                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                                  : r.result?.confidence === 'low'
                                  ? 'bg-red-500/10 border border-red-500/20'
                                  : 'bg-white/5'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {r.success && r.result?.confidence !== 'low' ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                  ) : r.result?.confidence === 'low' ? (
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                  ) : (
                                    <XCircle className="w-5 h-5 text-white/30 flex-shrink-0" />
                                  )}
                                  <span className="font-medium">{r.name}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Source badge */}
                                  {sourceInfo && (
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${sourceInfo.color}`}>
                                      {sourceInfo.label}
                                    </span>
                                  )}

                                  {/* Confidence */}
                                  {confidenceInfo && (
                                    <span className={`text-xs ${confidenceInfo.color}`}>
                                      {confidenceInfo.label}
                                    </span>
                                  )}

                                  {/* Email */}
                                  {r.result?.email ? (
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-sm font-mono">
                                      {r.result.email}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-white/30">No email found</span>
                                  )}
                                </div>
                              </div>

                              {/* Show attempts for failed lookups */}
                              {!r.success && r.result?.attempts && r.result.attempts.length > 0 && (
                                <div className="mt-2 text-xs text-white/40 pl-8">
                                  Tried: {r.result.attempts.join(' → ')}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-400 mb-2">Quality-First Discovery</p>
                <p className="text-sm text-white/70 mb-3">
                  Only creates contacts for <span className="text-emerald-400">high-quality leads</span>.
                  Generic emails (info@, contact@) have ~5% response rates - we skip those.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-white/70">Personal emails (john@, jsmith@) = <span className="text-emerald-400">HIGH quality</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-white/70">Role emails (owner@, coach@) = <span className="text-emerald-400">HIGH quality</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-white/70">Generic (info@, contact@) = <span className="text-red-400">LOW quality - skipped</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Manual Email Modal */}
      {manualMode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F1123] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-2">Add Email Manually</h3>
            <p className="text-white/50 mb-4">{manualMode.orgName}</p>
            <input
              type="email"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              placeholder="contact@example.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl mb-4 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setManualMode(null); setManualEmail(''); }}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveManualEmail}
                disabled={!manualEmail || saving}
                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminGate>
  );
}
