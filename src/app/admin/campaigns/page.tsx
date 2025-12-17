'use client';

import { useEffect, useState } from 'react';
import AdminGate from '@/components/AdminGate';
import AdminNav from '@/components/AdminNav';
import {
  Mail, BarChart3, Users, Clock, Send, Eye, MousePointer,
  MessageSquare, ChevronDown, ChevronUp, ExternalLink, AlertCircle,
  CheckCircle2, XCircle, RefreshCw
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

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [upcomingSends, setUpcomingSends] = useState<UpcomingSend[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/campaigns', {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.campaigns || []);
        setSummary(data.summary || null);
        setUpcomingSends(data.upcomingSends || []);
      } else {
        setError(data.message || 'Failed to fetch campaigns');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
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

            <AdminNav />

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
                        <th className="px-4 py-3 font-medium text-right">Sent</th>
                        <th className="px-4 py-3 font-medium text-right">Open %</th>
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
                              {campaign.emails_sent}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className={`text-sm font-medium ${
                                campaign.open_rate >= 25 ? 'text-emerald-400' :
                                campaign.open_rate >= 15 ? 'text-yellow-400' :
                                campaign.open_rate > 0 ? 'text-orange-400' : 'text-white/40'
                              }`}>
                                {campaign.open_rate}%
                              </span>
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
              <div className="grid md:grid-cols-3 gap-3">
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
                  href="https://us2.make.com/organization/1299298/scenarios"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors border border-white/[0.05] hover:border-white/10"
                >
                  <RefreshCw className="w-4 h-4 text-blue-400" />
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
    </AdminGate>
  );
}
