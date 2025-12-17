import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { generatePartnerBanners } from '@/lib/banner-generator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Decrypt session cookie
const ENCRYPTION_KEY = process.env.PARTNER_SESSION_SECRET || 'partner-session-secret-key-32ch';

function decryptEmail(encrypted: string): string | null {
  try {
    const [ivHex, encryptedHex] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
      iv
    );
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return null;
  }
}

// POST: Upload logo and regenerate banners
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('partner_session');

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = decryptEmail(sessionCookie.value);
    if (!email) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Fetch partner data
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('name, first_name, email, referral_url, logo_url')
      .eq('email', email)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    if (!partner.referral_url) {
      return NextResponse.json({ error: 'No referral URL found. Please contact support.' }, { status: 400 });
    }

    const body = await request.json();
    const { logoDataUrl } = body as { logoDataUrl?: string };

    let logoUrl = partner.logo_url;

    // If new logo provided, upload it
    if (logoDataUrl && logoDataUrl.startsWith('data:image/')) {
      // Extract base64 data
      const matches = logoDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json({ error: 'Invalid logo format' }, { status: 400 });
      }

      const [, ext, base64Data] = matches;
      const buffer = Buffer.from(base64Data, 'base64');

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `partner-logos/${email.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}.${ext}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('partner-banners')
        .upload(filename, buffer, {
          contentType: `image/${ext}`,
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('partner-banners')
        .getPublicUrl(filename);

      logoUrl = urlData.publicUrl;

      // Update partner record with new logo URL
      await supabase
        .from('partners')
        .update({ logo_url: logoUrl })
        .eq('email', email);
    }

    if (!logoUrl) {
      return NextResponse.json({ error: 'No logo available. Please upload a logo first.' }, { status: 400 });
    }

    // Generate banners with the logo
    console.log(`Regenerating banners for partner ${email} with logo: ${logoUrl}`);
    const bannerUrls = await generatePartnerBanners({
      partnerName: partner.name,
      partnerEmail: email,
      partnerLogoUrl: logoUrl,
      referralUrl: partner.referral_url,
    });

    if (!bannerUrls) {
      return NextResponse.json({ error: 'Failed to generate banners' }, { status: 500 });
    }

    // Update partner_banners table
    const { error: upsertError } = await supabase
      .from('partner_banners')
      .upsert({
        partner_email: email,
        partner_name: partner.name,
        partner_logo_url: logoUrl,
        qr_code_url: bannerUrls.qrCodeUrl,
        banner_partner_url: bannerUrls.bannerPartnerUrl,
        banner_facebook_url: bannerUrls.bannerFacebookUrl,
        banner_facebook_cobranded_url: bannerUrls.bannerFacebookCoBrandedUrl,
        banner_twitter_url: bannerUrls.bannerTwitterUrl,
        banner_twitter_cobranded_url: bannerUrls.bannerTwitterCoBrandedUrl,
        notes: 'Regenerated from partner dashboard',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'partner_email',
      });

    if (upsertError) {
      console.error('Error saving banners to database:', upsertError);
    }

    // Update partners table with banner URLs
    await supabase
      .from('partners')
      .update({
        qr_code_url: bannerUrls.qrCodeUrl,
        banner_url: bannerUrls.bannerPartnerUrl,
        banner_facebook_url: bannerUrls.bannerFacebookUrl,
        banner_facebook_cobranded_url: bannerUrls.bannerFacebookCoBrandedUrl,
        banner_twitter_url: bannerUrls.bannerTwitterUrl,
        banner_twitter_cobranded_url: bannerUrls.bannerTwitterCoBrandedUrl,
      })
      .eq('email', email);

    return NextResponse.json({
      success: true,
      message: 'Banners regenerated successfully',
      banners: {
        qrCodeUrl: bannerUrls.qrCodeUrl,
        bannerUrl: bannerUrls.bannerPartnerUrl,
        bannerFacebookUrl: bannerUrls.bannerFacebookUrl,
        bannerFacebookCobrandedUrl: bannerUrls.bannerFacebookCoBrandedUrl,
        bannerTwitterUrl: bannerUrls.bannerTwitterUrl,
        bannerTwitterCobrandedUrl: bannerUrls.bannerTwitterCoBrandedUrl,
      },
      logoUrl,
    });
  } catch (error) {
    console.error('Error regenerating banners:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
