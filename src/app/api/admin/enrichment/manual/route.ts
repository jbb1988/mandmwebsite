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

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { organization_id, email, first_name, last_name, role, source, create_contact = true } = body;

    if (!organization_id || !email) {
      return NextResponse.json(
        { success: false, message: 'organization_id and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Fetch organization
    const { data: org, error: orgError } = await supabase
      .from('marketing_organizations')
      .select('*')
      .eq('id', organization_id)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { success: false, message: 'Organization not found' },
        { status: 404 }
      );
    }

    // Update organization with manually added email
    const existingEmails = org.emails_found || [];
    const updatedEmails = [...new Set([...existingEmails, email.toLowerCase()])];

    await supabase
      .from('marketing_organizations')
      .update({
        emails_found: updatedEmails,
        enrichment_status: 'completed',
        enriched_at: new Date().toISOString(),
        enrichment_error: null,
      })
      .eq('id', organization_id);

    let contactCreated = false;
    let contactId = null;

    if (create_contact) {
      // Check if contact already exists
      const { data: existingContact } = await supabase
        .from('marketing_contacts')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (!existingContact) {
        const { data: newContact, error: createError } = await supabase
          .from('marketing_contacts')
          .insert({
            organization_id,
            email: email.toLowerCase(),
            first_name: first_name || null,
            last_name: last_name || null,
            role: role || 'Contact',
            source: source || 'manual_entry',
            email_deliverable: true,
          })
          .select('id')
          .single();

        if (!createError && newContact) {
          contactCreated = true;
          contactId = newContact.id;
        }
      } else {
        contactId = existingContact.id;
      }
    }

    return NextResponse.json({
      success: true,
      organization_id,
      email: email.toLowerCase(),
      contact_created: contactCreated,
      contact_id: contactId,
      message: contactCreated
        ? 'Email added and contact created successfully'
        : 'Email added to organization',
    });
  } catch (error) {
    console.error('Error adding manual email:', error);
    return NextResponse.json({ success: false, message: 'Failed to add email' }, { status: 500 });
  }
}
