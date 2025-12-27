'use client';

import { useEffect, useState } from 'react';
import AdminGate from '@/components/AdminGate';
import RevenueDashboard from '@/components/admin/RevenueDashboard';
import Link from 'next/link';
import {
  DollarSign, Users, Image, Facebook, Settings,
  ExternalLink, Shield, FileText, Mic,
  Twitter, Handshake, TrendingUp, Target, BarChart3
} from 'lucide-react';

// Card component matching FB Outreach styling
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
function StatCard({ value, label, icon: Icon, color = 'white', href }: {
  value: number | string;
  label: string;
  icon?: typeof DollarSign;
  color?: string;
  href?: string;
}) {
  const colorClasses: Record<string, string> = {
    white: 'text-white',
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
  };

  const content = (
    <div className="text-center">
      {Icon && <Icon className={`w-5 h-5 ${colorClasses[color]} mx-auto mb-2`} />}
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
      <p className="text-xs text-white/50 mt-1">{label}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        <Card variant="elevated" className="p-4 hover:scale-[1.02] hover:border-white/20 transition-all cursor-pointer">
          {content}
        </Card>
      </Link>
    );
  }

  return (
    <Card variant="elevated" className="p-4">
      {content}
    </Card>
  );
}

interface AdminTool {
  name: string;
  description: string;
  href: string;
  icon: typeof DollarSign;
  color: string;
}

const ADMIN_TOOLS: AdminTool[] = [
  {
    name: 'Daily Hit Builder',
    description: 'Create and manage Daily Hit content',
    href: '/admin/daily-hit-builder',
    icon: Mic,
    color: 'orange',
  },
  {
    name: 'Outreach CRM',
    description: 'Unified sales pipeline for all contacts',
    href: '/admin/outreach-crm',
    icon: Target,
    color: 'cyan',
  },
  {
    name: 'Feature Analytics',
    description: 'Track feature usage and health scores',
    href: '/admin/feature-analytics',
    icon: BarChart3,
    color: 'purple',
  },
  {
    name: 'User Management',
    description: 'Manage users, trials, and subscriptions',
    href: '/admin/users',
    icon: Users,
    color: 'blue',
  },
  {
    name: 'Partner Management',
    description: 'Manage affiliates and sync with Tolt',
    href: '/admin/partners',
    icon: Handshake,
    color: 'green',
  },
];

const QUICK_LINKS = [
  {
    name: 'Partner Dashboard',
    href: '/partner/dashboard',
    description: 'Partner portal (view as partner)',
  },
  {
    name: 'Partner Program',
    href: '/partner-program',
    description: 'Public partner signup page',
  },
  {
    name: 'Finder Fee Page',
    href: '/finder-fee',
    description: 'Standard finder fee (pw: fastball)',
  },
  {
    name: 'Finder Fee VIP',
    href: '/finder-fee-vip',
    description: 'VIP recurring (pw: dominate)',
  },
  {
    name: 'Team Licensing',
    href: '/team-licensing',
    description: 'Team purchase page',
  },
];

interface Stats {
  fbGroups: number;
  xTargets: number;
  activePartners: number;
  weekOutreach: number;
}

const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

export default function AdminHubPage() {
  const [stats, setStats] = useState<Stats>({
    fbGroups: 0,
    xTargets: 0,
    activePartners: 0,
    weekOutreach: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      // Fetch FB outreach stats
      const fbRes = await fetch('/api/admin/fb-outreach/stats', {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const fbData = await fbRes.json();

      // Fetch X targets count
      const xRes = await fetch('/api/admin/x-outreach/stats', {
        headers: { 'X-Admin-Password': adminPassword },
      });
      const xData = await xRes.json();

      setStats({
        fbGroups: fbData.stats?.total || 0,
        xTargets: xData.stats?.total || 0,
        activePartners: fbData.stats?.partnersSignedUp || 0,
        weekOutreach: (fbData.stats?.byStatus?.dm_sent || 0) + (xData.stats?.byStatus?.dm_sent || 0),
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }

  const handleEmailUser = (email: string) => {
    window.location.href = `mailto:${email}?subject=Your Mind %26 Muscle Trial`;
  };

  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  };

  return (
    <AdminGate
      title="Admin Hub"
      description="Enter admin password to access all tools"
    >
      <div className="min-h-screen bg-[#0A0B14] text-white">
        {/* Subtle gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5 pointer-events-none" />

        <div className="relative z-10 py-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <Shield className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Admin Dashboard
                  </h1>
                  <p className="text-white/50 text-sm">
                    Central hub for all admin tools
                  </p>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Revenue + Quick Actions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Revenue Dashboard */}
                <RevenueDashboard onEmailUser={handleEmailUser} />

                {/* Outreach Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard
                    value={stats.fbGroups}
                    label="FB Groups"
                    icon={Facebook}
                    color="blue"
                    href="/admin/fb-outreach"
                  />
                  <StatCard
                    value={stats.xTargets}
                    label="X Targets"
                    icon={Twitter}
                    color="cyan"
                    href="/admin/x-outreach"
                  />
                  <StatCard
                    value={stats.activePartners}
                    label="Partners"
                    icon={Handshake}
                    color="green"
                    href="/admin/partners"
                  />
                  <StatCard
                    value={stats.weekOutreach}
                    label="DMs Sent"
                    icon={TrendingUp}
                    color="orange"
                    href="/admin/outreach-crm"
                  />
                </div>
              </div>

              {/* Right Column - Quick Access */}
              <div className="space-y-6">
                {/* Quick Tools */}
                <Card variant="default" className="p-5">
                  <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-white/40" />
                    Quick Access
                  </h2>
                  <div className="space-y-2">
                    {ADMIN_TOOLS.map((tool) => {
                      const Icon = tool.icon;
                      const colors = colorMap[tool.color] || colorMap.blue;
                      return (
                        <Link key={tool.href} href={tool.href}>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors border border-white/[0.05] hover:border-white/10 group">
                            <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center border ${colors.border} group-hover:scale-110 transition-transform`}>
                              <Icon className={`w-5 h-5 ${colors.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white">{tool.name}</p>
                              <p className="text-xs text-white/40 truncate">{tool.description}</p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </Card>

                {/* Quick Links */}
                <Card variant="default" className="p-5">
                  <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-white/40" />
                    Quick Links
                  </h2>
                  <div className="space-y-2">
                    {QUICK_LINKS.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-sm"
                      >
                        <span className="text-white/60 hover:text-white">{link.name}</span>
                        <span className="text-xs text-white/30">{link.description}</span>
                      </a>
                    ))}
                  </div>
                </Card>

                {/* Password Reference */}
                <Card variant="bordered" className="p-4">
                  <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-white/40" />
                    Passwords
                  </h2>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/40">Admin</span>
                      <code className="text-cyan-400">Brutus7862!</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Finder Fee</span>
                      <code className="text-cyan-400">fastball</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">VIP</span>
                      <code className="text-cyan-400">dominate</code>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
