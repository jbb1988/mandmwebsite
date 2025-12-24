'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Mail,
  Send,
  Play,
  Pause,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  Zap,
  X,
  Gift,
  UserPlus,
  Handshake,
  Calendar,
  BarChart3,
} from 'lucide-react';

interface CampaignStats {
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  campaign_type: string;
  trigger_type: string;
  trigger_days: number | null;
  subject_line: string;
  preview_text: string;
  body_template: string;
  include_partner_mention: boolean;
  sequence_step: number;
  sequence_total: number;
  is_active: boolean;
  created_at: string;
  stats: CampaignStats;
}

interface CampaignRun {
  id: string;
  campaign_id: string;
  triggered_by: string;
  audience_count: number;
  sent_count: number;
  failed_count: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  campaign: {
    name: string;
    campaign_type: string;
  };
}

interface Overview {
  totalCampaigns: number;
  activeCampaigns: number;
  emailsSent7d: number;
  emailsSent30d: number;
  openRate7d: number;
  partnerPromos30d: number;
}

const CAMPAIGN_TYPE_CONFIG: Record<string, { icon: typeof Mail; color: string; label: string }> = {
  onboarding: { icon: UserPlus, color: 'cyan', label: 'Onboarding' },
  trial_conversion: { icon: Gift, color: 'purple', label: 'Trial Conversion' },
  trial_expiring: { icon: AlertTriangle, color: 'orange', label: 'Trial Expiring' },
  reengagement: { icon: RefreshCw, color: 'blue', label: 'Re-engagement' },
  winback: { icon: Users, color: 'red', label: 'Win-back' },
  upgrade_nudge: { icon: TrendingUp, color: 'emerald', label: 'Upgrade Nudge' },
  partner_promo: { icon: Handshake, color: 'amber', label: 'Partner Promo' },
  custom: { icon: Mail, color: 'gray', label: 'Custom' },
};

