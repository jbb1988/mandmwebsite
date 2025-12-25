import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface OperationalCost {
  id: string;
  provider: string;
  monthly_cost: number;
  category: string;
  description: string | null;
  notes: string | null;
  is_variable: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * GET - Fetch all operational costs with aggregations
 */
export async function GET(request: NextRequest) {
  const adminPassword = request.headers.get('X-Admin-Password');
  const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  if (adminPassword !== expectedPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: costs, error } = await supabase
      .from('operational_costs')
      .select('*')
      .eq('is_active', true)
      .order('monthly_cost', { ascending: false });

    if (error) throw error;

    // Calculate aggregations
    const totalFixed = costs?.reduce((sum, cost) =>
      cost.is_variable ? sum : sum + parseFloat(cost.monthly_cost), 0) || 0;

    const byCategory: Record<string, { total: number; providers: string[] }> = {};
    costs?.forEach(cost => {
      if (!byCategory[cost.category]) {
        byCategory[cost.category] = { total: 0, providers: [] };
      }
      if (!cost.is_variable) {
        byCategory[cost.category].total += parseFloat(cost.monthly_cost);
      }
      byCategory[cost.category].providers.push(cost.provider);
    });

    const hasVariableCosts = costs?.some(c => c.is_variable) || false;

    return NextResponse.json({
      success: true,
      costs: costs || [],
      summary: {
        totalFixed,
        totalProviders: costs?.length || 0,
        hasVariableCosts,
        byCategory,
      },
    });
  } catch (error) {
    console.error('Operational costs GET error:', error);
    return NextResponse.json({
      error: 'Failed to fetch operational costs',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * POST - Add a new operational cost
 */
export async function POST(request: NextRequest) {
  const adminPassword = request.headers.get('X-Admin-Password');
  const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  if (adminPassword !== expectedPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await request.json();
    const { provider, monthly_cost, category, description, notes, is_variable } = body;

    if (!provider || monthly_cost === undefined || !category) {
      return NextResponse.json({
        error: 'Missing required fields: provider, monthly_cost, category',
      }, { status: 400 });
    }

    const validCategories = ['infrastructure', 'services', 'tools', 'payments'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('operational_costs')
      .insert({
        provider,
        monthly_cost: parseFloat(monthly_cost),
        category,
        description: description || null,
        notes: notes || null,
        is_variable: is_variable || false,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      cost: data,
    });
  } catch (error) {
    console.error('Operational costs POST error:', error);
    return NextResponse.json({
      error: 'Failed to create operational cost',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * PUT - Update an existing operational cost
 */
export async function PUT(request: NextRequest) {
  const adminPassword = request.headers.get('X-Admin-Password');
  const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  if (adminPassword !== expectedPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await request.json();
    const { id, provider, monthly_cost, category, description, notes, is_variable, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }

    const validCategories = ['infrastructure', 'services', 'tools', 'payments'];
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      }, { status: 400 });
    }

    const updateData: Partial<OperationalCost> = {
      updated_at: new Date().toISOString(),
    };

    if (provider !== undefined) updateData.provider = provider;
    if (monthly_cost !== undefined) updateData.monthly_cost = parseFloat(monthly_cost);
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes;
    if (is_variable !== undefined) updateData.is_variable = is_variable;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('operational_costs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      cost: data,
    });
  } catch (error) {
    console.error('Operational costs PUT error:', error);
    return NextResponse.json({
      error: 'Failed to update operational cost',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * DELETE - Remove an operational cost (soft delete by setting is_active = false)
 */
export async function DELETE(request: NextRequest) {
  const adminPassword = request.headers.get('X-Admin-Password');
  const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_PASSWORD || 'Brutus7862!';

  if (adminPassword !== expectedPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing required parameter: id' }, { status: 400 });
    }

    // Soft delete - set is_active to false
    const { data, error } = await supabase
      .from('operational_costs')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Cost deactivated successfully',
      cost: data,
    });
  } catch (error) {
    console.error('Operational costs DELETE error:', error);
    return NextResponse.json({
      error: 'Failed to delete operational cost',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
