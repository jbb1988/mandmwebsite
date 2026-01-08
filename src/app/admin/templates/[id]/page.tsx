'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  ArrowLeft, Edit, Copy, Monitor, Smartphone, Eye,
  Send, TrendingUp, RefreshCw, Check, ExternalLink,
  Mail, Zap, Settings, AlertCircle, Tag
} from 'lucide-react';

// Card component
function Card({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-[#0F1123]/80 border border-white/[0.08] ${className}`}>
      {children}
    </div>
  );
}

// Category badge
function CategoryBadge({ category }: { category: string }) {
  const categoryStyles: Record<string, string> = {
    sequence: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    triggered: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    lifecycle: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    system: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  const icons: Record<string, typeof Mail> = {
    sequence: Mail,
    triggered: Zap,
    lifecycle: RefreshCw,
    system: Settings,
  };

  const Icon = icons[category] || Mail;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full border ${categoryStyles[category] || 'bg-white/10 text-white/60'}`}>
      <Icon className="w-4 h-4" />
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}

// Segment badge
function SegmentBadge({ segment }: { segment: string }) {
  const segmentStyles: Record<string, string> = {
    national_org: 'bg-purple-500/20 text-purple-400',
    travel_org: 'bg-blue-500/20 text-blue-400',
    facility: 'bg-emerald-500/20 text-emerald-400',
    influencer: 'bg-pink-500/20 text-pink-400',
  };

  const displayNames: Record<string, string> = {
    national_org: 'National Org',
    travel_org: 'Travel Team',
    facility: 'Facility',
    influencer: 'Influencer',
  };

  return (
    <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${segmentStyles[segment] || 'bg-white/10 text-white/60'}`}>
      {displayNames[segment] || segment.replace(/_/g, ' ')}
    </span>
  );
}

// Stat box
function StatBox({ value, label, icon: Icon }: { value: string | number; label: string; icon: typeof Send }) {
  return (
    <div className="text-center p-4 bg-white/[0.02] rounded-xl">
      <Icon className="w-5 h-5 text-white/40 mx-auto mb-2" />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/50">{label}</p>
    </div>
  );
}

interface Template {
  id: string;
  name: string;
  segment: string;
  sequence_step: number;
  subject_line: string;
  body_template: string;
  is_triggered: boolean;
  trigger_type: string | null;
  category: string;
  source: string;
  created_at: string;
  updated_at: string;
}

interface Stats {
  emails_sent: number;
  emails_opened: number;
  emails_clicked: number;
  open_rate: number;
  click_rate: number;
}

interface Campaign {
  id: string;
  name: string;
  segment: string;
}

interface Variable {
  key: string;
  found_count: number;
}

// Sample data for preview
const SAMPLE_DATA: Record<string, string> = {
  first_name: 'Coach',
  last_name: 'Johnson',
  organization_name: 'Elite Baseball Academy',
  company_name: 'Elite Baseball Academy',
  facility_name: 'Elite Training Center',
  logo_url: 'https://mindandmuscle.ai',
  cta_url: 'https://mindandmuscle.ai/download',
  calendly_link: 'https://calendly.com/mindandmuscle',
  unsubscribe_url: 'https://mindandmuscle.ai/unsubscribe',
  tracking_url_logo: 'https://mindandmuscle.ai',
  tracking_url_cta: 'https://mindandmuscle.ai/download',
  your_name: 'Alex',
  platform: 'Instagram',
  full_name: 'Coach Johnson',
  tier: 'Pro',
  trial_days_remaining: '3',
  features_used: '5',
  last_feature: 'Swing Lab',
  streak_count: '12',
  app_url: 'https://mindandmuscle.ai/download',
  partner_link: 'https://mindandmuscle.ai/partner',
  current_year: new Date().getFullYear().toString(),
};

