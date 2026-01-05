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

// Get organizations (with optional segment filter)
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const segment = searchParams.get('segment');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    let query = supabase
      .from('marketing_organizations')
      .select('id, name, website, segment, enrichment_status, address')
      .order('name');

    if (segment && segment !== 'all') {
      query = query.eq('segment', segment);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    query = query.limit(limit);

    const { data: organizations, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      organizations: organizations || [],
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch organizations' }, { status: 500 });
  }
}

// Create a new organization
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, website, segment, address, notes } = body;

    // Validation
    if (!name || !segment) {
      return NextResponse.json(
        { success: false, message: 'Name and segment are required' },
        { status: 400 }
      );
    }

    // Normalize website URL
    let normalizedWebsite = website;
    if (website && !website.startsWith('http')) {
      normalizedWebsite = `https://${website}`;
    }

    // Check for duplicate by name or website
    if (normalizedWebsite) {
      const { data: existing } = await supabase
        .from('marketing_organizations')
        .select('id, name')
        .or(`name.ilike.${name},website.eq.${normalizedWebsite}`)
        .limit(1);

      if (existing && existing.length > 0) {
        return NextResponse.json(
          { success: false, message: `Organization already exists: ${existing[0].name}` },
          { status: 409 }
        );
      }
    }

    // Insert new organization
    const { data: newOrg, error: insertError } = await supabase
      .from('marketing_organizations')
      .insert({
        name,
        website: normalizedWebsite || null,
        segment,
        address: address || null,
        notes: notes || null,
        enrichment_status: normalizedWebsite ? 'pending' : 'skipped',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      organization: newOrg,
      message: normalizedWebsite
        ? 'Organization created and queued for enrichment'
        : 'Organization created (no website - skipped enrichment)',
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ success: false, message: 'Failed to create organization' }, { status: 500 });
  }
}

// Update an organization
export async function PATCH(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Organization ID required' }, { status: 400 });
    }

    // Allowed fields to update
    const allowedFields = ['name', 'website', 'segment', 'address', 'notes', 'enrichment_status'];
    const filteredUpdates: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value;
      }
    }

    // If website is being updated, reset enrichment status
    if (filteredUpdates.website) {
      let website = filteredUpdates.website as string;
      if (!website.startsWith('http')) {
        website = `https://${website}`;
      }
      filteredUpdates.website = website;
      filteredUpdates.enrichment_status = 'pending';
    }

    const { data, error } = await supabase
      .from('marketing_organizations')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, organization: data });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json({ success: false, message: 'Failed to update organization' }, { status: 500 });
  }
}
