import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET - List/search partner banners
export async function GET(request: NextRequest) {
  try {
    // Validate admin password
    const adminPassword = request.headers.get('X-Admin-Password');
    if (adminPassword !== process.env.ADMIN_DASHBOARD_PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * pageSize;

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build query
    let query = supabase
      .from('partner_banners')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(`partner_name.ilike.%${search}%,partner_email.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching partner banners:', error);
      return NextResponse.json(
        { success: false, message: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      banners: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error('Error in partner-banners GET:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save a new partner banner
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

    const formData = await request.formData();

    const partnerName = formData.get('partnerName') as string;
    const partnerEmail = formData.get('partnerEmail') as string;
    const notes = formData.get('notes') as string | null;
    const bannerBlob = formData.get('banner') as Blob | null;
    const logoBlob = formData.get('logo') as Blob | null;
    const qrBlob = formData.get('qrCode') as Blob | null;

    if (!partnerName || !partnerEmail || !bannerBlob) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: partnerName, partnerEmail, banner' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const timestamp = Date.now();
    const sanitizedName = partnerName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Upload banner to storage
    const bannerPath = `banners/${sanitizedName}-${timestamp}.png`;
    const bannerBuffer = Buffer.from(await bannerBlob.arrayBuffer());

    const { error: bannerUploadError } = await supabase.storage
      .from('partner-banners')
      .upload(bannerPath, bannerBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (bannerUploadError) {
      console.error('Error uploading banner:', bannerUploadError);
      return NextResponse.json(
        { success: false, message: `Failed to upload banner: ${bannerUploadError.message}` },
        { status: 500 }
      );
    }

    const { data: bannerUrlData } = supabase.storage
      .from('partner-banners')
      .getPublicUrl(bannerPath);
    const bannerUrl = bannerUrlData.publicUrl;

    // Upload logo if provided
    let logoUrl: string | null = null;
    if (logoBlob) {
      const logoPath = `logos/${sanitizedName}-${timestamp}.png`;
      const logoBuffer = Buffer.from(await logoBlob.arrayBuffer());

      const { error: logoUploadError } = await supabase.storage
        .from('partner-banners')
        .upload(logoPath, logoBuffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (!logoUploadError) {
        const { data: logoUrlData } = supabase.storage
          .from('partner-banners')
          .getPublicUrl(logoPath);
        logoUrl = logoUrlData.publicUrl;
      }
    }

    // Upload QR code if provided
    let qrCodeUrl: string | null = null;
    if (qrBlob) {
      const qrPath = `qr-codes/${sanitizedName}-${timestamp}.png`;
      const qrBuffer = Buffer.from(await qrBlob.arrayBuffer());

      const { error: qrUploadError } = await supabase.storage
        .from('partner-banners')
        .upload(qrPath, qrBuffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (!qrUploadError) {
        const { data: qrUrlData } = supabase.storage
          .from('partner-banners')
          .getPublicUrl(qrPath);
        qrCodeUrl = qrUrlData.publicUrl;
      }
    }

    // Save to database
    const { data, error: dbError } = await supabase
      .from('partner_banners')
      .insert({
        partner_name: partnerName,
        partner_email: partnerEmail,
        partner_logo_url: logoUrl,
        qr_code_url: qrCodeUrl,
        banner_url: bannerUrl,
        notes: notes || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving banner to database:', dbError);
      return NextResponse.json(
        { success: false, message: `Failed to save banner: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Banner saved successfully',
      banner: data,
    });
  } catch (error) {
    console.error('Error in partner-banners POST:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a partner banner
export async function DELETE(request: NextRequest) {
  try {
    // Validate admin password
    const adminPassword = request.headers.get('X-Admin-Password');
    if (adminPassword !== process.env.ADMIN_DASHBOARD_PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing banner ID' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the banner first to delete associated files
    const { data: banner, error: fetchError } = await supabase
      .from('partner_banners')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !banner) {
      return NextResponse.json(
        { success: false, message: 'Banner not found' },
        { status: 404 }
      );
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('partner_banners')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting banner:', deleteError);
      return NextResponse.json(
        { success: false, message: `Failed to delete banner: ${deleteError.message}` },
        { status: 500 }
      );
    }

    // Note: We could also delete the files from storage here,
    // but keeping them for now in case we need audit trail

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    console.error('Error in partner-banners DELETE:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
