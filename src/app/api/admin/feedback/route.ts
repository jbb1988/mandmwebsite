import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const isAuthenticated = await isAdminAuthenticated(request);

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Initialize Supabase client with service role for admin access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('user_feedback')
      .select('*, profiles:user_id(full_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (source && source !== 'all') {
      query = query.eq('source', source);
    }

    const { data: feedback, error, count } = await query;

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    // Transform data for display
    const transformedFeedback = feedback?.map(item => ({
      id: item.id,
      category: item.category,
      source: item.source,
      subject: item.subject,
      message: item.message,
      contact_name: item.contact_name,
      contact_email: item.contact_email,
      user_name: item.profiles?.full_name || null,
      user_email: item.profiles?.email || null,
      app_version: item.app_version,
      device_info: item.device_info,
      url: item.url,
      created_at: item.created_at,
    })) || [];

    return NextResponse.json({
      feedback: transformedFeedback,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Error in admin feedback API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mark feedback as read (future enhancement)
export async function PATCH(request: NextRequest) {
  try {
    // Check admin authentication
    const isAuthenticated = await isAdminAuthenticated(request);

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { feedback_id, is_read } = await request.json();

    if (!feedback_id) {
      return NextResponse.json(
        { error: 'feedback_id is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update feedback
    const { error } = await supabase
      .from('user_feedback')
      .update({ is_read: is_read ?? true })
      .eq('id', feedback_id);

    if (error) {
      console.error('Error updating feedback:', error);
      return NextResponse.json(
        { error: 'Failed to update feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in admin feedback update:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
