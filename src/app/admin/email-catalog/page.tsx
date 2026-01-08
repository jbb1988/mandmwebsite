'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  Mail, RefreshCw, Search, Filter, CheckCircle, XCircle,
  ChevronDown, ChevronUp, ExternalLink, Clock, Zap,
  Users, Settings, Gift, Calendar, Code
} from 'lucide-react';
import {
  emailCatalog,
  categoryConfig,
  frequencyConfig,
  getPersonalizationStats,
  type EmailCategory,
  type EmailDefinition,
} from '@/config/emailCatalog';

// Card component
function Card({ children, className = '', variant = 'default' }: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
}) {
  const baseClasses = 'rounded-2xl transition-all duration-200';
  const variantClasses = {
    default: 'bg-[#0F1123]/80 border border-white/[0.08]',
    elevated: 'bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] shadow-xl',
    bordered: 'bg-[#0A0B14]/60 border-2 border-white/[0.1]',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
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

// Category badge
function CategoryBadge({ category }: { category: EmailCategory }) {
  const config = categoryConfig[category];
  const categoryIcons: Record<EmailCategory, typeof Mail> = {
    lifecycle: RefreshCw,
    engagement: Zap,
    team: Users,
    admin: Settings,
    campaign: Gift,
    seasonal: Calendar,
  };
  const Icon = categoryIcons[category];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg ${config.bgColor} ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Frequency badge
function FrequencyBadge({ frequency }: { frequency: string }) {
  const config = frequencyConfig[frequency as keyof typeof frequencyConfig];
  if (!config) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-white/5 text-white/50">
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}

// Personalization indicator
function PersonalizationBadge({ isPersonalized }: { isPersonalized: boolean }) {
  return isPersonalized ? (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
      <CheckCircle className="w-3.5 h-3.5" />
      Personalized
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-white/40">
      <XCircle className="w-3.5 h-3.5" />
      Not Personalized
    </span>
  );
}

// Email detail card
function EmailCard({ email, isExpanded, onToggle }: {
  email: EmailDefinition;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between p-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <CategoryBadge category={email.category} />
            <FrequencyBadge frequency={email.frequency} />
            <PersonalizationBadge isPersonalized={email.isPersonalized} />
          </div>
          <h3 className="text-white font-medium mb-1">{email.name}</h3>
          <p className="text-white/50 text-sm line-clamp-1">{email.trigger}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-white/40" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/40" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/[0.05]">
          <div className="pt-4">
            <p className="text-white/70 text-sm leading-relaxed">{email.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-white/40 uppercase tracking-wide">Subject Line</p>
              <p className="text-sm text-white/80 font-mono bg-white/5 px-3 py-2 rounded-lg">
                {email.subjectTemplate}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-white/40 uppercase tracking-wide">From Address</p>
              <p className="text-sm text-white/80 font-mono bg-white/5 px-3 py-2 rounded-lg">
                {email.fromAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Code className="w-4 h-4 text-white/30" />
            <span className="text-xs text-white/40">Edge Function:</span>
            <code className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">
              {email.edgeFunctionName}
            </code>
          </div>
        </div>
      )}
    </Card>
  );
}

// Category section
function CategorySection({
  category,
  emails,
  isExpanded,
  onToggle,
  expandedEmails,
  onToggleEmail,
}: {
  category: EmailCategory;
  emails: EmailDefinition[];
  isExpanded: boolean;
  onToggle: () => void;
  expandedEmails: Set<string>;
  onToggleEmail: (id: string) => void;
}) {
  const config = categoryConfig[category];
  const categoryIcons: Record<EmailCategory, typeof Mail> = {
    lifecycle: RefreshCw,
    engagement: Zap,
    team: Users,
    admin: Settings,
    campaign: Gift,
    seasonal: Calendar,
  };
  const categoryColors: Record<EmailCategory, string> = {
    lifecycle: 'bg-blue-500/20',
    engagement: 'bg-green-500/20',
    team: 'bg-purple-500/20',
    admin: 'bg-gray-500/20',
    campaign: 'bg-orange-500/20',
    seasonal: 'bg-pink-500/20',
  };
  const categoryIconColors: Record<EmailCategory, string> = {
    lifecycle: 'text-blue-400',
    engagement: 'text-green-400',
    team: 'text-purple-400',
    admin: 'text-gray-400',
    campaign: 'text-orange-400',
    seasonal: 'text-pink-400',
  };
  const Icon = categoryIcons[category];

  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${categoryColors[category]} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${categoryIconColors[category]}`} />
          </div>
          <div className="text-left">
            <h2 className="text-white font-semibold">{config.label} Emails</h2>
            <p className="text-white/40 text-sm">{emails.length} emails</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-white/40" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white/40" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-3">
          {emails.map(email => (
            <EmailCard
              key={email.id}
              email={email}
              isExpanded={expandedEmails.has(email.id)}
              onToggle={() => onToggleEmail(email.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export default function EmailCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EmailCategory | 'all'>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<EmailCategory>>(
    new Set(['lifecycle', 'engagement'])
  );
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());

  const stats = getPersonalizationStats();

  // Filter emails
  const filteredEmails = emailCatalog.filter(email => {
    if (categoryFilter !== 'all' && email.category !== categoryFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        email.name.toLowerCase().includes(query) ||
        email.description.toLowerCase().includes(query) ||
        email.trigger.toLowerCase().includes(query) ||
        email.edgeFunctionName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Group by category
  const groupedEmails: Record<EmailCategory, EmailDefinition[]> = {
    lifecycle: filteredEmails.filter(e => e.category === 'lifecycle'),
    engagement: filteredEmails.filter(e => e.category === 'engagement'),
    team: filteredEmails.filter(e => e.category === 'team'),
    admin: filteredEmails.filter(e => e.category === 'admin'),
    campaign: filteredEmails.filter(e => e.category === 'campaign'),
    seasonal: filteredEmails.filter(e => e.category === 'seasonal'),
  };

  const toggleCategory = (category: EmailCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const toggleEmail = (id: string) => {
    setExpandedEmails(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allCategories: EmailCategory[] = ['lifecycle', 'engagement', 'team', 'admin', 'campaign', 'seasonal'];

  return (
    <AdminSidebar>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Email Catalog</h1>
          <p className="text-white/50 text-sm mt-1">
            Complete reference of all automated system emails
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            value={stats.total}
            label="Total Emails"
            icon={Mail}
            color="white"
          />
          <StatCard
            value={stats.personalized}
            label="Personalized"
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            value={`${stats.percentage}%`}
            label="Personalization Rate"
            icon={Zap}
            color="cyan"
          />
          <StatCard
            value={stats.notPersonalized}
            label="Not Personalized"
            icon={XCircle}
            color="orange"
          />
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search emails..."
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
                onChange={(e) => setCategoryFilter(e.target.value as EmailCategory | 'all')}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20"
              >
                <option value="all">All Categories</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{categoryConfig[cat].label}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Email Categories */}
        <div className="space-y-4">
          {allCategories.map(category => {
            const emails = groupedEmails[category];
            if (emails.length === 0) return null;

            return (
              <CategorySection
                key={category}
                category={category}
                emails={emails}
                isExpanded={expandedCategories.has(category)}
                onToggle={() => toggleCategory(category)}
                expandedEmails={expandedEmails}
                onToggleEmail={toggleEmail}
              />
            );
          })}

          {/* Empty State */}
          {filteredEmails.length === 0 && (
            <Card className="p-12 text-center">
              <Mail className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-white/60 font-medium mb-2">No emails found</h3>
              <p className="text-white/40 text-sm">
                Try adjusting your search or filter criteria
              </p>
            </Card>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-white/40 mt-0.5" />
            <div>
              <p className="text-white/60 text-sm">
                This is a view-only reference catalog. To modify email templates, edit the corresponding
                Edge Function in <code className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded text-xs">supabase/functions/</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
