'use client';

import { useState, useEffect } from 'react';
import AdminGate from '@/components/AdminGate';
import AdminNav from '@/components/AdminNav';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Users, RefreshCw, Trash2, Search, ExternalLink, CheckCircle, XCircle,
  AlertTriangle, Mail, Calendar, Link2, Image, ChevronDown, ChevronUp, Megaphone, BarChart3
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

interface Partner {
  id: string;
  email: string;
  name: string;
  first_name: string;
  tolt_partner_id: string | null;
  referral_url: string | null;
  referral_slug: string | null;
  logo_url: string | null;
  created_at: string;
  toltStatus?: string;
  toltEmail?: string;
  toltError?: string;
  referral_source: string | null;
}

// Human-readable referral source labels
const REFERRAL_SOURCE_LABELS: Record<string, string> = {
  'google_search': 'Google Search',
  'social_media_organic': 'Social Media (Organic)',
  'social_media_ad': 'Social Media (Ad)',
  'facebook': 'Facebook',
  'instagram': 'Instagram',
  'tiktok': 'TikTok',
  'twitter_x': 'Twitter/X',
  'youtube': 'YouTube',
  'podcast': 'Podcast',
  'referral_friend': 'Friend/Colleague',
  'referral_coach': 'Coach Referral',
  'referral_facility': 'Training Facility',
  'email_outreach': 'Email Outreach',
  'conference_event': 'Conference/Event',
  'app_store': 'App Store',
  'blog_article': 'Blog/Article',
  'other': 'Other',
};

interface ToltOnlyPartner {
  id: string;
  email: string;
  name: string;
  status: string;
}

