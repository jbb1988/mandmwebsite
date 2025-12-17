import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import {
  generateSocialImages,
  generateSingleImage,
  SOCIAL_IMAGE_TEMPLATES,
  PlatformFormat,
} from '@/lib/social-image-generator';

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

// GET: Fetch available templates and partner's existing generated images
export async function GET(request: NextRequest) {
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
      .select('name, first_name, email, referral_url')
      .eq('email', email)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Check if partner has generated images before
    const { data: existingImages } = await supabase
      .from('partner_social_images')
      .select('*')
      .eq('partner_email', email)
      .order('created_at', { ascending: false });

    // Return templates and any existing images
    return NextResponse.json({
      success: true,
      partner: {
        name: partner.name,
        firstName: partner.first_name,
        email: partner.email,
        referralUrl: partner.referral_url,
      },
      templates: SOCIAL_IMAGE_TEMPLATES.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        style: t.style,
        headline: t.headline,
        subheadline: t.subheadline,
        primaryColor: t.primaryColor,
        accentColor: t.accentColor,
        bestFor: t.bestFor,
        badgeText: t.badgeText,
        seasonal: t.seasonal,
        activeMonths: t.activeMonths,
      })),
      existingImages: existingImages || [],
    });
  } catch (error) {
    console.error('Error fetching social images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Generate social images for the partner
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
      .select('name, first_name, email, referral_url')
      .eq('email', email)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      templateIds,
      formats = ['feed_square', 'feed_portrait', 'story', 'twitter', 'linkedin'],
      regenerate = false,
    } = body as {
      templateIds?: string[];
      formats?: PlatformFormat[];
      regenerate?: boolean;
    };

    // Use first name if available, otherwise full name
    const displayName = partner.first_name || partner.name.split(' ')[0];

    // Generate images
    const result = await generateSocialImages({
      partnerName: displayName,
      partnerEmail: email,
      referralUrl: partner.referral_url,
      templateIds,
      formats,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate images' },
        { status: 500 }
      );
    }

    // Store image records in database for tracking
    if (result.images.length > 0) {
      // Delete old records if regenerating
      if (regenerate) {
        await supabase
          .from('partner_social_images')
          .delete()
          .eq('partner_email', email);
      }

      // Insert new records
      const records = result.images.map(img => ({
        partner_email: email,
        template_id: img.templateId,
        format: img.format,
        url: img.url,
        width: img.width,
        height: img.height,
        created_at: new Date().toISOString(),
      }));

      await supabase.from('partner_social_images').insert(records);
    }

    return NextResponse.json({
      success: true,
      images: result.images,
      message: `Generated ${result.images.length} images successfully`,
    });
  } catch (error) {
    console.error('Error generating social images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Generate a single preview image (for live preview in dashboard)
export async function PUT(request: NextRequest) {
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
      .select('name, first_name, email, referral_url')
      .eq('email', email)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    const body = await request.json();
    const { templateId, format = 'feed_square' } = body as {
      templateId: string;
      format?: PlatformFormat;
    };

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
    }

    const displayName = partner.first_name || partner.name.split(' ')[0];

    // Generate single preview image
    const result = await generateSingleImage({
      templateId,
      partnerName: displayName,
      referralUrl: partner.referral_url,
      format,
    });

    if (!result.success || !result.buffer) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate preview' },
        { status: 500 }
      );
    }

    // Return as base64 for quick preview
    const base64 = result.buffer.toString('base64');
    return NextResponse.json({
      success: true,
      preview: `data:image/png;base64,${base64}`,
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
