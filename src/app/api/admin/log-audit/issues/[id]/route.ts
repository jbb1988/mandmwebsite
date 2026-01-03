import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }
    }

    if (body.resolution_notes !== undefined) {
      updateData.resolution_notes = body.resolution_notes;
    }

    if (body.suppress_alerts !== undefined) {
      updateData.suppress_alerts = body.suppress_alerts;
    }

    const { data, error } = await supabase
      .from('log_audit_issues')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating log audit issue:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
