'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  FileText, Mail, Zap, Settings, RefreshCw, Search,
  ChevronDown, ChevronUp, Eye, Edit, Copy, Send,
  TrendingUp, AlertTriangle, Users, Building2, Star,
  Inbox, Clock, Filter
} from 'lucide-react';

// Card component
function Card({ children, className = '', variant = 'default', onClick }: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
  onClick?: () => void;
}) {
  const baseClasses = 'rounded-2xl transition-all duration-200';
  const variantClasses = {
    default: 'bg-[#0F1123]/80 border border-white/[0.08]',
    elevated: 'bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] shadow-xl',
    bordered: 'bg-[#0A0B14]/60 border-2 border-white/[0.1]',
  };
  const clickableClass = onClick ? 'cursor-pointer hover:border-white/20 hover:shadow-lg' : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Stat card
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

// Segment badge
function SegmentBadge({ segment }: { segment: string }) {
  const segmentStyles: Record<string, string> = {
    national_org: 'bg-purple-500/20 text-purple-400',
    travel_org: 'bg-blue-500/20 text-blue-400',
    facility: 'bg-emerald-500/20 text-emerald-400',
    influencer: 'bg-pink-500/20 text-pink-400',
    equipment: 'bg-orange-500/20 text-orange-400',
    tech: 'bg-cyan-500/20 text-cyan-400',
    youth_dev: 'bg-yellow-500/20 text-yellow-400',
    user: 'bg-white/20 text-white',
    onboarding: 'bg-cyan-500/20 text-cyan-400',
    trial_conversion: 'bg-purple-500/20 text-purple-400',
    trial_expiring: 'bg-orange-500/20 text-orange-400',
    reengagement: 'bg-blue-500/20 text-blue-400',
    winback: 'bg-red-500/20 text-red-400',
    upgrade_nudge: 'bg-emerald-500/20 text-emerald-400',
    partner_promo: 'bg-amber-500/20 text-amber-400',
  };

  const displayNames: Record<string, string> = {
    national_org: 'National Org',
    travel_org: 'Travel Team',
    facility: 'Facility',
    influencer: 'Influencer',
    equipment: 'Equipment',
    tech: 'Tech',
    youth_dev: 'Youth Dev',
    user: 'User',
    onboarding: 'Onboarding',
    trial_conversion: 'Trial Conversion',
    trial_expiring: 'Trial Expiring',
    reengagement: 'Re-engagement',
    winback: 'Win-back',
    upgrade_nudge: 'Upgrade',
    partner_promo: 'Partner Promo',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${segmentStyles[segment] || 'bg-white/10 text-white/60'}`}>
      {displayNames[segment] || segment.replace(/_/g, ' ')}
    </span>
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

  const Icon = icons[category] || FileText;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${categoryStyles[category] || 'bg-white/10 text-white/60'}`}>
      <Icon className="w-3 h-3" />
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}

// Trigger type badge
function TriggerBadge({ triggerType }: { triggerType: string }) {
  const triggerLabels: Record<string, string> = {
    clicked_no_booking: 'No Booking (24h)',
    multiple_opens: 'Hot Lead (4h)',
    clicked_went_quiet: 'Went Quiet (48h)',
  };

  return (
    <span className="px-2 py-1 text-xs font-medium rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/20">
      {triggerLabels[triggerType] || triggerType}
    </span>
  );
}

interface TemplateStats {
  emails_sent: number;
  emails_opened: number;
  emails_clicked: number;
  open_rate: number;
  click_rate: number;
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
  created_at: string;
  updated_at: string;
  category: 'sequence' | 'triggered' | 'lifecycle' | 'system';
  source: 'database' | 'file';
  stats?: TemplateStats;
}

interface Summary {
  total: number;
  byCategory: Record<string, number>;
  bySegment: Record<string, number>;
}

// Template card component
function TemplateCard({ template, onClick }: { template: Template; onClick: () => void }) {
  return (
    <Card
      variant="default"
      className="p-4 hover:bg-white/[0.02]"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <CategoryBadge category={template.category} />
          <SegmentBadge segment={template.segment} />
        </div>
        {template.sequence_step > 0 && template.sequence_step < 100 && (
          <span className="text-xs text-white/40">Step {template.sequence_step}</span>
        )}
      </div>

      <h3 className="text-white font-medium mb-1 line-clamp-1">
        {template.name || `${template.segment} - Step ${template.sequence_step}`}
      </h3>

      <p className="text-white/50 text-sm mb-3 line-clamp-1">
        {template.subject_line.replace(/\{\{.*?\}\}/g, '[...]')}
      </p>

      {template.trigger_type && (
        <div className="mb-3">
          <TriggerBadge triggerType={template.trigger_type} />
        </div>
      )}

      {template.stats && (
        <div className="flex items-center gap-4 text-xs text-white/40 border-t border-white/[0.05] pt-3 mt-3">
          <span className="flex items-center gap-1">
            <Send className="w-3 h-3" />
            {template.stats.emails_sent} sent
          </span>
          {template.stats.open_rate > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {template.stats.open_rate}% open
            </span>
          )}
          {template.stats.click_rate > 0 && (
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {template.stats.click_rate}% click
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sequence: true,
    triggered: true,
    lifecycle: false,
    system: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');

  const { getPassword } = useAdminAuth();
  const router = useRouter();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const password = getPassword();
      const response = await fetch('/api/admin/templates?includeStats=true', {
        headers: { 'X-Admin-Password': password },
      });
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates || []);
        setSummary(data.summary || null);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter templates
  const filteredTemplates = templates.filter(t => {
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (segmentFilter !== 'all' && t.segment !== segmentFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        t.name?.toLowerCase().includes(query) ||
        t.subject_line?.toLowerCase().includes(query) ||
        t.segment?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Group templates by category
  const groupedTemplates: Record<string, Template[]> = {
    sequence: filteredTemplates.filter(t => t.category === 'sequence'),
    triggered: filteredTemplates.filter(t => t.category === 'triggered'),
    lifecycle: filteredTemplates.filter(t => t.category === 'lifecycle'),
    system: filteredTemplates.filter(t => t.category === 'system'),
  };

  // Group sequence templates by segment
  const sequenceBySegment = groupedTemplates.sequence.reduce((acc, t) => {
    if (!acc[t.segment]) acc[t.segment] = [];
    acc[t.segment].push(t);
    return acc;
  }, {} as Record<string, Template[]>);

  // Group triggered templates by trigger type
  const triggeredByType = groupedTemplates.triggered.reduce((acc, t) => {
    const type = t.trigger_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(t);
    return acc;
  }, {} as Record<string, Template[]>);

  // Get unique segments for filter
  const allSegments = [...new Set(templates.map(t => t.segment))];

  const handleTemplateClick = (template: Template) => {
    router.push(`/admin/templates/${template.id}`);
  };

  const triggerLabels: Record<string, string> = {
    clicked_no_booking: 'Clicked but No Booking (24h)',
    multiple_opens: 'Multiple Opens / Hot Lead (4h)',
    clicked_went_quiet: 'Clicked then Went Quiet (48h)',
  };

  return (
    <AdminSidebar>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Email Templates</h1>
            <p className="text-white/50 text-sm mt-1">
              Manage all email templates across campaigns and automations
            </p>
          </div>
          <button
            onClick={fetchTemplates}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-white/70 hover:text-white transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              value={summary.total}
              label="Total Templates"
              icon={FileText}
              color="white"
            />
            <StatCard
              value={summary.byCategory.sequence || 0}
              label="Sequence Templates"
              icon={Mail}
              color="blue"
            />
            <StatCard
              value={summary.byCategory.triggered || 0}
              label="Triggered Templates"
              icon={Zap}
              color="orange"
            />
            <StatCard
              value={summary.byCategory.lifecycle + summary.byCategory.system || 0}
              label="System & Lifecycle"
              icon={Settings}
              color="purple"
            />
          </div>
        )}

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/30" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20"
              >
                <option value="all">All Categories</option>
                <option value="sequence">Sequence</option>
                <option value="triggered">Triggered</option>
                <option value="lifecycle">Lifecycle</option>
                <option value="system">System</option>
              </select>
            </div>

            {/* Segment Filter */}
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20"
            >
              <option value="all">All Segments</option>
              {allSegments.map(seg => (
                <option key={seg} value={seg}>{seg.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-white/30 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sequence Templates Section */}
            <Card className="overflow-hidden">
              <button
                onClick={() => toggleSection('sequence')}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-white font-semibold">Campaign Sequence Templates</h2>
                    <p className="text-white/40 text-sm">{groupedTemplates.sequence.length} templates across {Object.keys(sequenceBySegment).length} segments</p>
                  </div>
                </div>
                {expandedSections.sequence ? (
                  <ChevronUp className="w-5 h-5 text-white/40" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/40" />
                )}
              </button>

              {expandedSections.sequence && (
                <div className="p-4 pt-0 space-y-6">
                  {Object.entries(sequenceBySegment).map(([segment, segTemplates]) => (
                    <div key={segment}>
                      <div className="flex items-center gap-2 mb-3">
                        <SegmentBadge segment={segment} />
                        <span className="text-white/40 text-sm">({segTemplates.length} steps)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {segTemplates.sort((a, b) => a.sequence_step - b.sequence_step).map(template => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            onClick={() => handleTemplateClick(template)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Triggered Templates Section */}
            <Card className="overflow-hidden">
              <button
                onClick={() => toggleSection('triggered')}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-white font-semibold">Triggered / Behavioral Templates</h2>
                    <p className="text-white/40 text-sm">{groupedTemplates.triggered.length} templates for warm lead follow-ups</p>
                  </div>
                </div>
                {expandedSections.triggered ? (
                  <ChevronUp className="w-5 h-5 text-white/40" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/40" />
                )}
              </button>

              {expandedSections.triggered && (
                <div className="p-4 pt-0 space-y-6">
                  {Object.entries(triggeredByType).map(([triggerType, triggerTemplates]) => (
                    <div key={triggerType}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-orange-400 font-medium">
                          {triggerLabels[triggerType] || triggerType}
                        </span>
                        <span className="text-white/40 text-sm">({triggerTemplates.length} segments)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {triggerTemplates.map(template => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            onClick={() => handleTemplateClick(template)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Lifecycle Templates Section */}
            {groupedTemplates.lifecycle.length > 0 && (
              <Card className="overflow-hidden">
                <button
                  onClick={() => toggleSection('lifecycle')}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-white font-semibold">Lifecycle Campaign Templates</h2>
                      <p className="text-white/40 text-sm">{groupedTemplates.lifecycle.length} automated user journey emails</p>
                    </div>
                  </div>
                  {expandedSections.lifecycle ? (
                    <ChevronUp className="w-5 h-5 text-white/40" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/40" />
                  )}
                </button>

                {expandedSections.lifecycle && (
                  <div className="p-4 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {groupedTemplates.lifecycle.map(template => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onClick={() => handleTemplateClick(template)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* System Templates Section */}
            {groupedTemplates.system.length > 0 && (
              <Card className="overflow-hidden">
                <button
                  onClick={() => toggleSection('system')}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-white font-semibold">System / Transactional Templates</h2>
                      <p className="text-white/40 text-sm">{groupedTemplates.system.length} file-based templates for app communications</p>
                    </div>
                  </div>
                  {expandedSections.system ? (
                    <ChevronUp className="w-5 h-5 text-white/40" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/40" />
                  )}
                </button>

                {expandedSections.system && (
                  <div className="p-4 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {groupedTemplates.system.map(template => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onClick={() => handleTemplateClick(template)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Empty State */}
            {filteredTemplates.length === 0 && (
              <Card className="p-12 text-center">
                <Inbox className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-white/60 font-medium mb-2">No templates found</h3>
                <p className="text-white/40 text-sm">
                  Try adjusting your search or filter criteria
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminSidebar>
  );
}
