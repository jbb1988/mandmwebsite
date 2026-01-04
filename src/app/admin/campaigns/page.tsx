'use client';

import { useEffect, useState } from 'react';
import AdminGate from '@/components/AdminGate';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Mail, BarChart3, Users, Clock, Send, Eye, MousePointer,
  MessageSquare, ChevronDown, ChevronUp, ExternalLink, AlertCircle,
  CheckCircle2, XCircle, RefreshCw, Calendar, Bot, UserCheck,
  TrendingDown, ArrowRight, Lightbulb, X, Link2, Building2
} from 'lucide-react';

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

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status] || statusStyles.draft}`}>
      {status}
    </span>
  );
}

// Segment badge component
function SegmentBadge({ segment }: { segment: string }) {
  const segmentStyles: Record<string, string> = {
    national_org: 'bg-purple-500/20 text-purple-400',
    travel_org: 'bg-blue-500/20 text-blue-400',
    facility: 'bg-emerald-500/20 text-emerald-400',
    influencer: 'bg-pink-500/20 text-pink-400',
    equipment: 'bg-orange-500/20 text-orange-400',
    tech: 'bg-cyan-500/20 text-cyan-400',
    youth_dev: 'bg-yellow-500/20 text-yellow-400',
  };

  const displayNames: Record<string, string> = {
    national_org: 'National Org',
    travel_org: 'Travel Org',
    facility: 'Facility',
    influencer: 'Influencer',
    equipment: 'Equipment',
    tech: 'Tech',
    youth_dev: 'Youth Dev',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${segmentStyles[segment] || 'bg-white/10 text-white/60'}`}>
      {displayNames[segment] || segment}
    </span>
  );
}

interface Campaign {
  id: string;
  name: string;
  segment: string;
  status: string;
  total_contacts: number;
  emails_sent: number;
  emails_opened: number;
  emails_clicked: number;
  replies_received: number;
  open_rate: number;
  click_rate: number;
  reply_rate: number;
  created_at: string;
  started_at: string | null;
  statusBreakdown: {
    pending: number;
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
    bounced: number;
  };
  sequenceBreakdown: {
    step1: number;
    step2: number;
    step3: number;
    step4: number;
  };
  recentActivity: Array<{
    type: string;
    email: string;
    timestamp: string;
  }>;
  clickBreakdown?: ClickBreakdown;
  calendlyBreakdown?: CalendlyBreakdown;
}

interface Summary {
  totalCampaigns: number;
  activeCampaigns: number;
  totalContacts: number;
  totalSent: number;
  overallOpenRate: number;
  overallClickRate: number;
  scheduledNext24h: number;
  scheduledNext7d: number;
}

interface UpcomingSend {
  contact_email: string;
  campaign_name: string;
  sequence_step: number;
  next_send_at: string;
}

interface ConversionFunnel {
  contactsInApp: number;
  usersFromDomains: number;
  totalTrackedClicks: number;
  humanClicks: number;
  botClicks: number;
  calendlyBookings: number;
  clickDataSource?: 'detailed' | 'resend';
}

interface ClickBreakdown {
  cta_calendly: number;
  logo: number;
  unsubscribe: number;
  other: number;
  bot_clicks: number;
  human_clicks: number;
}

interface CalendlyBreakdown {
  total: number;
  scheduled: number;
  completed: number;
  canceled: number;
}

interface CampaignContact {
  id: string;
  contact_id: string;
  email: string;
  first_name: string;
  last_name: string;
  title: string | null;
  organization_name: string | null;
  organization_id: string | null;
  sequence_step: number;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  replied_at: string | null;
  bounced_at: string | null;
  next_send_at: string | null;
  reply_sentiment: string | null;
  clicks: Array<{ link_type: string; clicked_at: string }>;
}

interface ClickActivity {
  id: string;
  contact_id: string;
  email: string;
  first_name: string;
  last_name: string;
  organization_name: string | null;
  link_type: string;
  destination_url: string;
  clicked_at: string;
  is_likely_bot: boolean;
}

