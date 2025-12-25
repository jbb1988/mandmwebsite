'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Handshake,
  Target,
  BarChart3,
  Megaphone,
  Tag,
  Image,
  DollarSign,
  Facebook,
  Twitter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Settings,
  LogOut,
  Book,
  Zap,
  TrendingUp,
  RefreshCw,
  Mail,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import CommandSearch from './CommandSearch';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Growth Center', href: '/admin/growth', icon: Zap },
    ],
  },
  {
    title: 'Users & Partners',
    items: [
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Partners', href: '/admin/partners', icon: Handshake },
      { name: 'Feature Analytics', href: '/admin/feature-analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Outreach',
    items: [
      { name: 'Outreach CRM', href: '/admin/outreach-crm', icon: Target },
      { name: 'FB Outreach', href: '/admin/fb-outreach', icon: Facebook },
      { name: 'X Outreach', href: '/admin/x-outreach', icon: Twitter },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
      { name: 'Outreach Campaigns', href: '/admin/campaigns', icon: Mail },
      { name: 'Lifecycle Campaigns', href: '/admin/lifecycle-campaigns', icon: RefreshCw },
      { name: 'Promo Codes', href: '/admin/promo-codes', icon: Tag },
      { name: 'Banner Generator', href: '/admin/banner-generator', icon: Image },
    ],
  },
  {
    title: 'Finance',
    items: [
      { name: 'Finder Fees', href: '/admin/finder-fees', icon: DollarSign },
      { name: 'Partner Attribution', href: '/admin/partner-attribution', icon: Handshake },
    ],
  },
  {
    title: 'Help',
    items: [
      { name: 'Documentation', href: '/admin/docs', icon: Book },
    ],
  },
];

const QUICK_LINKS = [
  { name: 'Supabase', href: 'https://supabase.com/dashboard/project/kuswlvbjplkgrqlmqtok' },
  { name: 'Vercel', href: 'https://vercel.com/jbbs-projects-99c11455/mind-muscle-website' },
  { name: 'Tolt', href: 'https://app.tolt.io' },
];

interface Props {
  children: React.ReactNode;
}

export default function AdminSidebar({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo/Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-white font-semibold">Admin</span>
            </Link>
          )}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-white/50" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-white/50" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-3 border-b border-white/10">
          <CommandSearch />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-medium text-white/30 uppercase tracking-wider">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      active
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-cyan-400' : ''}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-sm">{item.name}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Quick Links */}
      {!collapsed && (
        <div className="p-3 border-t border-white/10">
          <p className="px-3 mb-2 text-xs font-medium text-white/30 uppercase tracking-wider">
            External
          </p>
          <div className="space-y-1">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/40 hover:bg-white/5 hover:text-white/60 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0B14] flex">
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#0F1123] border-r border-white/10 z-50 transition-all duration-300 ${
          isMobile
            ? mobileOpen
              ? 'translate-x-0 w-64'
              : '-translate-x-full w-64'
            : collapsed
            ? 'w-16'
            : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile toggle */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed top-4 left-4 z-30 p-2 bg-[#0F1123] border border-white/10 rounded-xl"
        >
          <Settings className="w-5 h-5 text-white/60" />
        </button>
      )}

      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isMobile ? 'ml-0' : collapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
