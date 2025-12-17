import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { SOCIAL_IMAGE_TEMPLATES } from '@/lib/social-image-generator';

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

// GET: Fetch available templates (all images are pre-generated and static)
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

    // Return templates - all images are pre-generated static files
    return NextResponse.json({
      success: true,
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
    });
  } catch (error) {
    console.error('Error fetching social images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
