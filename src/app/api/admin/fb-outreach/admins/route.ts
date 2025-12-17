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

// PATCH - Update admin status (dm_sent_at, response_status, partner conversion fields)
export async function PATCH(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      admin_id,
      response_status,
      dm_sent_at,
      notes,
      // Response tracking fields
      response_type,
      response_notes,
      next_follow_up,
      follow_up_count,
      // Partner conversion fields
      partner_signed_up,
      partner_signed_up_at,
      app_user_id,
      app_signed_up_at,
      referral_count,
      referral_revenue,
      // Email for partner matching
      admin_email,
      // Template tracking
      template_used,
    } = body;

    if (!admin_id) {
      return NextResponse.json({ success: false, message: 'Admin ID is required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (response_status) updates.response_status = response_status;
    if (dm_sent_at) updates.dm_sent_at = dm_sent_at;
    if (notes !== undefined) updates.notes = notes;

    // Response tracking fields
    if (response_type !== undefined) updates.response_type = response_type;
    if (response_notes !== undefined) updates.response_notes = response_notes;
    if (next_follow_up !== undefined) updates.next_follow_up = next_follow_up;
    if (follow_up_count !== undefined) updates.follow_up_count = follow_up_count;

    // Partner conversion fields
    if (partner_signed_up !== undefined) updates.partner_signed_up = partner_signed_up;
    if (partner_signed_up_at) updates.partner_signed_up_at = partner_signed_up_at;
    if (app_user_id !== undefined) updates.app_user_id = app_user_id;
    if (app_signed_up_at) updates.app_signed_up_at = app_signed_up_at;
    if (referral_count !== undefined) updates.referral_count = referral_count;
    if (referral_revenue !== undefined) updates.referral_revenue = referral_revenue;

    // Email for partner auto-matching (trigger will link to finder_fee_partners)
    if (admin_email !== undefined) updates.admin_email = admin_email;

    // Template tracking
    if (template_used !== undefined) updates.template_used = template_used;

    const { data, error } = await supabase
      .from('fb_page_admins')
      .update(updates)
      .eq('id', admin_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Admin updated successfully!', admin: data });
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ success: false, message: 'Failed to update admin' }, { status: 500 });
  }
}

// POST - Add new admin to existing page
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { page_id, admin_name, admin_profile_url, admin_email } = body;

    if (!page_id || !admin_name) {
      return NextResponse.json({ success: false, message: 'Page ID and admin name are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('fb_page_admins')
      .insert({
        page_id,
        admin_name,
        admin_profile_url: admin_profile_url || null,
        admin_email: admin_email || null,
        is_primary: false,
        response_status: 'not_contacted',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Admin added successfully!', admin: data });
  } catch (error) {
    console.error('Error adding admin:', error);
    return NextResponse.json({ success: false, message: 'Failed to add admin' }, { status: 500 });
  }
}

// DELETE - Remove admin
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const admin_id = searchParams.get('admin_id');

    if (!admin_id) {
      return NextResponse.json({ success: false, message: 'Admin ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('fb_page_admins')
      .delete()
      .eq('id', admin_id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Admin deleted successfully!' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete admin' }, { status: 500 });
  }
}
