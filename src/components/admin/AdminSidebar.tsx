'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Handshake,
  BarChart3,
  Megaphone,
  Image,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  HelpCircle,
  Zap,
  TrendingUp,
  Mail,
  Target,
  Tag,
  DollarSign,
  Pin,
  PinOff,
  Mic,
  Database,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import CommandSearch from './CommandSearch';

interface NavItem {
  id: string;
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  shortcut?: string;
}

interface NavSection {
  id: string;
  title: string;
  icon?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'analytics',
    title: 'Analytics',
    icon: '📊',
    items: [
      { id: 'dashboard', name: 'Dashboard', href: '/admin', icon: LayoutDashboard, shortcut: 'D' },
      { id: 'growth', name: 'Growth', href: '/admin/growth', icon: Zap, shortcut: 'G' },
      { id: 'features', name: 'Feature Analytics', href: '/admin/feature-analytics', icon: BarChart3 },
    ],
  },
  {
    id: 'crm',
    title: 'CRM',
    icon: '👥',
    items: [
      { id: 'users', name: 'Users', href: '/admin/users', icon: Users, shortcut: 'U' },
      { id: 'partners', name: 'Partners', href: '/admin/partners', icon: Handshake, shortcut: 'P' },
      { id: 'outreach', name: 'Outreach', href: '/admin/outreach-crm', icon: Target },
      { id: 'enrichment', name: 'Enrichment', href: '/admin/enrichment', icon: Database, shortcut: 'E' },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing',
    icon: '📢',
    items: [
      { id: 'daily-hit', name: 'Daily Hit', href: '/admin/daily-hit-builder', icon: Mic, shortcut: 'H' },
      { id: 'campaigns', name: 'Campaigns', href: '/admin/campaigns', icon: Megaphone, shortcut: 'C' },
      { id: 'announcements', name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
      { id: 'templates', name: 'Templates', href: '/admin/templates', icon: Mail },
      { id: 'promos', name: 'Promos', href: '/admin/promo-codes', icon: Tag },
      { id: 'banners', name: 'Banners', href: '/admin/banner-generator', icon: Image },
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    icon: '💰',
    items: [
      { id: 'revenue', name: 'Revenue', href: '/admin/financials', icon: TrendingUp, shortcut: 'R' },
      { id: 'ai-costs', name: 'AI Costs', href: '/admin/ai-costs', icon: BarChart3 },
      { id: 'payouts', name: 'Payouts', href: '/admin/finder-fees', icon: DollarSign },
    ],
  },
  {
    id: 'system',
    title: 'System',
    icon: '⚙️',
    items: [
      { id: 'monitor', name: 'Monitor', href: '/admin/system', icon: Settings, shortcut: 'M' },
    ],
  },
];

const QUICK_LINKS = [
  { name: 'Supabase', href: 'https://supabase.com/dashboard/project/kuswlvbjplkgrqlmqtok', icon: '◆' },
  { name: 'Vercel', href: 'https://vercel.com/jbbs-projects-99c11455/mind-muscle-website', icon: '▲' },
];

// Get all nav items flattened for keyboard shortcuts
const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap(s => s.items);

interface Props {
  children: React.ReactNode;
}

export default function AdminSidebar({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pinnedItems, setPinnedItems] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdminAuth();

  // Load pinned items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin-pinned-items');
    if (saved) {
      try {
        setPinnedItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load pinned items');
      }
    }
  }, []);

  // Save pinned items to localStorage
  useEffect(() => {
    localStorage.setItem('admin-pinned-items', JSON.stringify(pinnedItems));
  }, [pinnedItems]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Alt + key for navigation shortcuts
      if (e.altKey && !e.metaKey && !e.ctrlKey) {
        const key = e.key.toUpperCase();
        const item = ALL_NAV_ITEMS.find(i => i.shortcut === key);
        if (item) {
          e.preventDefault();
          router.push(item.href);
        }
      }

      // Number keys 1-9 for pinned items
      if (!e.altKey && !e.metaKey && !e.ctrlKey && /^[1-9]$/.test(e.key)) {
        const index = parseInt(e.key) - 1;
        if (index < pinnedItems.length) {
          const item = ALL_NAV_ITEMS.find(i => i.id === pinnedItems[index]);
          if (item) {
            e.preventDefault();
            router.push(item.href);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinnedItems, router]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const togglePin = useCallback((itemId: string) => {
    setPinnedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
    setContextMenu(null);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, itemId });
  }, []);

  const getPinnedNavItems = () => {
    return pinnedItems
      .map(id => ALL_NAV_ITEMS.find(item => item.id === id))
      .filter(Boolean) as NavItem[];
  };

  const renderNavItem = (item: NavItem, index?: number) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    const isPinned = pinnedItems.includes(item.id);
    const pinnedIndex = pinnedItems.indexOf(item.id);

    return (
      <Link
        key={item.id}
        href={item.href}
        onContextMenu={(e) => handleContextMenu(e, item.id)}
        className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-all relative ${
          active
            ? 'bg-white/10 text-white'
            : 'text-white/60 hover:bg-white/5 hover:text-white'
        }`}
        title={collapsed ? `${item.name}${item.shortcut ? ` (Alt+${item.shortcut})` : ''}` : undefined}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-cyan-400' : ''}`} />
        {!collapsed && (
          <>
            <span className="flex-1 text-sm truncate">{item.name}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-full">
                {item.badge}
              </span>
            )}
            {item.shortcut && (
              <span className="text-[10px] text-white/30 opacity-0 group-hover:opacity-100 transition-opacity">
                Alt+{item.shortcut}
              </span>
            )}
            {pinnedIndex !== -1 && typeof index === 'undefined' && (
              <span className="text-[10px] text-white/30">
                {pinnedIndex + 1}
              </span>
            )}
          </>
        )}
      </Link>
    );
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
          {collapsed && (
            <Link href="/admin" className="mx-auto">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
            </Link>
          )}
          {!isMobile && !collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4 text-white/50" />
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

      {/* Expand button when collapsed */}
      {collapsed && !isMobile && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto my-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4 text-white/50" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Pinned Section */}
        {pinnedItems.length > 0 && (
          <div>
            {!collapsed && (
              <div className="flex items-center gap-2 px-3 mb-2">
                <Pin className="w-3 h-3 text-yellow-500/70" />
                <p className="text-xs font-medium text-yellow-500/70 uppercase tracking-wider">
                  Pinned
                </p>
                <span className="text-[10px] text-white/30 ml-auto">1-{pinnedItems.length}</span>
              </div>
            )}
            <div className="space-y-1">
              {getPinnedNavItems().map((item, i) => renderNavItem(item, i))}
            </div>
            {!collapsed && <div className="my-3 border-t border-white/5" />}
          </div>
        )}

        {/* Main Navigation */}
        {NAV_SECTIONS.map((section) => (
          <div key={section.id}>
            {!collapsed && (
              <div className="flex items-center gap-2 px-3 mb-2">
                <span className="text-sm">{section.icon}</span>
                <p className="text-xs font-medium text-white/30 uppercase tracking-wider">
                  {section.title}
                </p>
              </div>
            )}
            {collapsed && (
              <div className="flex justify-center mb-2" title={section.title}>
                <span className="text-sm opacity-50">{section.icon}</span>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => renderNavItem(item))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        {/* External Links Row */}
        <div className={`flex ${collapsed ? 'flex-col' : 'flex-row'} items-center gap-2 mb-3`}>
          {QUICK_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 p-2 rounded-lg text-white/40 hover:bg-white/5 hover:text-white/60 transition-colors ${
                collapsed ? 'w-full' : 'flex-1'
              }`}
              title={link.name}
            >
              <span className="text-sm">{link.icon}</span>
              {!collapsed && <span className="text-xs">{link.name}</span>}
            </a>
          ))}
          <a
            href="/admin/docs"
            className={`flex items-center justify-center gap-2 p-2 rounded-lg text-white/40 hover:bg-white/5 hover:text-white/60 transition-colors ${
              collapsed ? 'w-full' : ''
            }`}
            title="Documentation"
          >
            <HelpCircle className="w-4 h-4" />
            {!collapsed && <span className="text-xs">Help</span>}
          </a>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center justify-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[#1a1b2e] border border-white/10 rounded-lg shadow-xl py-1 z-[100]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => togglePin(contextMenu.itemId)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-white/10 w-full"
          >
            {pinnedItems.includes(contextMenu.itemId) ? (
              <>
                <PinOff className="w-4 h-4" />
                Unpin from top
              </>
            ) : (
              <>
                <Pin className="w-4 h-4" />
                Pin to top
              </>
            )}
          </button>
        </div>
      )}
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
