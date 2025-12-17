import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TOLT_API_KEY = process.env.TOLT_API_KEY;
const TOLT_PROGRAM_ID = process.env.TOLT_PROGRAM_ID;
const TOLT_API_BASE = 'https://api.tolt.com/v1';

// Helper to verify admin password
function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('X-Admin-Password');
  return authHeader === process.env.ADMIN_DASHBOARD_PASSWORD;
}

// Fetch partner status from Tolt with email verification
async function getToltPartnerStatus(
  toltPartnerId: string,
  expectedEmail?: string
): Promise<{ exists: boolean; status?: string; email?: string; emailMatch?: boolean; error?: string }> {
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
    const toltEmail = data.email?.toLowerCase();
    const emailMatch = expectedEmail ? toltEmail === expectedEmail.toLowerCase() : true;

    return {
      exists: true,
      status: data.status || 'active',
      email: toltEmail,
      emailMatch,
    };
  } catch (error) {
    return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Fetch all partners from Tolt
async function getAllToltPartners(): Promise<{ partners: Array<{ id: string; email: string; name: string; status: string }>; error?: string; rawResponse?: string; apiKeyPresent?: boolean; programIdPresent?: boolean }> {
  if (!TOLT_API_KEY) {
    return { partners: [], error: 'No Tolt API key configured', apiKeyPresent: false, programIdPresent: !!TOLT_PROGRAM_ID };
  }

  if (!TOLT_PROGRAM_ID) {
    return { partners: [], error: 'No Tolt Program ID configured (TOLT_PROGRAM_ID env var)', apiKeyPresent: true, programIdPresent: false };
  }

  try {
    const url = `${TOLT_API_BASE}/partners?program_id=${TOLT_PROGRAM_ID}&limit=100`;
    console.log('Calling Tolt API:', url);
    console.log('API Key present:', !!TOLT_API_KEY, 'Key prefix:', TOLT_API_KEY.substring(0, 10) + '...');

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TOLT_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('Tolt API status:', response.status);
    console.log('Tolt API raw response:', responseText);

    if (!response.ok) {
      return {
        partners: [],
        error: `API error ${response.status}: ${responseText}`,
        apiKeyPresent: true,
        programIdPresent: true,
        rawResponse: responseText.substring(0, 500)
      };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return { partners: [], error: 'Invalid JSON response', rawResponse: responseText.substring(0, 500), apiKeyPresent: true, programIdPresent: true };
    }

    // Tolt API may return partners in different structures
    const partnersArray = data.data || data.partners || data || [];

    return {
      partners: (Array.isArray(partnersArray) ? partnersArray : []).map((p: { id: string; email: string; name: string; status: string }) => ({
        id: p.id,
        email: p.email?.toLowerCase(),
        name: p.name,
        status: p.status,
      })),
      apiKeyPresent: true,
      programIdPresent: true,
      rawResponse: JSON.stringify(data).substring(0, 500)
    };
  } catch (error) {
    return { partners: [], error: error instanceof Error ? error.message : 'Unknown error', apiKeyPresent: !!TOLT_API_KEY, programIdPresent: !!TOLT_PROGRAM_ID };
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
          const toltStatus = await getToltPartnerStatus(partner.tolt_partner_id, partner.email);

          let computedStatus = 'not_found';
          if (toltStatus.exists) {
            if (toltStatus.emailMatch === false) {
              computedStatus = 'email_mismatch';
            } else {
              computedStatus = toltStatus.status || 'active';
            }
          }

          return {
            ...partner,
            toltStatus: computedStatus,
            toltEmail: toltStatus.email,
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
        .select('id, email, name, tolt_partner_id');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Fetch all partners from Tolt first - this is the source of truth
      const { partners: toltPartners, error: toltError, rawResponse: toltRawResponse, apiKeyPresent, programIdPresent } = await getAllToltPartners();

      // Create a map of Tolt partners by email for quick lookup
      const toltByEmail = new Map(toltPartners.map(tp => [tp.email?.toLowerCase(), tp]));

      // Check each DB partner against Tolt by email (more reliable than ID)
      const results = (partners || []).map((partner) => {
        const dbEmail = partner.email?.toLowerCase();
        const toltPartner = toltByEmail.get(dbEmail);

        if (toltPartner) {
          // Found in Tolt by email - check if tolt_partner_id matches
          const idMatches = partner.tolt_partner_id === toltPartner.id;
          return {
            email: partner.email,
            name: partner.name,
            toltExists: true,
            toltStatus: idMatches ? (toltPartner.status || 'active') : 'id_mismatch',
            toltEmail: toltPartner.email,
            toltId: toltPartner.id,
            emailMatch: true, // Email matches since we found by email
            idMatch: idMatches,
          };
        } else {
          // Not found in Tolt by email - check if they have an ID that points elsewhere
          if (partner.tolt_partner_id) {
            // They have an ID but email doesn't match - this is an email mismatch
            const toltById = toltPartners.find(tp => tp.id === partner.tolt_partner_id);
            return {
              email: partner.email,
              name: partner.name,
              toltExists: !!toltById,
              toltStatus: toltById ? 'email_mismatch' : 'not_found',
              toltEmail: toltById?.email || '',
              toltId: partner.tolt_partner_id,
              emailMatch: false,
            };
          }
          return {
            email: partner.email,
            name: partner.name,
            toltExists: false,
            toltStatus: 'not_in_tolt',
            toltEmail: '',
            emailMatch: false,
          };
        }
      });

      // Find Tolt partners not in our DB (by email)
      const dbEmails = new Set((partners || []).map(p => p.email?.toLowerCase()));
      const inToltNotInDb = toltPartners.filter(tp => !dbEmails.has(tp.email));

      const notInTolt = results.filter(r => r.toltStatus === 'not_in_tolt' || r.toltStatus === 'not_found');
      const emailMismatch = results.filter(r => r.toltStatus === 'email_mismatch');
      const synced = results.filter(r => r.toltExists && r.emailMatch);

      return NextResponse.json({
        success: true,
        total: results.length,
        synced: synced.length,
        notInTolt: notInTolt.length,
        emailMismatch: emailMismatch.length,
        inToltNotInDb: inToltNotInDb.length,
        details: {
          synced,
          notInTolt,
          emailMismatch,
          inToltNotInDb,
        },
        toltError,
        debug: {
          apiKeyPresent,
          programIdPresent,
          toltPartnersCount: toltPartners.length,
          toltPartnerEmails: toltPartners.map(p => p.email),
          dbPartnerEmails: (partners || []).map(p => p.email),
          toltRawResponse,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in partner sync:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
