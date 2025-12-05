import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Validate admin password
    const adminPassword = request.headers.get('X-Admin-Password');
    if (adminPassword !== process.env.ADMIN_DASHBOARD_PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transactionId, status, paymentNotes } = body;

    if (!transactionId || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing transactionId or status' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'paid'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current transaction to validate status transition
    const { data: currentTx, error: fetchError } = await supabase
      .from('finder_fees')
      .select('status')
      .eq('id', transactionId)
      .single();

    if (fetchError || !currentTx) {
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      'pending': ['approved', 'paid'],
      'approved': ['paid', 'pending'],
      'paid': ['approved'], // Allow reverting if mistake
    };

    if (!validTransitions[currentTx.status]?.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Cannot change status from ${currentTx.status} to ${status}` },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Add timestamps based on status
    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString();
    } else if (status === 'paid') {
      updateData.paid_at = new Date().toISOString();
      if (paymentNotes) {
        updateData.admin_notes = paymentNotes;
      }
    }

    // Update transaction
    const { error: updateError } = await supabase
      .from('finder_fees')
      .update(updateData)
      .eq('id', transactionId);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      return NextResponse.json(
        { success: false, message: `Database error: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Transaction status updated to ${status}`,
    });
  } catch (error) {
    console.error('Error in update-status route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