interface SyncDetails {
  synced: Array<{ email: string; name: string }>;
  notInTolt: Array<{ email: string; name: string }>;
  inToltNotInDb: ToltOnlyPartner[];
  toltError?: string;
  idsFixed?: number;
  debug?: {
    apiKeyPresent?: boolean;
    programIdPresent?: boolean;
    toltPartnersCount: number;
    toltPartnerEmails: string[];
    dbPartnerEmails: string[];
    toltRawResponse?: string;
    idsFixed?: number;
  };
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteFromTolt, setDeleteFromTolt] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedPartner, setExpandedPartner] = useState<string | null>(null);
  const [syncDetails, setSyncDetails] = useState<SyncDetails | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [referralSourceFilter, setReferralSourceFilter] = useState<string>('all');
  const [showReferralStats, setShowReferralStats] = useState(false);

  const { getPassword } = useAdminAuth();
  const adminPassword = getPassword();

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async (checkTolt = false) => {
    try {
      setLoading(true);
      const url = checkTolt ? '/api/admin/partners?checkTolt=true' : '/api/admin/partners';
      const res = await fetch(url, {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await res.json();

      if (data.success) {
        setPartners(data.partners);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch partners' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch partners' });
    } finally {
      setLoading(false);
    }
  };

  const syncWithTolt = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({ action: 'sync-all' }),
      });
      const data = await res.json();

      if (data.success) {
        // Store detailed sync results including debug info
        setSyncDetails({ ...data.details, debug: data.debug, toltError: data.toltError, idsFixed: data.idsFixed });

        // Build summary message
        const issues = [];
        if (data.notInTolt > 0) issues.push(`${data.notInTolt} not in Tolt`);
        if (data.inToltNotInDb > 0) issues.push(`${data.inToltNotInDb} in Tolt only`);

        let msgText = '';
        if (issues.length > 0) {
          msgText = `Sync complete: ${data.synced}/${data.total} OK. Issues: ${issues.join(', ')}`;
        } else {
          msgText = `All ${data.synced} partners synced successfully!`;
        }
        if (data.idsFixed > 0) {
          msgText += ` (${data.idsFixed} IDs auto-fixed)`;
        }

        const msgType = issues.length > 0 ? 'error' : 'success';

        setMessage({ type: msgType as 'success' | 'error', text: msgText });

        // Show modal if there are issues
        if (issues.length > 0) {
          setShowSyncModal(true);
        }

        // Refresh with Tolt status
        await fetchPartners(true);
      } else {
        setMessage({ type: 'error', text: data.error || 'Sync failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  const deletePartner = async (email: string, alsoDeleteFromTolt?: boolean) => {
    const shouldDeleteFromTolt = alsoDeleteFromTolt !== undefined ? alsoDeleteFromTolt : deleteFromTolt;
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({ email, deleteFromTolt: shouldDeleteFromTolt }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setPartners(partners.filter(p => p.email !== email));
        setDeleteConfirm(null);
      } else {
        setMessage({ type: 'error', text: data.error || 'Delete failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Delete failed' });
    }
  };

  const filteredPartners = partners.filter(p => {
    const matchesSearch = p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReferralSource = referralSourceFilter === 'all' ||
      (referralSourceFilter === 'unknown' ? !p.referral_source : p.referral_source === referralSourceFilter);
    return matchesSearch && matchesReferralSource;
  });

  // Calculate referral source statistics
  const referralSourceStats = partners.reduce((acc, p) => {
    const source = p.referral_source || 'unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort stats by count descending
  const sortedReferralStats = Object.entries(referralSourceStats)
    .sort(([, a], [, b]) => b - a);

  const getToltStatusBadge = (partner: Partner) => {
    if (!partner.tolt_partner_id) {
      return (
        <span className="flex items-center gap-1 text-xs text-yellow-400">
          <AlertTriangle className="w-3 h-3" />
          No Tolt ID
        </span>
      );
    }
    if (partner.toltStatus === 'not_found' || partner.toltStatus === 'not_in_tolt') {
      return (
        <span className="flex items-center gap-1 text-xs text-red-400">
          <XCircle className="w-3 h-3" />
          Not in Tolt
        </span>
      );
    }
    if (partner.toltStatus === 'active') {
      return (
        <span className="flex items-center gap-1 text-xs text-green-400">
          <CheckCircle className="w-3 h-3" />
          Synced
        </span>
      );
    }
    if (partner.toltStatus) {
      return (
        <span className="flex items-center gap-1 text-xs text-green-400">
          <CheckCircle className="w-3 h-3" />
          {partner.toltStatus}
        </span>
      );
    }
    return (
      <span className="text-xs text-white/40">
        Not checked
      </span>
    );
  };

  return (
    <AdminGate>
      <div className="min-h-screen bg-[#0A0B14] text-white">
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5 pointer-events-none" />

        <div className="relative z-10 pt-28 pb-12 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Partner Management</h1>
              <p className="text-white/50 text-sm sm:text-base">Manage affiliate partners and sync with Tolt</p>
            </div>

            {/* Admin Navigation */}
            <AdminNav />

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 mb-8">
              <button
                onClick={() => fetchPartners(true)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={syncWithTolt}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                Sync with Tolt
              </button>
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

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="text-2xl font-bold text-white">{partners.length}</div>
              <div className="text-sm text-white/60">Total Partners</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-400">
                {partners.filter(p => p.toltStatus === 'active').length}
              </div>
              <div className="text-sm text-white/60">Synced</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {partners.filter(p => !p.tolt_partner_id).length}
              </div>
              <div className="text-sm text-white/60">No Tolt ID</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-red-400">
                {partners.filter(p => p.toltStatus === 'not_found' || p.toltStatus === 'not_in_tolt').length}
              </div>
              <div className="text-sm text-white/60">Not in Tolt</div>
            </Card>
          </div>

          {/* Referral Source Analytics */}
          <Card variant="elevated" className="mb-8">
            <button
              onClick={() => setShowReferralStats(!showReferralStats)}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors rounded-t-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">How Partners Found Us</h3>
                  <p className="text-sm text-white/50">Marketing channel attribution</p>
                </div>
              </div>
              {showReferralStats ? (
                <ChevronUp className="w-5 h-5 text-white/60" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/60" />
              )}
            </button>

            {showReferralStats && (
              <div className="p-4 pt-0 border-t border-white/5">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                  {sortedReferralStats.map(([source, count]) => (
                    <button
                      key={source}
                      onClick={() => setReferralSourceFilter(source === referralSourceFilter ? 'all' : source)}
                      className={`p-3 rounded-lg text-left transition-all ${
                        referralSourceFilter === source
                          ? 'bg-purple-500/30 border-2 border-purple-500'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xl font-bold text-white">{count}</div>
                      <div className="text-xs text-white/60 truncate">
                        {source === 'unknown' ? 'Unknown' : (REFERRAL_SOURCE_LABELS[source] || source)}
                      </div>
                    </button>
                  ))}
                </div>
                {referralSourceFilter !== 'all' && (
                  <button
                    onClick={() => setReferralSourceFilter('all')}
                    className="mt-3 text-sm text-purple-400 hover:text-purple-300"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            )}
          </Card>

          {/* Search */}
          <Card className="p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
              />
            </div>
          </Card>

          {/* Partners List */}
          <Card variant="elevated" className="overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">
                Partners ({filteredPartners.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-white/60">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                Loading partners...
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="p-8 text-center text-white/60">
                No partners found
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredPartners.map((partner) => (
                  <div key={partner.id} className="hover:bg-white/5 transition-colors">
                    {/* Main row */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Avatar/Logo */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          {partner.logo_url ? (
                            <img
                              src={partner.logo_url}
                              alt={partner.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold">
                              {partner.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white truncate">
                              {partner.name}
                            </span>
                            {getToltStatusBadge(partner)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{partner.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedPartner(expandedPartner === partner.id ? null : partner.id)}
                          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          {expandedPartner === partner.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>

                        {deleteConfirm === partner.email ? (
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1 text-xs text-white/60">
                              <input
                                type="checkbox"
                                checked={deleteFromTolt}
                                onChange={(e) => setDeleteFromTolt(e.target.checked)}
                                className="rounded"
                              />
                              Also Tolt
                            </label>
                            <button
                              onClick={() => deletePartner(partner.email)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(partner.email)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete partner"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {expandedPartner === partner.id && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-white/5 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-white/40 mb-1">Tolt Partner ID</div>
                            <div className="text-white font-mono">
                              {partner.tolt_partner_id || 'None'}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/40 mb-1">Referral Slug</div>
                            <div className="text-white font-mono">
                              {partner.referral_slug || 'None'}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/40 mb-1">Created</div>
                            <div className="text-white flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(partner.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/40 mb-1">Has Logo</div>
                            <div className="text-white flex items-center gap-1">
                              <Image className="w-3 h-3" />
                              {partner.logo_url ? 'Yes' : 'No'}
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <div className="text-white/40 mb-1">How They Found Us</div>
                            <div className="text-white flex items-center gap-1">
                              <Megaphone className="w-3 h-3 text-purple-400" />
                              <span className={partner.referral_source ? 'text-purple-300' : 'text-white/40'}>
                                {partner.referral_source
                                  ? (REFERRAL_SOURCE_LABELS[partner.referral_source] || partner.referral_source)
                                  : 'Not specified'}
                              </span>
                            </div>
                          </div>
                          {partner.referral_url && (
                            <div className="sm:col-span-2">
                              <div className="text-white/40 mb-1">Referral URL</div>
                              <a
                                href={partner.referral_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 truncate"
                              >
                                <Link2 className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{partner.referral_url}</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sync Details Modal */}
        {showSyncModal && syncDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#0F1123] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Sync Results</h2>
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="text-white/60 hover:text-white text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Not in Tolt */}
                {syncDetails.notInTolt.length > 0 && (
                  <div>
                    <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Not Found in Tolt ({syncDetails.notInTolt.length})
                    </h3>
                    <div className="bg-red-500/10 rounded-lg p-3 space-y-2">
                      {syncDetails.notInTolt.map((p, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="text-sm text-white/80">
                            {p.name} - <span className="text-white/50">{p.email}</span>
                          </div>
                          <button
                            onClick={async () => {
                              if (confirm(`Delete ${p.name} (${p.email}) from database?`)) {
                                await deletePartner(p.email, false);
                                // Update sync details
                                setSyncDetails(prev => prev ? {
                                  ...prev,
                                  notInTolt: prev.notInTolt.filter(x => x.email !== p.email)
                                } : null);
                              }
                            }}
                            className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded transition-colors"
                          >
                            Delete from DB
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-white/40 mt-2">
                      These partners have Tolt IDs in our DB but don&apos;t exist in Tolt
                    </p>
                  </div>
                )}

                {/* IDs Fixed notification */}
                {syncDetails.idsFixed && syncDetails.idsFixed > 0 && (
                  <div className="bg-blue-500/10 rounded-lg p-3">
                    <p className="text-sm text-blue-400">
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      {syncDetails.idsFixed} Tolt ID(s) were auto-corrected in the database
                    </p>
                  </div>
                )}

                {/* In Tolt but not in our DB */}
                {syncDetails.inToltNotInDb.length > 0 && (
                  <div>
                    <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      In Tolt Only ({syncDetails.inToltNotInDb.length})
                    </h3>
                    <div className="bg-yellow-500/10 rounded-lg p-3 space-y-1">
                      {syncDetails.inToltNotInDb.map((p, i) => (
                        <div key={i} className="text-sm text-white/80">
                          {p.name} - <span className="text-white/50">{p.email}</span>
                          <span className="text-xs text-yellow-400 ml-2">({p.status})</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-white/40 mt-2">
                      These partners exist in Tolt but not in our database
                    </p>
                  </div>
                )}

                {/* Synced successfully */}
                {syncDetails.synced.length > 0 && (
                  <div>
                    <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Synced Successfully ({syncDetails.synced.length})
                    </h3>
                    <div className="bg-green-500/10 rounded-lg p-3">
                      <div className="text-sm text-white/60">
                        {syncDetails.synced.map(p => p.name).join(', ')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Debug Info */}
                {syncDetails.debug && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h3 className="text-purple-400 font-semibold mb-2">🔍 Debug Info</h3>
                    <div className="bg-purple-500/10 rounded-lg p-3 text-xs space-y-2">
                      <p><span className="text-white/50">API Key Present:</span> <span className={syncDetails.debug.apiKeyPresent ? 'text-green-400' : 'text-red-400'}>{syncDetails.debug.apiKeyPresent ? 'Yes' : 'No'}</span></p>
                      <p><span className="text-white/50">Program ID Present:</span> <span className={syncDetails.debug.programIdPresent ? 'text-green-400' : 'text-red-400'}>{syncDetails.debug.programIdPresent ? 'Yes' : 'No (add TOLT_PROGRAM_ID env var)'}</span></p>
                      <p><span className="text-white/50">Tolt Partners Found:</span> <span className="text-white">{syncDetails.debug.toltPartnersCount}</span></p>
                      <p><span className="text-white/50">Tolt Emails:</span> <span className="text-purple-300">{syncDetails.debug.toltPartnerEmails.length > 0 ? syncDetails.debug.toltPartnerEmails.join(', ') : '(none)'}</span></p>
                      <p><span className="text-white/50">DB Emails:</span> <span className="text-blue-300">{syncDetails.debug.dbPartnerEmails.join(', ')}</span></p>
                      {syncDetails.toltError && (
                        <p><span className="text-white/50">Tolt Error:</span> <span className="text-red-400">{syncDetails.toltError}</span></p>
                      )}
                      {syncDetails.debug.toltRawResponse && (
                        <div>
                          <p className="text-white/50 mb-1">Raw Tolt Response:</p>
                          <pre className="bg-black/30 p-2 rounded text-[10px] overflow-x-auto text-yellow-300">{syncDetails.debug.toltRawResponse}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/10">
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </AdminGate>
  );
}
