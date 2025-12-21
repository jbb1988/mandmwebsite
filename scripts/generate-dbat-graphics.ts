import satori from 'satori';
import sharp from 'sharp';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Load fonts for satori
async function loadFonts(): Promise<{ bold: ArrayBuffer; boldItalic: ArrayBuffer }> {
  const baseUrl = 'https://mindandmuscle.ai/fonts';
  const [boldResponse, boldItalicResponse] = await Promise.all([
    fetch(`${baseUrl}/Inter-Bold.otf`),
    fetch(`${baseUrl}/Inter-BoldItalic.otf`),
  ]);
  return {
    bold: await boldResponse.arrayBuffer(),
    boldItalic: await boldItalicResponse.arrayBuffer(),
  };
}

// Fetch image as base64 data URL
async function fetchImageAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const contentType = response.headers.get('content-type') || 'image/png';
  return `data:${contentType};base64,${base64}`;
}

// Generate QR code with M&M logo in center
async function generateQRCode(url: string): Promise<string> {
  const qrBuffer = await QRCode.toBuffer(url, {
    width: 400,
    margin: 1,
    errorCorrectionLevel: 'H',
    color: { dark: '#000000', light: '#ffffff' },
  });

  const logoUrl = 'https://mindandmuscle.ai/assets/images/icon-192.png';
  try {
    const logoResponse = await fetch(logoUrl);
    if (logoResponse.ok) {
      const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
      const logoSize = 100;
      const resizedLogo = await sharp(logoBuffer)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toBuffer();

      const circleSize = logoSize + 12;
      const circleSvg = `<svg width="${circleSize}" height="${circleSize}">
        <circle cx="${circleSize/2}" cy="${circleSize/2}" r="${circleSize/2}" fill="white"/>
      </svg>`;

      const qrWithLogo = await sharp(qrBuffer)
        .composite([
          { input: Buffer.from(circleSvg), top: Math.floor((400 - circleSize) / 2), left: Math.floor((400 - circleSize) / 2) },
          { input: resizedLogo, top: Math.floor((400 - logoSize) / 2), left: Math.floor((400 - logoSize) / 2) },
        ])
        .png()
        .toBuffer();

      return `data:image/png;base64,${qrWithLogo.toString('base64')}`;
    }
  } catch (err) {
    console.error('Error adding logo to QR:', err);
  }
  return `data:image/png;base64,${qrBuffer.toString('base64')}`;
}

// Upload to Supabase Storage
async function uploadToStorage(buffer: Buffer, storagePath: string): Promise<string | null> {
  const { error } = await supabase.storage
    .from('partner-banners')
    .upload(storagePath, buffer, { contentType: 'image/png', upsert: true });

  if (error) {
    console.error(`Error uploading ${storagePath}:`, error);
    return null;
  }

  const { data } = supabase.storage.from('partner-banners').getPublicUrl(storagePath);
  return data.publicUrl;
}

