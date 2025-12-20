import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin, verifyAdminWithRateLimit } from '@/lib/admin-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate a random promo code
function generatePromoCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like O, 0, I, 1
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET: List all promo codes with redemption counts
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'trial', 'discount', or null for all
    const status = searchParams.get('status'); // 'active', 'expired', 'depleted', or null for all

    // Fetch all promo codes
    let query = supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by type
    if (type === 'trial') {
      query = query.not('tier_duration_days', 'is', null);
    } else if (type === 'discount') {
      query = query.is('tier_duration_days', null);
    }

    const { data: codes, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get redemption counts for each code
    const { data: redemptions, error: redemptionError } = await supabase
      .from('promo_code_redemptions')
      .select('promo_code');

    if (redemptionError) {
      console.error('Error fetching redemptions:', redemptionError);
    }

    // Count redemptions per code
    const redemptionCounts: Record<string, number> = {};
    (redemptions || []).forEach((r) => {
      redemptionCounts[r.promo_code] = (redemptionCounts[r.promo_code] || 0) + 1;
    });

    // Enrich codes with redemption counts and status
    const now = new Date();
    const enrichedCodes = (codes || []).map((code) => {
      const redemptionCount = redemptionCounts[code.code] || 0;
      const isExpired = code.expires_at && new Date(code.expires_at) < now;
      const isDepleted = code.max_redemptions && redemptionCount >= code.max_redemptions;

      let computedStatus = 'active';
      if (!code.is_active) {
        computedStatus = 'inactive';
      } else if (isExpired) {
        computedStatus = 'expired';
      } else if (isDepleted) {
        computedStatus = 'depleted';
      }

      return {
        ...code,
        redemption_count: redemptionCount,
        computed_status: computedStatus,
        is_trial: code.tier_duration_days !== null,
      };
    });

    // Filter by status if specified
    let filteredCodes = enrichedCodes;
    if (status) {
      filteredCodes = enrichedCodes.filter((c) => c.computed_status === status);
    }

    // Calculate stats
    const stats = {
      total: enrichedCodes.length,
      active: enrichedCodes.filter((c) => c.computed_status === 'active').length,
      expired: enrichedCodes.filter((c) => c.computed_status === 'expired').length,
      depleted: enrichedCodes.filter((c) => c.computed_status === 'depleted').length,
      inactive: enrichedCodes.filter((c) => c.computed_status === 'inactive').length,
      trialCodes: enrichedCodes.filter((c) => c.is_trial).length,
      discountCodes: enrichedCodes.filter((c) => !c.is_trial).length,
    };

    return NextResponse.json({
      success: true,
      codes: filteredCodes,
      stats,
    });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new promo code (rate limited)
export async function POST(request: NextRequest) {
  const auth = await verifyAdminWithRateLimit(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const {
      code: customCode,
      description,
      type, // 'trial' or 'discount'
      discount_percent,
      tier_duration_days,
      max_redemptions,
      expires_at,
    } = body;

    // Generate code if not provided
    const code = customCode?.toUpperCase().trim() || generatePromoCode();

    // Validate based on type
    if (type === 'trial') {
      if (!tier_duration_days || tier_duration_days < 1) {
        return NextResponse.json({ error: 'Trial codes require tier_duration_days >= 1' }, { status: 400 });
      }
    } else if (type === 'discount') {
      if (!discount_percent || discount_percent < 1 || discount_percent > 100) {
        return NextResponse.json({ error: 'Discount codes require discount_percent between 1-100' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Type must be "trial" or "discount"' }, { status: 400 });
    }

    // Check if code already exists
    const { data: existing } = await supabase
      .from('promo_codes')
      .select('code')
      .eq('code', code)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'A promo code with this code already exists' }, { status: 400 });
    }

    // Create the promo code
    const promoCodeData: Record<string, unknown> = {
      code,
      description: description || (type === 'trial' ? `${tier_duration_days}-Day Pro Trial` : `${discount_percent}% Discount`),
      is_active: true,
      max_redemptions: max_redemptions || null,
      expires_at: expires_at || null,
      created_at: new Date().toISOString(),
    };

    if (type === 'trial') {
      promoCodeData.grants_tier = 'pro';
      promoCodeData.tier_duration_days = tier_duration_days;
      promoCodeData.discount_percent = null;
    } else {
      promoCodeData.discount_percent = discount_percent;
      promoCodeData.grants_tier = null;
      promoCodeData.tier_duration_days = null;
    }

    const { data: newCode, error } = await supabase
      .from('promo_codes')
      .insert(promoCodeData)
      .select()
      .single();

    if (error) {
      console.error('Error creating promo code:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      code: newCode,
      message: `Promo code ${code} created successfully`,
    });
  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update a promo code (rate limited)
export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminWithRateLimit(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { code, updates } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Only allow updating certain fields
    const allowedFields = ['description', 'is_active', 'max_redemptions', 'expires_at'];
    const filteredUpdates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: updatedCode, error } = await supabase
      .from('promo_codes')
      .update(filteredUpdates)
      .eq('code', code)
      .select()
      .single();

    if (error) {
      console.error('Error updating promo code:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      code: updatedCode,
      message: `Promo code ${code} updated successfully`,
    });
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a promo code (rate limited)
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminWithRateLimit(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Check if there are any redemptions
    const { count } = await supabase
      .from('promo_code_redemptions')
      .select('*', { count: 'exact', head: true })
      .eq('promo_code', code);

    if (count && count > 0) {
      // Don't delete, just deactivate
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: false })
        .eq('code', code);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Promo code ${code} has ${count} redemptions and was deactivated instead of deleted`,
        deactivated: true,
      });
    }

    // Delete the code
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('code', code);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Promo code ${code} deleted successfully`,
      deleted: true,
    });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