interface ContactsData {
  contacts: CampaignContact[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  statusCounts: Record<string, number>;
}

interface ClicksData {
  clicks: ClickActivity[];
  stats: {
    total: number;
    human: number;
    bot: number;
    uniqueClickers: number;
    byLinkType: Record<string, number>;
    dataSource?: 'detailed' | 'resend';
  };
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function CampaignsPage() {
  const { getPassword } = useAdminAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [upcomingSends, setUpcomingSends] = useState<UpcomingSend[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Contacts & Clicks modal state
  const [contactsModal, setContactsModal] = useState<{ campaignId: string; campaignName: string } | null>(null);
  const [clicksModal, setClicksModal] = useState<{ campaignId: string; campaignName: string } | null>(null);
  const [contactsData, setContactsData] = useState<ContactsData | null>(null);
  const [clicksData, setClicksData] = useState<ClicksData | null>(null);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [clicksLoading, setClicksLoading] = useState(false);
  const [contactsFilter, setContactsFilter] = useState('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/campaigns', {
        headers: { 'X-Admin-Password': getPassword() },
      });
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.campaigns || []);
        setSummary(data.summary || null);
        setUpcomingSends(data.upcomingSends || []);
        setConversionFunnel(data.conversionFunnel || null);
      } else {
        setError(data.message || 'Failed to fetch campaigns');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }

