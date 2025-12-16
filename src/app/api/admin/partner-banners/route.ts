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

// Helper function to upload a file to storage
async function uploadToStorage(
  supabase: ReturnType<typeof createClient>,
  blob: Blob,
  path: string
): Promise<string | null> {
  const buffer = Buffer.from(await blob.arrayBuffer());
  const { error } = await supabase.storage
    .from('partner-banners')
    .upload(path, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    console.error(`Error uploading ${path}:`, error);
    return null;
  }

  const { data } = supabase.storage.from('partner-banners').getPublicUrl(path);
  return data.publicUrl;
}

// POST - Save all partner banners and assets
export async function POST(request: NextRequest) {
  try {
    // Validate admin password
    const adminPassword = request.headers.get('X-Admin-Password');
    const expectedPassword = process.env.ADMIN_DASHBOARD_PASSWORD;

    if (adminPassword !== expectedPassword) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const partnerName = formData.get('partnerName') as string;
    const partnerEmail = formData.get('partnerEmail') as string;
    const notes = formData.get('notes') as string | null;

    // All banner types
    const bannerPartner = formData.get('bannerPartner') as Blob | null;
    const bannerFacebook = formData.get('bannerFacebook') as Blob | null;
    const bannerFacebookCoBranded = formData.get('bannerFacebookCoBranded') as Blob | null;
    const bannerTwitter = formData.get('bannerTwitter') as Blob | null;
    const bannerTwitterCoBranded = formData.get('bannerTwitterCoBranded') as Blob | null;

    // Original assets
    const logoBlob = formData.get('logo') as Blob | null;
    const qrBlob = formData.get('qrCode') as Blob | null;

    if (!partnerName || !partnerEmail) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: partnerName, partnerEmail' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const timestamp = Date.now();
    const sanitizedName = partnerName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const baseFolder = `${sanitizedName}-${timestamp}`;

    // Upload all assets in parallel
    const uploadPromises: Promise<{ key: string; url: string | null }>[] = [];

    if (logoBlob) {
      uploadPromises.push(
        uploadToStorage(supabase, logoBlob, `${baseFolder}/logo.png`)
          .then(url => ({ key: 'partner_logo_url', url }))
      );
    }

    if (qrBlob) {
      uploadPromises.push(
        uploadToStorage(supabase, qrBlob, `${baseFolder}/qr-code.png`)
          .then(url => ({ key: 'qr_code_url', url }))
      );
    }

    if (bannerPartner) {
      uploadPromises.push(
        uploadToStorage(supabase, bannerPartner, `${baseFolder}/banner-partner.png`)
          .then(url => ({ key: 'banner_partner_url', url }))
      );
    }

    if (bannerFacebook) {
      uploadPromises.push(
        uploadToStorage(supabase, bannerFacebook, `${baseFolder}/banner-facebook.png`)
          .then(url => ({ key: 'banner_facebook_url', url }))
      );
    }

    if (bannerFacebookCoBranded) {
      uploadPromises.push(
        uploadToStorage(supabase, bannerFacebookCoBranded, `${baseFolder}/banner-facebook-cobranded.png`)
          .then(url => ({ key: 'banner_facebook_cobranded_url', url }))
      );
    }

    if (bannerTwitter) {
      uploadPromises.push(
        uploadToStorage(supabase, bannerTwitter, `${baseFolder}/banner-twitter.png`)
          .then(url => ({ key: 'banner_twitter_url', url }))
      );
    }

    if (bannerTwitterCoBranded) {
      uploadPromises.push(
        uploadToStorage(supabase, bannerTwitterCoBranded, `${baseFolder}/banner-twitter-cobranded.png`)
          .then(url => ({ key: 'banner_twitter_cobranded_url', url }))
      );
    }

    // Wait for all uploads
    const uploadResults = await Promise.all(uploadPromises);

    // Build the database record
    const dbRecord: Record<string, string | null> = {
      partner_name: partnerName,
      partner_email: partnerEmail,
      notes: notes || null,
      partner_logo_url: null,
      qr_code_url: null,
      banner_partner_url: null,
      banner_facebook_url: null,
      banner_facebook_cobranded_url: null,
      banner_twitter_url: null,
      banner_twitter_cobranded_url: null,
    };

    // Populate URLs from upload results
    for (const result of uploadResults) {
      if (result.url) {
        dbRecord[result.key] = result.url;
      }
    }

    // Save to database
    const { data, error: dbError } = await supabase
      .from('partner_banners')
      .insert(dbRecord)
      .select()
      .single();

    if (dbError) {
      console.error('Error saving banner to database:', dbError);
      return NextResponse.json(
        { success: false, message: `Failed to save banner: ${dbError.message}` },
        { status: 500 }
      );
    }

    // Count what was saved
    const savedCount = uploadResults.filter(r => r.url).length;

    return NextResponse.json({
      success: true,
      message: `Saved ${savedCount} assets successfully`,
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