// =============================================================================
// D-BAT TUNNEL POSTER - 11x17 inch (3300x5100 at 300 DPI, using 1650x2550 for web)
// =============================================================================
function createTunnelPoster(qrCodeDataUrl: string, dbatLogoDataUrl: string, mmLogoDataUrl: string) {
  return {
    type: 'div',
    props: {
      style: {
        width: 1650,
        height: 2550,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 80,
        fontFamily: 'Inter',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      },
      children: [
        // TOP: Dual Logo Section
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 40,
              marginTop: 40,
            },
            children: [
              {
                type: 'img',
                props: {
                  src: dbatLogoDataUrl,
                  style: { height: 140, objectFit: 'contain' },
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: 48, color: 'rgba(255,255,255,0.5)', fontWeight: 300, display: 'flex' },
                  children: '×',
                },
              },
              {
                type: 'img',
                props: {
                  src: mmLogoDataUrl,
                  style: { height: 140, objectFit: 'contain' },
                },
              },
            ],
          },
        },
        // Partner badge
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              background: 'linear-gradient(135deg, #003366 0%, #228B22 100%)',
              padding: '16px 40px',
              borderRadius: 12,
              marginTop: 20,
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontSize: 24, color: 'white', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', display: 'flex' },
                  children: 'Official Training Partner',
                },
              },
            ],
          },
        },
        // HEADLINE
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 60,
            },
            children: [
              {
                type: 'span',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: 72,
                    fontWeight: 900,
                    fontStyle: 'italic',
                    textTransform: 'uppercase',
                    color: '#0EA5E9',
                    letterSpacing: -2,
                    lineHeight: 1.1,
                  },
                  children: 'DISCIPLINE THE MIND.',
                },
              },
              {
                type: 'span',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: 72,
                    fontWeight: 900,
                    fontStyle: 'italic',
                    textTransform: 'uppercase',
                    color: '#F97316',
                    letterSpacing: -2,
                    lineHeight: 1.1,
                    marginTop: 12,
                  },
                  children: 'DOMINATE THE GAME.',
                },
              },
            ],
          },
        },
        // Feature list
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
              marginTop: 60,
              padding: '0 40px',
            },
            children: [
              { type: 'span', props: { style: { display: 'flex', fontSize: 32, color: 'white', fontWeight: 500 }, children: '✓ AI-Powered Mental Training' } },
              { type: 'span', props: { style: { display: 'flex', fontSize: 32, color: 'white', fontWeight: 500 }, children: '✓ Swing & Pitch Analysis' } },
              { type: 'span', props: { style: { display: 'flex', fontSize: 32, color: 'white', fontWeight: 500 }, children: '✓ 186 Game Scenarios' } },
              { type: 'span', props: { style: { display: 'flex', fontSize: 32, color: 'white', fontWeight: 500 }, children: '✓ Pre-Lesson Focus Routines' } },
            ],
          },
        },
        // QR CODE SECTION
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 80,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    backgroundColor: 'white',
                    borderRadius: 24,
                    padding: 32,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: qrCodeDataUrl,
                        style: { width: 500, height: 500 },
                      },
                    },
                  ],
                },
              },
              {
                type: 'span',
                props: {
                  style: { display: 'flex', fontSize: 36, color: 'white', fontWeight: 700, marginTop: 40, textTransform: 'uppercase', letterSpacing: 3 },
                  children: 'SCAN TO GET STARTED',
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 },
                  children: [
                    { type: 'span', props: { style: { display: 'flex', fontSize: 40, color: 'white', fontWeight: 800 }, children: 'TRY IT' } },
                    { type: 'span', props: { style: { display: 'flex', fontSize: 40, color: '#22C55E', fontWeight: 900 }, children: 'FREE' } },
                  ],
                },
              },
            ],
          },
        },
        // Footer
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 60,
              marginBottom: 20,
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { display: 'flex', fontSize: 24, color: 'rgba(255,255,255,0.6)', fontWeight: 400 },
                  children: 'mindandmuscle.ai/dbat',
                },
              },
            ],
          },
        },
      ],
    },
  };
}

// =============================================================================
// D-BAT EMAIL HEADER - 600x200
// =============================================================================
function createEmailHeader(dbatLogoDataUrl: string, mmLogoDataUrl: string) {
  return {
    type: 'div',
    props: {
      style: {
        width: 600,
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #003366 0%, #228B22 100%)',
        fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: 24 },
            children: [
              { type: 'img', props: { src: dbatLogoDataUrl, style: { height: 80, objectFit: 'contain' } } },
              { type: 'span', props: { style: { display: 'flex', fontSize: 32, color: 'rgba(255,255,255,0.6)', fontWeight: 300 }, children: '×' } },
              { type: 'img', props: { src: mmLogoDataUrl, style: { height: 80, objectFit: 'contain' } } },
            ],
          },
        },
      ],
    },
  };
}