  async function fetchContacts(campaignId: string, status = 'all') {
    setContactsLoading(true);
    try {
      const params = new URLSearchParams({ status });
      const response = await fetch(`/api/admin/campaigns/${campaignId}/contacts?${params}`, {
        headers: { 'X-Admin-Password': getPassword() },
      });
      const data = await response.json();
      if (data.success) {
        setContactsData(data);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setContactsLoading(false);
    }
  }

  async function fetchClicks(campaignId: string) {
    setClicksLoading(true);
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/clicks`, {
        headers: { 'X-Admin-Password': getPassword() },
      });
      const data = await response.json();
      if (data.success) {
        setClicksData(data);
      }
    } catch (err) {
      console.error('Failed to fetch clicks:', err);
    } finally {
      setClicksLoading(false);
    }
  }

  function openContactsModal(campaignId: string, campaignName: string) {
    setContactsModal({ campaignId, campaignName });
    setContactsFilter('all');
    fetchContacts(campaignId);
  }

  function openClicksModal(campaignId: string, campaignName: string) {
    setClicksModal({ campaignId, campaignName });
    fetchClicks(campaignId);
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function getInsight(campaign: Campaign): string {
    if (campaign.emails_sent === 0) return 'No emails sent yet';
    if (campaign.statusBreakdown.bounced > campaign.emails_sent * 0.15) {
      return 'High bounce rate - review email list quality';
    }
    if (campaign.open_rate >= 25) return 'Strong open rate - keep subject lines similar';
    if (campaign.open_rate >= 15) return 'Average open rate - consider A/B testing subjects';
    if (campaign.open_rate > 0) return 'Low open rate - revise subject lines';
    return 'Awaiting engagement data';
  }

  return (
    <AdminGate
      title="Campaign Dashboard"
      description="View marketing campaign analytics"
    >
      <div className="min-h-screen bg-[#0A0B14] text-white">
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-blue-900/5 pointer-events-none" />

        <div className="relative z-10 pt-28 pb-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                <Mail className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Campaign Dashboard</h1>
              <p className="text-white/50">Email campaign analytics and tracking</p>
            </div>


            {/* Refresh Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={fetchCampaigns}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {error && (
              <Card variant="bordered" className="p-4 mb-6 border-red-500/30 bg-red-500/10">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400">{error}</p>
                </div>
              </Card>
            )}

            {/* Stats Row */}
            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <StatCard
                  value={summary.activeCampaigns}
                  label="Active Campaigns"
                  icon={BarChart3}
                  color="green"
                />
                <StatCard
                  value={summary.totalSent}
                  label="Emails Sent"
                  icon={Send}
                  color="blue"
                />
                <StatCard
                  value={`${summary.overallOpenRate}%`}
                  label="Open Rate"
                  icon={Eye}
                  color="purple"
                />
                <StatCard
                  value={summary.scheduledNext24h}
                  label="Scheduled (24h)"
                  icon={Clock}
                  color="orange"
                />
              </div>
            )}

            {/* Conversion Funnel */}
            {conversionFunnel && (
              <Card variant="elevated" className="mb-8 overflow-hidden" glow>
                <div className="p-4 border-b border-white/10">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-orange-400" />
                    Conversion Funnel
                  </h2>
                  <p className="text-white/50 text-sm mt-1">Track clicks through to app signups</p>
                </div>

                <div className="p-6">
                  {/* Funnel Visualization */}
                  <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
                    <div className="text-center px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-2xl font-bold text-white">{summary?.totalSent || 0}</p>
                      <p className="text-xs text-white/50 mt-1">Sent</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/30 flex-shrink-0" />
                    <div className="text-center px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-2xl font-bold text-emerald-400">
                        {conversionFunnel.humanClicks}
                        {conversionFunnel.botClicks > 0 && (
                          <span className="text-xs text-red-400 ml-1">
                            (+{conversionFunnel.botClicks} bot)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-white/50 mt-1">Real Clicks</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/30 flex-shrink-0" />
                    <div className="text-center px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-2xl font-bold text-blue-400">{conversionFunnel.calendlyBookings}</p>
                      <p className="text-xs text-white/50 mt-1">Calendly Bookings</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/30 flex-shrink-0" />
                    <div className="text-center px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-2xl font-bold text-purple-400">{conversionFunnel.contactsInApp}</p>
                      <p className="text-xs text-white/50 mt-1">Became Users</p>
                    </div>
                  </div>

                  {/* Detail Cards */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Bot Detection */}
                    <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-4 h-4 text-red-400" />
                        <h4 className="text-sm font-medium text-white">Bot Detection</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Total Tracked Clicks</span>
                          <span className="text-white">{conversionFunnel.totalTrackedClicks}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Human Clicks</span>
                          <span className="text-emerald-400">{conversionFunnel.humanClicks}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Bot/Scanner Clicks</span>
                          <span className="text-red-400">{conversionFunnel.botClicks}</span>
                        </div>
                        {conversionFunnel.totalTrackedClicks > 0 && (
                          <div className="pt-2 border-t border-white/5">
                            <div className="text-xs text-white/40">
                              {Math.round((conversionFunnel.botClicks / conversionFunnel.totalTrackedClicks) * 100)}% filtered as bots
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Calendly Bookings */}
                    <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <h4 className="text-sm font-medium text-white">Calendly Bookings</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Total Booked</span>
                          <span className="text-white">{conversionFunnel.calendlyBookings}</span>
                        </div>
                        {conversionFunnel.humanClicks > 0 && conversionFunnel.calendlyBookings > 0 && (
                          <div className="pt-2 border-t border-white/5">
                            <div className="text-xs text-white/40">
                              {Math.round((conversionFunnel.calendlyBookings / conversionFunnel.humanClicks) * 100)}% click-to-booking rate
                            </div>
                          </div>
                        )}
                        {conversionFunnel.calendlyBookings === 0 && conversionFunnel.humanClicks > 0 && (
                          <div className="pt-2 border-t border-white/5">
                            <p className="text-xs text-orange-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              No bookings yet from clicks
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email → User Match */}
                    <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <UserCheck className="w-4 h-4 text-purple-400" />
                        <h4 className="text-sm font-medium text-white">Email → User Match</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Direct Email Matches</span>
                          <span className="text-purple-400">{conversionFunnel.contactsInApp}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Domain Matches</span>
                          <span className="text-cyan-400">{conversionFunnel.usersFromDomains}</span>
                        </div>
                        <div className="pt-2 border-t border-white/5">
                          <p className="text-xs text-white/40">
                            Cross-references campaign emails with registered users
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Data Source Info */}
                  {conversionFunnel.clickDataSource === 'resend' && conversionFunnel.humanClicks > 0 && (
                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-blue-400 font-medium text-sm">Using Resend Click Data</p>
                          <p className="text-white/60 text-sm mt-1">
                            Click data is from Resend webhooks. This shows unique clickers but doesn't include
                            URL-level tracking (which link was clicked) or bot detection. Enable detailed tracking
                            for future emails to see CTA vs logo clicks and filter bots.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {conversionFunnel.totalTrackedClicks === 0 && (
                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-blue-400 font-medium text-sm">No Click Data Yet</p>
                          <p className="text-white/60 text-sm mt-1">
                            No click events have been recorded. Click data will appear after emails are sent
                            and recipients interact with links.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {conversionFunnel.humanClicks > 0 && conversionFunnel.calendlyBookings === 0 && (
                    <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-orange-400 font-medium text-sm">Funnel Drop-off Detected</p>
                          <p className="text-white/60 text-sm mt-1">
                            You have {conversionFunnel.humanClicks} real clicks but no Calendly bookings.
                            Consider: (1) A/B test CTA copy, (2) Add a free trial or PDF guide as immediate value,
                            (3) Shorten the Calendly booking flow, or (4) Add testimonials near the CTA.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {conversionFunnel.contactsInApp > 0 && (
                    <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-emerald-400 font-medium text-sm">Conversions Detected!</p>
                          <p className="text-white/60 text-sm mt-1">
                            {conversionFunnel.contactsInApp} campaign contacts have signed up for the app.
                            {conversionFunnel.usersFromDomains > 0 && ` Plus ${conversionFunnel.usersFromDomains} additional users from their organizations.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Campaigns Table */}
            <Card variant="default" className="mb-8 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-purple-400" />
                  Campaigns ({campaigns.length})
                </h2>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-8 h-8 text-white/30 animate-spin mx-auto mb-3" />
                  <p className="text-white/50">Loading campaigns...</p>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50">No campaigns found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-white/40 border-b border-white/5">
                        <th className="px-4 py-3 font-medium">Campaign</th>
                        <th className="px-4 py-3 font-medium">Segment</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Contacts</th>
                        <th className="px-4 py-3 font-medium text-right">Sent</th>
                        <th className="px-4 py-3 font-medium text-right">Click %</th>
                        <th className="px-4 py-3 font-medium text-right">Replies</th>
                        <th className="px-4 py-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <>
                          <tr
                            key={campaign.id}
                            className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                            onClick={() => setExpandedCampaign(
                              expandedCampaign === campaign.id ? null : campaign.id
                            )}
                          >
                            <td className="px-4 py-4">
                              <p className="text-white font-medium text-sm">{campaign.name}</p>
                              <p className="text-white/40 text-xs mt-0.5">
                                Created {formatDate(campaign.created_at)}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <SegmentBadge segment={campaign.segment} />
                            </td>
                            <td className="px-4 py-4">
                              <StatusBadge status={campaign.status} />
                            </td>
                            <td className="px-4 py-4 text-right text-white/70 text-sm">
                              {campaign.total_contacts}
                            </td>
                            <td className="px-4 py-4 text-right text-white/70 text-sm">
                              {campaign.emails_sent}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className={`text-sm font-medium ${
                                campaign.click_rate >= 5 ? 'text-emerald-400' :
                                campaign.click_rate > 0 ? 'text-blue-400' : 'text-white/40'
                              }`}>
                                {campaign.click_rate}%
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right text-white/70 text-sm">
                              {campaign.replies_received}
                            </td>
                            <td className="px-4 py-4 text-right">
                              {expandedCampaign === campaign.id ? (
                                <ChevronUp className="w-4 h-4 text-white/40" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-white/40" />
                              )}
                            </td>
                          </tr>

                          {/* Expanded Detail Row */}
                          {expandedCampaign === campaign.id && (
                            <tr key={`${campaign.id}-detail`}>
                              <td colSpan={8} className="bg-white/[0.02] border-b border-white/10">
                                <div className="p-4 grid md:grid-cols-3 gap-4">
                                  {/* Status Breakdown */}
                                  <div>
                                    <h4 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-wide">
                                      Status Breakdown
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-white/60 flex items-center gap-2">
                                          <Send className="w-3 h-3" /> Sent
                                        </span>
                                        <span className="text-white">{campaign.statusBreakdown.sent}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-white/60 flex items-center gap-2">
                                          <Eye className="w-3 h-3" /> Opened
                                        </span>
                                        <span className="text-emerald-400">{campaign.statusBreakdown.opened}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-white/60 flex items-center gap-2">
                                          <MousePointer className="w-3 h-3" /> Clicked
                                        </span>
                                        <span className="text-blue-400">{campaign.statusBreakdown.clicked}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-white/60 flex items-center gap-2">
                                          <MessageSquare className="w-3 h-3" /> Replied
                                        </span>
                                        <span className="text-purple-400">{campaign.statusBreakdown.replied}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-white/60 flex items-center gap-2">
                                          <XCircle className="w-3 h-3" /> Bounced
                                        </span>
                                        <span className="text-red-400">{campaign.statusBreakdown.bounced}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Sequence Progress */}
                                  <div>
                                    <h4 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-wide">
                                      Sequence Progress
                                    </h4>
                                    <div className="space-y-2">
                                      {[1, 2, 3, 4].map((step) => {
                                        const count = campaign.sequenceBreakdown[`step${step}` as keyof typeof campaign.sequenceBreakdown];
                                        const total = Object.values(campaign.sequenceBreakdown).reduce((a, b) => a + b, 0);
                                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                        return (
                                          <div key={step} className="flex items-center gap-3">
                                            <span className="text-white/40 text-xs w-14">Step {step}</span>
                                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                              <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                                style={{ width: `${pct}%` }}
                                              />
                                            </div>
                                            <span className="text-white/60 text-xs w-10 text-right">{count}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Insight */}
                                  <div>
                                    <h4 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-wide">
                                      Insight
                                    </h4>
                                    <div className={`p-3 rounded-lg text-sm ${
                                      campaign.open_rate >= 25 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                                      campaign.open_rate >= 15 ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' :
                                      'bg-white/5 border border-white/10 text-white/60'
                                    }`}>
                                      {getInsight(campaign)}
                                    </div>

                                    {campaign.recentActivity.length > 0 && (
                                      <div className="mt-4">
                                        <h5 className="text-xs text-white/40 mb-2">Recent Activity</h5>
                                        <div className="space-y-1">
                                          {campaign.recentActivity.slice(0, 3).map((activity, i) => (
                                            <div key={i} className="text-xs text-white/50">
                                              <span className={
                                                activity.type === 'replied' ? 'text-purple-400' :
                                                activity.type === 'clicked' ? 'text-blue-400' :
                                                'text-emerald-400'
                                              }>
                                                {activity.type}
                                              </span>
                                              {' - '}
                                              <span className="text-white/70">{activity.email}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Click & Calendly Breakdown Row */}
                                {(campaign.clickBreakdown || campaign.calendlyBreakdown) && (
                                  <div className="p-4 border-t border-white/5 grid md:grid-cols-2 gap-4">
                                    {/* Click Breakdown */}
                                    {campaign.clickBreakdown && campaign.clickBreakdown.human_clicks > 0 && (
                                      <div>
                                        <h4 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-wide flex items-center gap-2">
                                          <MousePointer className="w-3 h-3" />
                                          Link Click Breakdown
                                        </h4>
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-white/60">CTA (Book a Call)</span>
                                            <span className="text-blue-400">{campaign.clickBreakdown.cta_calendly}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Logo Click</span>
                                            <span className="text-white/70">{campaign.clickBreakdown.logo}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Unsubscribe</span>
                                            <span className="text-orange-400">{campaign.clickBreakdown.unsubscribe}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Other</span>
                                            <span className="text-white/50">{campaign.clickBreakdown.other}</span>
                                          </div>
                                          {campaign.clickBreakdown.bot_clicks > 0 && (
                                            <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                                              <span className="text-red-400/60 flex items-center gap-1">
                                                <Bot className="w-3 h-3" /> Bot Clicks (filtered)
                                              </span>
                                              <span className="text-red-400">{campaign.clickBreakdown.bot_clicks}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Calendly Breakdown */}
                                    {campaign.calendlyBreakdown && campaign.calendlyBreakdown.total > 0 && (
                                      <div>
                                        <h4 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-wide flex items-center gap-2">
                                          <Calendar className="w-3 h-3" />
                                          Calendly Bookings
                                        </h4>
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Total Booked</span>
                                            <span className="text-white">{campaign.calendlyBreakdown.total}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Scheduled</span>
                                            <span className="text-blue-400">{campaign.calendlyBreakdown.scheduled}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Completed</span>
                                            <span className="text-emerald-400">{campaign.calendlyBreakdown.completed}</span>
                                          </div>
                                          <div className="flex justify-between text-sm">
                                            <span className="text-white/60">Canceled</span>
                                            <span className="text-red-400">{campaign.calendlyBreakdown.canceled}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="p-4 border-t border-white/5 flex gap-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openContactsModal(campaign.id, campaign.name);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm text-purple-400 transition-colors"
                                  >
                                    <Users className="w-4 h-4" />
                                    View Contacts ({campaign.total_contacts})
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openClicksModal(campaign.id, campaign.name);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-sm text-blue-400 transition-colors"
                                  >
                                    <Link2 className="w-4 h-4" />
                                    View Click Activity
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Upcoming Sends */}
            {upcomingSends.length > 0 && (
              <Card variant="default" className="mb-8">
                <div className="p-4 border-b border-white/10">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-400" />
                    Upcoming Sends (Next 48h)
                  </h2>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {upcomingSends.slice(0, 10).map((send, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <span className="text-orange-400 font-bold text-sm">{send.sequence_step}</span>
                          </div>
                          <div>
                            <p className="text-white text-sm">{send.contact_email}</p>
                            <p className="text-white/40 text-xs">{send.campaign_name}</p>
                          </div>
                        </div>
                        <span className="text-white/50 text-sm">{formatDate(send.next_send_at)}</span>
                      </div>
                    ))}
                  </div>
                  {upcomingSends.length > 10 && (
                    <p className="text-white/40 text-sm text-center mt-4">
                      +{upcomingSends.length - 10} more scheduled
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Quick Links */}
            <Card variant="bordered" className="p-5">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-white/40" />
                Quick Links
              </h3>
              <div className="grid md:grid-cols-4 gap-3">
                <a
                  href="https://app.resend.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors border border-white/[0.05] hover:border-white/10"
                >
                  <Mail className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-white font-medium text-sm">Resend Dashboard</p>
                    <p className="text-xs text-white/30">Email delivery logs</p>
                  </div>
                </a>
                <a
                  href="https://calendly.com/event_types/user/me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors border border-white/[0.05] hover:border-white/10"
                >
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-white font-medium text-sm">Calendly</p>
                    <p className="text-xs text-white/30">View bookings & webhook</p>
                  </div>
                </a>
                <a
                  href="https://us2.make.com/organization/1299298/scenarios"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors border border-white/[0.05] hover:border-white/10"
                >
                  <RefreshCw className="w-4 h-4 text-orange-400" />
                  <div>
                    <p className="text-white font-medium text-sm">Make.com</p>
                    <p className="text-xs text-white/30">Automation workflows</p>
                  </div>
                </a>
                <a
                  href="https://supabase.com/dashboard/project/kuswlvbjplkgrqlmqtok/editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors border border-white/[0.05] hover:border-white/10"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-white font-medium text-sm">Database</p>
                    <p className="text-xs text-white/30">View raw campaign data</p>
                  </div>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Contacts Modal */}
      {contactsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0F1123] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Campaign Contacts
                </h2>
                <p className="text-white/50 text-sm mt-1">{contactsModal.campaignName}</p>
              </div>
              <button
                onClick={() => {
                  setContactsModal(null);
                  setContactsData(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Status Filter */}
            <div className="p-4 border-b border-white/5 flex items-center gap-2 flex-wrap">
              <span className="text-white/40 text-sm">Filter:</span>
              {['all', 'pending', 'sent', 'opened', 'clicked', 'replied', 'bounced'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setContactsFilter(status);
                    fetchContacts(contactsModal.campaignId, status);
                  }}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    contactsFilter === status
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                      : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {contactsData?.statusCounts && status !== 'all' && (
                    <span className="ml-1">({contactsData.statusCounts[status] || 0})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Contacts Table */}
            <div className="overflow-auto max-h-[60vh]">
              {contactsLoading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-8 h-8 text-white/30 animate-spin mx-auto mb-3" />
                  <p className="text-white/50">Loading contacts...</p>
                </div>
              ) : contactsData?.contacts.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50">No contacts found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#0F1123]">
                    <tr className="text-left text-xs text-white/40 border-b border-white/5">
                      <th className="px-4 py-3 font-medium">Contact</th>
                      <th className="px-4 py-3 font-medium">Organization</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Step</th>
                      <th className="px-4 py-3 font-medium">Sent</th>
                      <th className="px-4 py-3 font-medium">Opened</th>
                      <th className="px-4 py-3 font-medium">Clicked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactsData?.contacts.map((contact) => (
                      <tr key={contact.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <p className="text-white text-sm">{contact.email}</p>
                          {(contact.first_name || contact.last_name) && (
                            <p className="text-white/40 text-xs">
                              {contact.first_name} {contact.last_name}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {contact.organization_name ? (
                            <span className="text-white/60 text-sm flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {contact.organization_name}
                            </span>
                          ) : (
                            <span className="text-white/30 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            contact.status === 'replied' ? 'bg-purple-500/20 text-purple-400' :
                            contact.status === 'clicked' ? 'bg-blue-500/20 text-blue-400' :
                            contact.status === 'opened' ? 'bg-emerald-500/20 text-emerald-400' :
                            contact.status === 'sent' ? 'bg-cyan-500/20 text-cyan-400' :
                            contact.status === 'bounced' ? 'bg-red-500/20 text-red-400' :
                            'bg-white/10 text-white/50'
                          }`}>
                            {contact.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">
                            {contact.sequence_step}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/50 text-xs">
                          {contact.sent_at ? formatDate(contact.sent_at) : '-'}
                        </td>
                        <td className="px-4 py-3 text-white/50 text-xs">
                          {contact.opened_at ? formatDate(contact.opened_at) : '-'}
                        </td>
                        <td className="px-4 py-3 text-white/50 text-xs">
                          {contact.clicked_at ? formatDate(contact.clicked_at) : '-'}
                          {contact.clicks.length > 0 && (
                            <span className="text-blue-400 ml-1">({contact.clicks.length})</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {contactsData && contactsData.pagination.totalPages > 1 && (
              <div className="p-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-white/50 text-sm">
                  Showing {contactsData.contacts.length} of {contactsData.pagination.total} contacts
                </p>
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(contactsData.pagination.totalPages, 5) }, (_, i) => (
                    <button
                      key={i}
                      className={`w-8 h-8 rounded-lg text-sm ${
                        contactsData.pagination.page === i + 1
                          ? 'bg-purple-500/30 text-purple-300'
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clicks Modal */}
      {clicksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0F1123] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-blue-400" />
                  Click Activity
                </h2>
                <p className="text-white/50 text-sm mt-1">{clicksModal.campaignName}</p>
              </div>
              <button
                onClick={() => {
                  setClicksModal(null);
                  setClicksData(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Click Stats */}
            {clicksData?.stats && (
              <div className="p-4 border-b border-white/5">
                {clicksData.stats.dataSource === 'resend' && (
                  <div className="mb-3 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-xs text-blue-400">
                      Data from Resend webhooks. Link types unavailable for historical emails.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-white">{clicksData.stats.total}</p>
                    <p className="text-xs text-white/50">Total Clicks</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-purple-400">{clicksData.stats.uniqueClickers}</p>
                    <p className="text-xs text-white/50">Unique Clickers</p>
                  </div>
                  {clicksData.stats.dataSource !== 'resend' && (
                    <>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <p className="text-2xl font-bold text-blue-400">{clicksData.stats.byLinkType.cta_calendly || 0}</p>
                        <p className="text-xs text-white/50">CTA Clicks</p>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <p className="text-2xl font-bold text-orange-400">{clicksData.stats.byLinkType.unsubscribe || 0}</p>
                        <p className="text-xs text-white/50">Unsubscribes</p>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <p className="text-2xl font-bold text-red-400">{clicksData.stats.bot}</p>
                        <p className="text-xs text-white/50">Bot (filtered)</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Clicks Table */}
            <div className="overflow-auto max-h-[50vh]">
              {clicksLoading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-8 h-8 text-white/30 animate-spin mx-auto mb-3" />
                  <p className="text-white/50">Loading clicks...</p>
                </div>
              ) : clicksData?.clicks.length === 0 ? (
                <div className="p-8 text-center">
                  <MousePointer className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50">No click activity yet</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#0F1123]">
                    <tr className="text-left text-xs text-white/40 border-b border-white/5">
                      <th className="px-4 py-3 font-medium">Contact</th>
                      <th className="px-4 py-3 font-medium">Link Type</th>
                      <th className="px-4 py-3 font-medium">Clicked At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clicksData?.clicks.map((click) => (
                      <tr key={click.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <p className="text-white text-sm">{click.email}</p>
                          {click.organization_name && (
                            <p className="text-white/40 text-xs flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {click.organization_name}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            click.link_type === 'cta_calendly' ? 'bg-blue-500/20 text-blue-400' :
                            click.link_type === 'unsubscribe' ? 'bg-orange-500/20 text-orange-400' :
                            click.link_type === 'logo' ? 'bg-purple-500/20 text-purple-400' :
                            click.link_type === 'unknown' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-white/10 text-white/50'
                          }`}>
                            {click.link_type === 'cta_calendly' ? 'Book a Call CTA' :
                             click.link_type === 'cta_website' ? 'Website CTA' :
                             click.link_type === 'unsubscribe' ? 'Unsubscribe' :
                             click.link_type === 'logo' ? 'Logo' :
                             click.link_type === 'unknown' ? 'Email Link' :
                             click.link_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/50 text-sm">
                          {formatDate(click.clicked_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminGate>
  );
}
