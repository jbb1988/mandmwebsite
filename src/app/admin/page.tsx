'use client';

import { useEffect, useState } from 'react';
import AdminGate from '@/components/AdminGate';
import AdminNav from '@/components/AdminNav';
import { useAdminAuth } from '@/context/AdminAuthContext';
import Link from 'next/link';
import {
  DollarSign, Users, Image, Facebook, Settings,
  ExternalLink, Shield, BarChart3, FileText, LogOut,
  Twitter, Handshake, TrendingUp
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
function StatCard({ value, label, icon: Icon, color = 'white' }: {
  value: number | string;
  label: string;
  icon?: typeof DollarSign;
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

interface AdminTool {
  name: string;
  description: string;
  href: string;
  icon: typeof DollarSign;
  color: string;
  category: 'marketing' | 'finance' | 'tools';
}

const ADMIN_TOOLS: AdminTool[] = [
  {
    name: 'FB Outreach Pipeline',
    description: 'Track Facebook group admin outreach and posts',
    href: '/admin/fb-outreach',
    icon: Facebook,
    color: 'blue',
    category: 'marketing',
  },
  {
    name: 'X/Twitter Outreach',
    description: 'Track influencer DMs and partnerships',
    href: '/admin/x-outreach',
    icon: Twitter,
    color: 'cyan',
    category: 'marketing',
  },
  {
    name: 'Finder Fee Management',
    description: 'Manage finder partners and track transactions',
    href: '/admin/finder-fees',
    icon: DollarSign,
    color: 'orange',
    category: 'finance',
  },
  {
    name: 'Partner Banner Generator',
    description: 'Create custom QR banners for partners',
    href: '/admin/banner-generator',
    icon: Image,
    color: 'purple',
    category: 'tools',
  },
];

const QUICK_LINKS = [
  {
    name: 'Partner Program (Public)',
    href: '/partner-program',
    description: 'Public partner signup page',
  },
  {
    name: 'Finder Fee Page',
    href: '/finder-fee',
    description: 'Standard finder fee info (pw: fastball)',
  },
  {
    name: 'Finder Fee VIP',
    href: '/finder-fee-vip',
    description: 'VIP recurring finder info (pw: dominate)',
  },
  {
    name: 'Team Licensing',
    href: '/team-licensing',
    description: 'Team purchase page',
  },
  {
    name: 'Tolt Admin',
    href: 'https://app.tolt.io',
    description: 'Partner program admin',
    external: true,
  },
  {
    name: 'Supabase Dashboard',
    href: 'https://supabase.com/dashboard/project/kuswlvbjplkgrqlmqtok',
    description: 'Database & Edge Functions',
    external: true,
  },
  {
    name: 'Vercel Dashboard',
    href: 'https://vercel.com/jbbs-projects-99c11455/mind-muscle-website',
    description: 'Website deployments',
    external: true,
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
  const { logout } = useAdminAuth();
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

        <div className="relative z-10 pt-28 pb-12 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Shield className="w-8 h-8 text-orange-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                Mind & Muscle Admin
              </h1>
              <p className="text-white/50 text-sm sm:text-base">
                Central hub for all admin tools and dashboards
              </p>
              <button
                onClick={logout}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm text-white/40 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Admin Navigation */}
            <AdminNav />

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
              <StatCard value={stats.fbGroups} label="FB Groups" icon={Facebook} color="blue" />
              <StatCard value={stats.xTargets} label="X/Twitter Targets" icon={Twitter} color="cyan" />
              <StatCard value={stats.activePartners} label="Active Partners" icon={Handshake} color="green" />
              <StatCard value={stats.weekOutreach} label="DMs Sent" icon={TrendingUp} color="orange" />
            </div>

            {/* Admin Tools Grid */}
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-white/40" />
                Admin Tools
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {ADMIN_TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  const colors = colorMap[tool.color] || colorMap.blue;
                  return (
                    <Link key={tool.href} href={tool.href}>
                      <Card
                        variant="elevated"
                        className="p-5 h-full hover:scale-[1.02] hover:border-white/20 transition-all cursor-pointer group"
                      >
                        <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center border ${colors.border} mb-4 group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-6 h-6 ${colors.text}`} />
                        </div>
                        <h3 className="text-base font-semibold text-white mb-1">{tool.name}</h3>
                        <p className="text-sm text-white/40">{tool.description}</p>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-white/40" />
                Quick Links
              </h2>
              <Card variant="default" className="p-5">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {QUICK_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors border border-white/[0.05] hover:border-white/10"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium flex items-center gap-2 text-sm">
                          {link.name}
                          {link.external && <ExternalLink className="w-3 h-3 text-white/30" />}
                        </p>
                        <p className="text-xs text-white/30">{link.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </Card>
            </div>

            {/* Password Reference */}
            <Card variant="bordered" className="p-5">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-white/40" />
                Password Reference
              </h2>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                  <p className="text-white/40 mb-1 text-xs">Admin Dashboard</p>
                  <code className="text-cyan-400 text-sm">Brutus7862!</code>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                  <p className="text-white/40 mb-1 text-xs">Finder Fee Page</p>
                  <code className="text-cyan-400 text-sm">fastball</code>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                  <p className="text-white/40 mb-1 text-xs">Finder Fee VIP</p>
                  <code className="text-cyan-400 text-sm">dominate</code>
                </div>
              </div>
              <p className="text-xs text-white/20 mt-4">
                Note: Admin password is set via NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD in Vercel environment variables.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
