import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TOLT_API_KEY = process.env.TOLT_API_KEY;
const TOLT_API_BASE = 'https://api.tolt.io/v1';

// Helper to verify admin password
function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('x-admin-password');
  return authHeader === process.env.ADMIN_DASHBOARD_PASSWORD;
}

// Fetch partner status from Tolt
async function getToltPartnerStatus(toltPartnerId: string): Promise<{ exists: boolean; status?: string; error?: string }> {
  if (!TOLT_API_KEY || !toltPartnerId) {
    return { exists: false, error: 'No Tolt ID' };
  }

  try {
    const response = await fetch(`${TOLT_API_BASE}/partners/${toltPartnerId}`, {
      headers: {
        'Authorization': `Bearer ${TOLT_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return { exists: false };
    }

    if (!response.ok) {
      return { exists: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    return { exists: true, status: data.status || 'active' };
  } catch (error) {
    return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// GET: List all partners with Tolt status
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const checkTolt = searchParams.get('checkTolt') === 'true';

    // Fetch all partners from Supabase
    const { data: partners, error } = await supabase
      .from('partners')
      .select('id, email, name, first_name, tolt_partner_id, referral_url, referral_slug, created_at, logo_url')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Optionally check Tolt status for each partner
    let partnersWithStatus = partners || [];

    if (checkTolt && partnersWithStatus.length > 0) {
      partnersWithStatus = await Promise.all(
        partnersWithStatus.map(async (partner) => {
          const toltStatus = await getToltPartnerStatus(partner.tolt_partner_id);
          return {
            ...partner,
            toltStatus: toltStatus.exists ? toltStatus.status : 'not_found',
            toltError: toltStatus.error,
          };
        })
      );
    }

    return NextResponse.json({
      success: true,
      partners: partnersWithStatus,
      total: partnersWithStatus.length,
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a partner from Supabase (and optionally Tolt)
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email, deleteFromTolt } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get partner details first
    const { data: partner, error: fetchError } = await supabase
      .from('partners')
      .select('id, email, name, tolt_partner_id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (fetchError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Delete from Tolt if requested and partner has Tolt ID
    let toltDeleted = false;
    if (deleteFromTolt && partner.tolt_partner_id && TOLT_API_KEY) {
      try {
        const toltResponse = await fetch(`${TOLT_API_BASE}/partners/${partner.tolt_partner_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${TOLT_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        toltDeleted = toltResponse.ok || toltResponse.status === 404;
      } catch (toltError) {
        console.error('Error deleting from Tolt:', toltError);
        // Continue with Supabase deletion even if Tolt fails
      }
    }

    // Delete related data from Supabase
    // 1. Delete partner sessions
    await supabase
      .from('partner_sessions')
      .delete()
      .eq('partner_email', email.toLowerCase().trim());

    // 2. Delete partner metrics cache
    await supabase
      .from('partner_metrics_cache')
      .delete()
      .eq('partner_email', email.toLowerCase().trim());

    // 3. Delete partner banners
    await supabase
      .from('partner_banners')
      .delete()
      .eq('partner_email', email.toLowerCase().trim());

    // 4. Delete the partner record
    const { error: deleteError } = await supabase
      .from('partners')
      .delete()
      .eq('email', email.toLowerCase().trim());

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Partner ${partner.name} (${email}) deleted`,
      toltDeleted,
    });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Sync partner with Tolt or create new partner
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, email } = await request.json();

    if (action === 'sync') {
      // Sync a specific partner's Tolt status
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      const { data: partner, error } = await supabase
        .from('partners')
        .select('id, email, name, tolt_partner_id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (error || !partner) {
        return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
      }

      const toltStatus = await getToltPartnerStatus(partner.tolt_partner_id);

      return NextResponse.json({
        success: true,
        partner: {
          ...partner,
          toltStatus: toltStatus.exists ? toltStatus.status : 'not_found',
          toltError: toltStatus.error,
        },
      });
    }

    if (action === 'sync-all') {
      // Sync all partners with Tolt
      const { data: partners, error } = await supabase
        .from('partners')
        .select('id, email, name, tolt_partner_id')
        .not('tolt_partner_id', 'is', null);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const results = await Promise.all(
        (partners || []).map(async (partner) => {
          const toltStatus = await getToltPartnerStatus(partner.tolt_partner_id);
          return {
            email: partner.email,
            name: partner.name,
            toltExists: toltStatus.exists,
            toltStatus: toltStatus.status,
            toltError: toltStatus.error,
          };
        })
      );

      const notInTolt = results.filter(r => !r.toltExists);

      return NextResponse.json({
        success: true,
        total: results.length,
        inTolt: results.filter(r => r.toltExists).length,
        notInTolt: notInTolt.length,
        orphaned: notInTolt,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in partner sync:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