export default function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [template, setTemplate] = useState<Template | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [sampleValues, setSampleValues] = useState<Record<string, string>>(SAMPLE_DATA);

  const { getPassword } = useAdminAuth();
  const router = useRouter();

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const password = getPassword();
      const response = await fetch(`/api/admin/templates/${resolvedParams.id}`, {
        headers: { 'X-Admin-Password': password },
      });
      const data = await response.json();
      if (data.success) {
        setTemplate(data.template);
        setStats(data.stats);
        setCampaigns(data.campaigns || []);
        setVariables(data.variables || []);
      }
    } catch (error) {
      console.error('Failed to fetch template:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, [resolvedParams.id]);

  // Render template with sample data
  const renderTemplate = () => {
    if (!template) return '';

    let html = template.body_template;

    Object.entries(sampleValues).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      html = html.replace(regex, value);
    });

    return html;
  };

  // Copy HTML to clipboard
  const copyHtml = async () => {
    if (!template) return;

    try {
      await navigator.clipboard.writeText(template.body_template);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="w-8 h-8 text-white/30 animate-spin" />
        </div>
      </AdminSidebar>
    );
  }

  if (!template) {
    return (
      <AdminSidebar>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">Template Not Found</h2>
          <p className="text-white/50 mb-4">The template you're looking for doesn't exist.</p>
          <Link
            href="/admin/templates"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </Link>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/templates"
              className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">
                {template.name || `${template.segment} - Step ${template.sequence_step}`}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <CategoryBadge category={template.category} />
                <SegmentBadge segment={template.segment} />
                {template.sequence_step > 0 && template.sequence_step < 100 && (
                  <span className="px-2 py-1 text-xs font-medium rounded-lg bg-white/10 text-white/60">
                    Step {template.sequence_step}
                  </span>
                )}
                {template.trigger_type && (
                  <span className="px-2 py-1 text-xs font-medium rounded-lg bg-orange-500/10 text-orange-300">
                    {template.trigger_type.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyHtml}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-white/70 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy HTML'}
            </button>
            {template.source === 'database' && template.category !== 'system' && (
              <Link
                href={`/admin/templates/${template.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Template
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Preview Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subject Line */}
            <Card className="p-4">
              <div className="text-white/40 text-sm mb-1">Subject Line</div>
              <div className="text-white font-medium text-lg">
                {template.subject_line.replace(/\{\{(\w+)\}\}/g, (_, key) => sampleValues[key] || `{{${key}}}`)}
              </div>
            </Card>

            {/* Device Toggle */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Preview Mode</span>
                <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
                  <button
                    onClick={() => setDeviceMode('desktop')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                      deviceMode === 'desktop' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    Desktop
                  </button>
                  <button
                    onClick={() => setDeviceMode('mobile')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                      deviceMode === 'mobile' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    Mobile
                  </button>
                </div>
              </div>
            </Card>

            {/* Email Preview */}
            <Card className="overflow-hidden">
              <div className="bg-[#1a1b2e] px-4 py-2 border-b border-white/10 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-sm text-white/40">Email Preview</span>
              </div>
              <div
                className={`bg-white overflow-auto ${
                  deviceMode === 'mobile' ? 'max-w-[375px] mx-auto' : ''
                }`}
                style={{ maxHeight: '700px' }}
              >
                <iframe
                  srcDoc={renderTemplate()}
                  className={`border-0 ${deviceMode === 'mobile' ? 'w-[375px]' : 'w-full'}`}
                  style={{ height: '700px' }}
                  title="Email Preview"
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Analytics */}
            {stats && (
              <Card className="p-4">
                <h3 className="text-white font-semibold mb-4">Analytics</h3>
                <div className="grid grid-cols-3 gap-3">
                  <StatBox value={stats.emails_sent} label="Sent" icon={Send} />
                  <StatBox value={`${stats.open_rate}%`} label="Open Rate" icon={Eye} />
                  <StatBox value={`${stats.click_rate}%`} label="Click Rate" icon={TrendingUp} />
                </div>
              </Card>
            )}

            {/* Variables */}
            {variables.length > 0 && (
              <Card className="p-4">
                <h3 className="text-white font-semibold mb-4">Template Variables</h3>
                <div className="space-y-2">
                  {variables.map((v) => (
                    <div key={v.key} className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
                      <div>
                        <code className="text-cyan-400 text-sm">{`{{${v.key}}}`}</code>
                        <input
                          type="text"
                          value={sampleValues[v.key] || ''}
                          onChange={(e) => setSampleValues(prev => ({ ...prev, [v.key]: e.target.value }))}
                          className="block w-full mt-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white placeholder:text-white/30"
                          placeholder="Sample value"
                        />
                      </div>
                      <span className="text-white/30 text-xs">{v.found_count}x</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Used In Campaigns */}
            {campaigns.length > 0 && (
              <Card className="p-4">
                <h3 className="text-white font-semibold mb-4">Used in Campaigns</h3>
                <div className="space-y-2">
                  {campaigns.map((campaign) => (
                    <Link
                      key={campaign.id}
                      href={`/admin/campaigns`}
                      className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg transition-colors group"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">{campaign.name}</p>
                        <p className="text-white/40 text-xs capitalize">{campaign.segment.replace(/_/g, ' ')}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60" />
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* Template Info */}
            <Card className="p-4">
              <h3 className="text-white font-semibold mb-4">Template Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">Source</span>
                  <span className="text-white capitalize">{template.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Created</span>
                  <span className="text-white">
                    {new Date(template.created_at).toLocaleDateString()}
                  </span>
                </div>
                {template.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-white/40">Updated</span>
                    <span className="text-white">
                      {new Date(template.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {template.trigger_type && (
                  <div className="flex justify-between">
                    <span className="text-white/40">Trigger</span>
                    <span className="text-orange-400 capitalize">
                      {template.trigger_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
