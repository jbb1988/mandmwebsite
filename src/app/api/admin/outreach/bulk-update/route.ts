import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus1018!';

function verifyAdmin(request: NextRequest): boolean {
  const password = request.headers.get('X-Admin-Password');
  return password === ADMIN_PASSWORD;
}

// POST - Bulk update multiple contacts
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ids, updates } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'No IDs provided' }, { status: 400 });
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ success: false, message: 'No updates provided' }, { status: 400 });
    }

    // Separate FB admins and X targets by ID prefix
    const fbIds = ids.filter((id: string) => id.startsWith('fb_'));
    const xIds = ids.filter((id: string) => id.startsWith('x_'));

    const results = {
      fbUpdated: 0,
      xUpdated: 0,
      errors: [] as string[],
    };

    // Update FB admins
    if (fbIds.length > 0) {
      const fbRealIds = fbIds.map((id: string) => id.replace('fb_', ''));

      // Build update object for FB admins
      const fbUpdates: Record<string, unknown> = {};
      if (updates.dm_sent_at !== undefined) fbUpdates.dm_sent_at = updates.dm_sent_at;
      if (updates.response_status !== undefined) fbUpdates.response_status = updates.response_status;
      if (updates.template_used !== undefined) fbUpdates.template_used = updates.template_used;
      if (updates.next_follow_up !== undefined) fbUpdates.next_follow_up = updates.next_follow_up;
      if (updates.trial_granted_at !== undefined) fbUpdates.trial_granted_at = updates.trial_granted_at;
      if (updates.partner_signed_up !== undefined) fbUpdates.partner_signed_up = updates.partner_signed_up;
      if (updates.partner_signed_up_at !== undefined) fbUpdates.partner_signed_up_at = updates.partner_signed_up_at;

      if (Object.keys(fbUpdates).length > 0) {
        const { error } = await supabase
          .from('fb_page_admins')
          .update(fbUpdates)
          .in('id', fbRealIds);

        if (error) {
          results.errors.push(`FB update error: ${error.message}`);
        } else {
          results.fbUpdated = fbIds.length;
        }
      }
    }

    // Update X targets
    if (xIds.length > 0) {
      const xRealIds = xIds.map((id: string) => id.replace('x_', ''));

      // Build update object for X targets
      const xUpdates: Record<string, unknown> = {};
      if (updates.dm_sent_at !== undefined) xUpdates.dm_sent_at = updates.dm_sent_at;
      if (updates.response_status !== undefined) xUpdates.response_status = updates.response_status;
      if (updates.template_used !== undefined) xUpdates.template_used = updates.template_used;
      if (updates.next_follow_up !== undefined) {
        // X targets don't have next_follow_up, so we'd need to add it or skip
        // For now, skipping as the schema doesn't have it
      }
      if (updates.trial_granted_at !== undefined) xUpdates.trial_granted_at = updates.trial_granted_at;
      if (updates.partner_signed_up !== undefined) {
        // X targets use deal_status instead
        xUpdates.deal_status = updates.partner_signed_up ? 'partner' : 'active';
      }

      // Map response_status for X targets
      if (updates.response_status !== undefined) {
        xUpdates.outreach_status = updates.response_status;
      }

      if (Object.keys(xUpdates).length > 0) {
        const { error } = await supabase
          .from('x_target_accounts')
          .update(xUpdates)
          .in('id', xRealIds);

        if (error) {
          results.errors.push(`X update error: ${error.message}`);
        } else {
          results.xUpdated = xIds.length;
        }
      }
    }

    const totalUpdated = results.fbUpdated + results.xUpdated;

    if (results.errors.length > 0 && totalUpdated === 0) {
      return NextResponse.json({
        success: false,
        message: results.errors.join('; '),
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${totalUpdated} contact${totalUpdated !== 1 ? 's' : ''}`,
      results,
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json({ success: false, message: 'Failed to bulk update' }, { status: 500 });
  }
}
