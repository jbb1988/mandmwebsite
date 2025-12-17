import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simple encryption for session cookie (in production, use proper JWT or encryption library)
const ENCRYPTION_KEY = process.env.PARTNER_SESSION_SECRET || 'partner-session-secret-key-32ch';

function encryptEmail(email: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let encrypted = cipher.update(email, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptEmail(encrypted: string): string | null {
  try {
    const [ivHex, encryptedHex] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find the session
    const { data: session, error: sessionError } = await supabase
      .from('partner_sessions')
      .select('*')
      .eq('token', token)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid or expired login link' },
        { status: 401 }
      );
    }

    // Check if already used
    if (session.used) {
      return NextResponse.json(
        { error: 'This login link has already been used' },
        { status: 401 }
      );
    }

    // Check if expired
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This login link has expired' },
        { status: 401 }
      );
    }

    // Mark as used
    await supabase
      .from('partner_sessions')
      .update({ used: true })
      .eq('id', session.id);

    // Fetch partner data
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('name, first_name, email, referral_url, referral_slug, tolt_partner_id')
      .eq('email', session.partner_email)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Fetch partner's QR code from partner_banners
    const { data: banners } = await supabase
      .from('partner_banners')
      .select('qr_code_url, banner_url')
      .eq('partner_email', session.partner_email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Create encrypted session value
    const sessionValue = encryptEmail(session.partner_email);

    // Create response with partner data
    const response = NextResponse.json({
      success: true,
      partner: {
        name: partner.name,
        firstName: partner.first_name,
        email: partner.email,
        referralUrl: partner.referral_url,
        referralSlug: partner.referral_slug,
        toltPartnerId: partner.tolt_partner_id,
        qrCodeUrl: banners?.qr_code_url || null,
        bannerUrl: banners?.banner_url || null
      }
    });

    // Set httpOnly session cookie (7 days)
    response.cookies.set('partner_session', sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Error in verify-magic-link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check current session
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('partner_session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const email = decryptEmail(sessionCookie.value);

    if (!email) {
      return NextResponse.json(
        { authenticated: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Fetch partner data
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('name, first_name, email, referral_url, referral_slug, tolt_partner_id')
      .eq('email', email)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        { authenticated: false, error: 'Partner not found' },
        { status: 401 }
      );
    }

    // Fetch partner's QR code
    const { data: banners } = await supabase
      .from('partner_banners')
      .select('qr_code_url, banner_url')
      .eq('partner_email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      authenticated: true,
      partner: {
        name: partner.name,
        firstName: partner.first_name,
        email: partner.email,
        referralUrl: partner.referral_url,
        referralSlug: partner.referral_slug,
        toltPartnerId: partner.tolt_partner_id,
        qrCodeUrl: banners?.qr_code_url || null,
        bannerUrl: banners?.banner_url || null
      }
    });

  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to logout (clear cookie)
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('partner_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });
  return response;
}