// =============================================================================
// D-BAT SOCIAL BANNER - 1200x630 (Facebook/LinkedIn)
// =============================================================================
function createSocialBanner(qrCodeDataUrl: string, dbatLogoDataUrl: string, mmLogoDataUrl: string) {
  return {
    type: 'div',
    props: {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        fontFamily: 'Inter',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      },
      children: [
        // Left side - content
        {
          type: 'div',
          props: {
            style: {
              width: '65%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: 60,
            },
            children: [
              // Dual logos
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 },
                  children: [
                    { type: 'img', props: { src: dbatLogoDataUrl, style: { height: 70, objectFit: 'contain' } } },
                    { type: 'span', props: { style: { display: 'flex', fontSize: 24, color: 'rgba(255,255,255,0.5)' }, children: '×' } },
                    { type: 'img', props: { src: mmLogoDataUrl, style: { height: 70, objectFit: 'contain' } } },
                  ],
                },
              },
              // Headline
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { display: 'flex', fontSize: 48, fontWeight: 900, fontStyle: 'italic', color: '#0EA5E9', textTransform: 'uppercase', lineHeight: 1.1 },
                        children: 'Discipline the Mind.',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { display: 'flex', fontSize: 48, fontWeight: 900, fontStyle: 'italic', color: '#F97316', textTransform: 'uppercase', lineHeight: 1.1 },
                        children: 'Dominate the Game.',
                      },
                    },
                  ],
                },
              },
              // Subhead
              {
                type: 'span',
                props: {
                  style: { display: 'flex', fontSize: 22, color: 'rgba(255,255,255,0.8)', marginTop: 24, fontWeight: 500 },
                  children: 'AI Training for Baseball & Softball Athletes',
                },
              },
            ],
          },
        },
        // Right side - QR
        {
          type: 'div',
          props: {
            style: {
              width: '35%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', backgroundColor: 'white', borderRadius: 16, padding: 20, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' },
                  children: [{ type: 'img', props: { src: qrCodeDataUrl, style: { width: 200, height: 200 } } }],
                },
              },
              { type: 'span', props: { style: { display: 'flex', fontSize: 18, color: 'white', fontWeight: 600, marginTop: 16 }, children: 'Scan to Start' } },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 },
                  children: [
                    { type: 'span', props: { style: { display: 'flex', fontSize: 20, color: 'white', fontWeight: 700 }, children: 'Try it' } },
                    { type: 'span', props: { style: { display: 'flex', fontSize: 20, color: '#22C55E', fontWeight: 800 }, children: 'FREE' } },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

// Main function
async function generateDbatGraphics() {
  console.log('🎨 Generating D-BAT Graphics...\n');

  const dbatUrl = 'https://mindandmuscle.ai/dbat';
  const dbatLogoUrl = 'https://mindandmuscle.ai/assets/images/dbat-logo.png';
  const mmLogoUrl = 'https://api.mindandmuscle.ai/storage/v1/object/public/media-thumbnails/New%20MM%20Logo-transparent%20(1).png';

  // Load fonts
  const { bold: fontData, boldItalic: fontDataItalic } = await loadFonts();
  const fonts = [
    { name: 'Inter', data: fontData, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: fontData, weight: 500 as const, style: 'normal' as const },
    { name: 'Inter', data: fontData, weight: 600 as const, style: 'normal' as const },
    { name: 'Inter', data: fontData, weight: 700 as const, style: 'normal' as const },
    { name: 'Inter', data: fontData, weight: 800 as const, style: 'normal' as const },
    { name: 'Inter', data: fontData, weight: 900 as const, style: 'normal' as const },
    { name: 'Inter', data: fontDataItalic, weight: 700 as const, style: 'italic' as const },
    { name: 'Inter', data: fontDataItalic, weight: 800 as const, style: 'italic' as const },
    { name: 'Inter', data: fontDataItalic, weight: 900 as const, style: 'italic' as const },
  ];

  // Fetch assets
  const [qrCodeDataUrl, dbatLogoDataUrl, mmLogoDataUrl] = await Promise.all([
    generateQRCode(dbatUrl),
    fetchImageAsDataUrl(dbatLogoUrl),
    fetchImageAsDataUrl(mmLogoUrl),
  ]);
  console.log('✅ Loaded QR code and logos\n');

  const baseFolder = 'dbat-campaign';
  const results: Record<string, string | null> = {};

  // 1. Generate Tunnel Poster
  console.log('📄 Generating tunnel poster...');
  const posterSvg = await satori(createTunnelPoster(qrCodeDataUrl, dbatLogoDataUrl, mmLogoDataUrl) as any, {
    width: 1650,
    height: 2550,
    fonts,
  });
  const posterPng = await sharp(Buffer.from(posterSvg)).png().toBuffer();
  results.tunnelPoster = await uploadToStorage(posterPng, `${baseFolder}/dbat-tunnel-poster.png`);
  console.log('   ✅ Tunnel poster uploaded');

  // 2. Generate Email Header
  console.log('📧 Generating email header...');
  const headerSvg = await satori(createEmailHeader(dbatLogoDataUrl, mmLogoDataUrl) as any, {
    width: 600,
    height: 200,
    fonts,
  });
  const headerPng = await sharp(Buffer.from(headerSvg)).png().toBuffer();
  results.emailHeader = await uploadToStorage(headerPng, `${baseFolder}/dbat-email-header.png`);
  console.log('   ✅ Email header uploaded');

  // 3. Generate Social Banner
  console.log('📱 Generating social banner...');
  const socialSvg = await satori(createSocialBanner(qrCodeDataUrl, dbatLogoDataUrl, mmLogoDataUrl) as any, {
    width: 1200,
    height: 630,
    fonts,
  });
  const socialPng = await sharp(Buffer.from(socialSvg)).png().toBuffer();
  results.socialBanner = await uploadToStorage(socialPng, `${baseFolder}/dbat-social-banner.png`);
  console.log('   ✅ Social banner uploaded');

  // 4. Upload standalone QR code
  console.log('🔗 Uploading QR code...');
  const qrBase64 = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
  const qrBuffer = Buffer.from(qrBase64, 'base64');
  results.qrCode = await uploadToStorage(qrBuffer, `${baseFolder}/dbat-qr-code.png`);
  console.log('   ✅ QR code uploaded');

  console.log('\n🎉 D-BAT Graphics Generated Successfully!\n');
  console.log('Asset URLs:');
  Object.entries(results).forEach(([key, url]) => {
    console.log(`  ${key}: ${url}`);
  });

  return results;
}

// Run the script
generateDbatGraphics()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
