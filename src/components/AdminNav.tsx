'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, DollarSign,
  Image, FolderOpen, Tag, Mail, UserCircle, Target
} from 'lucide-react';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/campaigns', label: 'Campaigns', icon: Mail },
  { href: '/admin/outreach-crm', label: 'Outreach CRM', icon: Target },
  { href: '/admin/finder-fees', label: 'Finder Fees', icon: DollarSign },
  { href: '/admin/partners', label: 'Partners', icon: Users },
  { href: '/admin/users', label: 'Users', icon: UserCircle },
  { href: '/admin/promo-codes', label: 'Promo Codes', icon: Tag },
  { href: '/admin/banner-generator', label: 'Banners', icon: Image },
  { href: '/admin/banner-library', label: 'Library', icon: FolderOpen },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {adminLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
