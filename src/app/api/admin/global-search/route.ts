import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

export async function GET(request: NextRequest) {
  const password = request.headers.get('X-Admin-Password');
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results: Array<{
      type: 'user' | 'partner' | 'page';
      id: string;
      title: string;
      subtitle: string;
      href: string;
      icon: string;
    }> = [];

    // Search users
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, name, tier')
      .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(5);

    users?.forEach(user => {
      results.push({
        type: 'user',
        id: user.id,
        title: user.name || user.email,
        subtitle: `${user.email} - ${user.tier || 'free'}`,
        href: `/admin/users?search=${encodeURIComponent(user.email)}`,
        icon: 'user',
      });
    });

    // Search partners
    const { data: partners } = await supabase
      .from('partners')
      .select('id, email, name, referral_slug')
      .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(5);

    partners?.forEach(partner => {
      results.push({
        type: 'partner',
        id: partner.id,
        title: partner.name,
        subtitle: partner.email,
        href: `/admin/partners?search=${encodeURIComponent(partner.email)}`,
        icon: 'handshake',
      });
    });

    // Static admin pages for search
    const pages = [
      { title: 'Dashboard', subtitle: 'Admin home', href: '/admin', keywords: ['home', 'dashboard', 'admin'] },
      { title: 'Users', subtitle: 'User management', href: '/admin/users', keywords: ['users', 'profiles', 'accounts'] },
      { title: 'Partners', subtitle: 'Partner management', href: '/admin/partners', keywords: ['partners', 'affiliates', 'tolt'] },
      { title: 'Outreach CRM', subtitle: 'Sales pipeline', href: '/admin/outreach-crm', keywords: ['outreach', 'crm', 'pipeline', 'sales', 'dm'] },
      { title: 'Feature Analytics', subtitle: 'Usage insights', href: '/admin/feature-analytics', keywords: ['analytics', 'features', 'usage', 'health'] },
      { title: 'Announcements', subtitle: 'System announcements', href: '/admin/announcements', keywords: ['announcements', 'notifications', 'alerts'] },
      { title: 'Promo Codes', subtitle: 'Manage promotions', href: '/admin/promo-codes', keywords: ['promo', 'codes', 'discounts', 'coupons'] },
      { title: 'Banner Generator', subtitle: 'Create partner banners', href: '/admin/banner-generator', keywords: ['banner', 'generator', 'qr', 'images'] },
      { title: 'Finder Fees', subtitle: 'Finder fee management', href: '/admin/finder-fees', keywords: ['finder', 'fees', 'referrals'] },
      { title: 'FB Outreach', subtitle: 'Facebook groups', href: '/admin/fb-outreach', keywords: ['facebook', 'fb', 'groups', 'outreach'] },
      { title: 'X Outreach', subtitle: 'Twitter/X targets', href: '/admin/x-outreach', keywords: ['twitter', 'x', 'outreach'] },
    ];

    pages.forEach(page => {
      if (
        page.title.toLowerCase().includes(query) ||
        page.subtitle.toLowerCase().includes(query) ||
        page.keywords.some(k => k.includes(query))
      ) {
        results.push({
          type: 'page',
          id: page.href,
          title: page.title,
          subtitle: page.subtitle,
          href: page.href,
          icon: 'file',
        });
      }
    });

    return NextResponse.json({
      success: true,
      results: results.slice(0, 10),
      query,
    });
  } catch (error) {
    console.error('Global search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
