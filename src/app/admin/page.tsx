'use client';

import { useState } from 'react';
import PasswordGate from '@/components/PasswordGate';
import { LiquidGlass } from '@/components/LiquidGlass';
import Link from 'next/link';
import {
  DollarSign, Users, Image, Facebook, Mail, Settings,
  ExternalLink, Shield, BarChart3, FileText
} from 'lucide-react';

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

export default function AdminHubPage() {
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  const getColorClasses = (color: string) => ({
    bg: `bg-${color}-500/20`,
    border: `border-${color}-500/30`,
    text: `text-${color}-400`,
    hover: `hover:bg-${color}-500/30`,
  });

  return (
    <PasswordGate
      password={adminPassword}
      title="Admin Hub"
      description="Enter admin password to access all tools"
    >
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Shield className="w-8 h-8 text-orange-400" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Mind & Muscle Admin</h1>
              <p className="text-gray-400">Central hub for all admin tools and dashboards</p>
            </div>

            {/* Admin Tools Grid */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" />
                Admin Tools
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {ADMIN_TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.href} href={tool.href}>
                      <LiquidGlass className="p-6 h-full hover:scale-[1.02] transition-transform cursor-pointer">
                        <div className={`w-12 h-12 bg-${tool.color}-500/20 rounded-xl flex items-center justify-center border border-${tool.color}-500/30 mb-4`}>
                          <Icon className={`w-6 h-6 text-${tool.color}-400`} />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{tool.name}</h3>
                        <p className="text-sm text-gray-400">{tool.description}</p>
                      </LiquidGlass>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-gray-400" />
                Quick Links
              </h2>
              <LiquidGlass className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {QUICK_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium flex items-center gap-2">
                          {link.name}
                          {link.external && <ExternalLink className="w-3 h-3 text-gray-500" />}
                        </p>
                        <p className="text-xs text-gray-500">{link.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </LiquidGlass>
            </div>

            {/* Password Reference */}
            <LiquidGlass className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                Password Reference
              </h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-gray-400 mb-1">Admin Dashboard</p>
                  <code className="text-cyan-400">Brutus7862!</code>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-gray-400 mb-1">Finder Fee Page</p>
                  <code className="text-cyan-400">fastball</code>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-gray-400 mb-1">Finder Fee VIP</p>
                  <code className="text-cyan-400">dominate</code>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-4">
                Note: Admin password is set via NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD in Vercel environment variables.
              </p>
            </LiquidGlass>
          </div>
        </div>
      </div>
    </PasswordGate>
  );
}