export default function LifecycleCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [recentRuns, setRecentRuns] = useState<CampaignRun[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedType, setExpandedType] = useState<string | null>('onboarding');
  const [previewCampaign, setPreviewCampaign] = useState<{ subject: string; body: string } | null>(null);
  const [sendingCampaign, setSendingCampaign] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { getPassword } = useAdminAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const password = getPassword();
      const response = await fetch('/api/admin/lifecycle-campaigns', {
        headers: { 'X-Admin-Password': password },
      });
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
        setRecentRuns(data.recentRuns || []);
        setOverview(data.overview || null);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleCampaign = async (campaignId: string) => {
    try {
      const password = getPassword();
      await fetch('/api/admin/lifecycle-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({ action: 'toggle', campaign_id: campaignId }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to toggle campaign:', error);
    }
  };

  const previewEmail = async (campaignId: string) => {
    try {
      const password = getPassword();
      const response = await fetch('/api/admin/lifecycle-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({ action: 'preview', campaign_id: campaignId }),
      });
      const data = await response.json();
      if (data.success) {
        setPreviewCampaign(data.preview);
      }
    } catch (error) {
      console.error('Failed to preview:', error);
    }
  };

  const sendCampaign = async (campaignId: string, dryRun = false) => {
    setSendingCampaign(campaignId);
    try {
      const password = getPassword();
      const response = await fetch('/api/admin/lifecycle-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({
          action: 'send',
          campaign_id: campaignId,
          dry_run: dryRun,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`${dryRun ? 'Dry run' : 'Campaign sent'}: ${data.sent} emails sent, ${data.skipped} skipped`);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to send campaign:', error);
    } finally {
      setSendingCampaign(null);
    }
  };

  // Group campaigns by type
  const campaignsByType = campaigns.reduce((acc, campaign) => {
    if (!acc[campaign.campaign_type]) {
      acc[campaign.campaign_type] = [];
    }
    acc[campaign.campaign_type].push(campaign);
    return acc;
  }, {} as Record<string, Campaign[]>);

  const getCampaignTypeConfig = (type: string) => {
    return CAMPAIGN_TYPE_CONFIG[type] || CAMPAIGN_TYPE_CONFIG.custom;
  };

  return (
    <AdminSidebar>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
                <Mail className="w-6 h-6 text-white" />
              </div>
              Lifecycle Campaigns
            </h1>
            <p className="text-white/50 mt-1">
              Automated email sequences for user retention & growth
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                showHistory ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              History
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-white/70 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-[#0F1123] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/50 mb-1">Active Campaigns</p>
              <p className="text-2xl font-bold text-white">{overview.activeCampaigns}</p>
              <p className="text-xs text-white/30">of {overview.totalCampaigns}</p>
            </div>
            <div className="bg-[#0F1123] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/50 mb-1">Sent (7d)</p>
              <p className="text-2xl font-bold text-cyan-400">{overview.emailsSent7d}</p>
            </div>
            <div className="bg-[#0F1123] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/50 mb-1">Sent (30d)</p>
              <p className="text-2xl font-bold text-white">{overview.emailsSent30d}</p>
            </div>
            <div className="bg-[#0F1123] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/50 mb-1">Open Rate (7d)</p>
              <p className="text-2xl font-bold text-emerald-400">{overview.openRate7d}%</p>
            </div>
            <div className="bg-[#0F1123] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-white/50 mb-1">Partner Promos</p>
              <p className="text-2xl font-bold text-orange-400">{overview.partnerPromos30d}</p>
              <p className="text-xs text-white/30">last 30 days</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-900/30 to-[#0F1123] border border-emerald-500/30 rounded-xl p-4">
              <p className="text-xs text-emerald-400 mb-1">Status</p>
              <p className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Running
              </p>
            </div>
          </div>
        )}

        {loading && !campaigns.length ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 text-white/30 animate-spin" />
          </div>
        ) : showHistory ? (
          /* Campaign Run History */
          <div className="bg-[#0F1123] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Campaign History</h2>
              <p className="text-xs text-white/40">Recent campaign sends</p>
            </div>
            <div className="divide-y divide-white/5">
              {recentRuns.length === 0 ? (
                <div className="p-8 text-center text-white/40">
                  No campaign runs yet
                </div>
              ) : (
                recentRuns.map((run) => (
                  <div key={run.id} className="p-4 flex items-center justify-between hover:bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        run.status === 'completed' ? 'bg-emerald-500/20' :
                        run.status === 'failed' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                      }`}>
                        {run.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : run.status === 'failed' ? (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{run.campaign?.name}</p>
                        <p className="text-xs text-white/40">
                          {run.triggered_by} • {new Date(run.started_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-white font-medium">{run.audience_count}</p>
                        <p className="text-xs text-white/40">audience</p>
                      </div>
                      <div className="text-center">
                        <p className="text-emerald-400 font-medium">{run.sent_count}</p>
                        <p className="text-xs text-white/40">sent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-red-400 font-medium">{run.failed_count}</p>
                        <p className="text-xs text-white/40">failed</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Campaign List by Type */
          <div className="space-y-4">
            {Object.entries(campaignsByType).map(([type, typeCampaigns]) => {
              const config = getCampaignTypeConfig(type);
              const Icon = config.icon;
              const isExpanded = expandedType === type;

              return (
                <div key={type} className="bg-[#0F1123] border border-white/10 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedType(isExpanded ? null : type)}
                    className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-${config.color}-500/20 rounded-xl`}>
                        <Icon className={`w-5 h-5 text-${config.color}-400`} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-white">{config.label}</h3>
                        <p className="text-xs text-white/40">
                          {typeCampaigns.length} campaign{typeCampaigns.length !== 1 ? 's' : ''} •{' '}
                          {typeCampaigns.filter(c => c.is_active).length} active
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4">
                        <p className="text-sm text-white">
                          {typeCampaigns.reduce((sum, c) => sum + c.stats.sent, 0)} sent
                        </p>
                        <p className="text-xs text-white/40">
                          {Math.round(typeCampaigns.reduce((sum, c) => sum + c.stats.openRate, 0) / typeCampaigns.length || 0)}% avg open
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-white/40" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-white/10">
                      {typeCampaigns
                        .sort((a, b) => a.sequence_step - b.sequence_step)
                        .map((campaign) => (
                          <div
                            key={campaign.id}
                            className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`w-2 h-2 rounded-full ${
                                    campaign.is_active ? 'bg-emerald-400' : 'bg-white/30'
                                  }`} />
                                  <h4 className="text-sm font-medium text-white truncate">
                                    {campaign.name}
                                  </h4>
                                  {campaign.sequence_total > 1 && (
                                    <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-white/50">
                                      Step {campaign.sequence_step}/{campaign.sequence_total}
                                    </span>
                                  )}
                                  {campaign.include_partner_mention && (
                                    <span className="text-xs px-2 py-0.5 bg-orange-500/20 rounded-full text-orange-400">
                                      Partner
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-white/50 mb-2 truncate">
                                  {campaign.subject_line}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-white/40">
                                  <span>
                                    Trigger: {campaign.trigger_type}
                                    {campaign.trigger_days !== null && ` (${campaign.trigger_days > 0 ? '+' : ''}${campaign.trigger_days}d)`}
                                  </span>
                                  <span>•</span>
                                  <span>{campaign.stats.sent} sent</span>
                                  <span>•</span>
                                  <span>{campaign.stats.openRate}% open</span>
                                  <span>•</span>
                                  <span>{campaign.stats.clickRate}% click</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => previewEmail(campaign.id)}
                                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                  title="Preview"
                                >
                                  <Eye className="w-4 h-4 text-white/50" />
                                </button>
                                <button
                                  onClick={() => toggleCampaign(campaign.id)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    campaign.is_active
                                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30'
                                      : 'bg-white/10 hover:bg-white/20'
                                  }`}
                                  title={campaign.is_active ? 'Pause' : 'Activate'}
                                >
                                  {campaign.is_active ? (
                                    <Pause className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Play className="w-4 h-4 text-white/50" />
                                  )}
                                </button>
                                <button
                                  onClick={() => sendCampaign(campaign.id)}
                                  disabled={sendingCampaign === campaign.id}
                                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                                  title="Send Now"
                                >
                                  {sendingCampaign === campaign.id ? (
                                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                                  ) : (
                                    <Send className="w-4 h-4 text-blue-400" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Email Preview Modal */}
        {previewCampaign && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0F1123] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-semibold text-white">Email Preview</h3>
                  <p className="text-sm text-white/50">{previewCampaign.subject}</p>
                </div>
                <button
                  onClick={() => setPreviewCampaign(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-gray-100">
                <div
                  className="max-w-[600px] mx-auto"
                  dangerouslySetInnerHTML={{ __html: previewCampaign.body }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
}
