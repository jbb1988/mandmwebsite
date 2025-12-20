import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

function verifyAdmin(request: NextRequest): boolean {
  const password = request.headers.get('X-Admin-Password');
  return password === ADMIN_PASSWORD;
}

// GET - Fetch template usage statistics
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all admins with template_used data
    const { data: admins, error: adminsError } = await supabase
      .from('fb_page_admins')
      .select('template_used, response_status, dm_sent_at, partner_signed_up')
      .not('template_used', 'is', null);

    if (adminsError) throw adminsError;

    // Aggregate template stats
    const templateStats: Record<string, {
      used: number;
      responses: number;
      conversions: number;
      responseRate: number;
      conversionRate: number;
    }> = {};

    (admins || []).forEach((admin) => {
      const templateName = admin.template_used;
      if (!templateName) return;

      if (!templateStats[templateName]) {
        templateStats[templateName] = {
          used: 0,
          responses: 0,
          conversions: 0,
          responseRate: 0,
          conversionRate: 0,
        };
      }

      templateStats[templateName].used++;

      // Count as response if status is not 'not_contacted' or 'dm_sent'
      const hasResponse = admin.response_status &&
        !['not_contacted', 'dm_sent'].includes(admin.response_status);
      if (hasResponse) {
        templateStats[templateName].responses++;
      }

      // Count conversions (partner sign-ups)
      if (admin.partner_signed_up) {
        templateStats[templateName].conversions++;
      }
    });

    // Calculate rates
    Object.keys(templateStats).forEach((templateName) => {
      const stats = templateStats[templateName];
      stats.responseRate = stats.used > 0
        ? Math.round((stats.responses / stats.used) * 100)
        : 0;
      stats.conversionRate = stats.used > 0
        ? Math.round((stats.conversions / stats.used) * 100)
        : 0;
    });

    // Sort by usage count
    const sortedStats = Object.entries(templateStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.used - a.used);

    // Get total stats
    const totalUsed = sortedStats.reduce((sum, s) => sum + s.used, 0);
    const totalResponses = sortedStats.reduce((sum, s) => sum + s.responses, 0);
    const totalConversions = sortedStats.reduce((sum, s) => sum + s.conversions, 0);

    return NextResponse.json({
      success: true,
      stats: sortedStats,
      totals: {
        totalUsed,
        totalResponses,
        totalConversions,
        overallResponseRate: totalUsed > 0 ? Math.round((totalResponses / totalUsed) * 100) : 0,
        overallConversionRate: totalUsed > 0 ? Math.round((totalConversions / totalUsed) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching template stats:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch template stats' }, { status: 500 });
  }
}
