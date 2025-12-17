import satori from 'satori';
import sharp from 'sharp';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';
import {
  SOCIAL_IMAGE_TEMPLATES,
  SocialImageTemplate,
  TemplateStyle,
  TemplateCategory,
  GradientPreset,
} from './social-image-templates';

// Re-export types for convenience
export type { TemplateStyle, TemplateCategory, GradientPreset, SocialImageTemplate };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type PlatformFormat = 'feed_square' | 'feed_portrait' | 'story' | 'twitter' | 'linkedin';

export interface PlatformDimensions {
  width: number;
  height: number;
  safeZone: { top: number; right: number; bottom: number; left: number };
}

export interface GeneratedImage {
  templateId: string;
  format: PlatformFormat;
  url: string;
  width: number;
  height: number;
}

export interface GenerationResult {
  success: boolean;
  images: GeneratedImage[];
  error?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const PLATFORM_DIMENSIONS: Record<PlatformFormat, PlatformDimensions> = {
  feed_square: {
    width: 1080,
    height: 1080,
    safeZone: { top: 108, right: 108, bottom: 108, left: 108 }, // 10% padding
  },
  feed_portrait: {
    width: 1080,
    height: 1350,
    safeZone: { top: 108, right: 108, bottom: 135, left: 108 },
  },
  story: {
    width: 1080,
    height: 1920,
    safeZone: { top: 150, right: 60, bottom: 250, left: 60 }, // Respect UI elements
  },
  twitter: {
    width: 1600,
    height: 900,
    safeZone: { top: 90, right: 140, bottom: 90, left: 140 },
  },
  linkedin: {
    width: 1200,
    height: 627,
    safeZone: { top: 63, right: 120, bottom: 63, left: 120 },
  },
};

// Brand colors
export const BRAND_COLORS = {
  cortexBlue: '#0EA5E9',
  solarOrange: '#F97316',
  successGreen: '#22C55E',
  premiumGold: '#F59E0B',
  darkNavy: 'rgb(15, 23, 42)',
  white: '#FFFFFF',
};

// Premium gradient definitions - mapped by preset name
export const GRADIENTS: Record<GradientPreset, {
  type: 'linear';
  angle: number;
  stops: Array<{ offset: number; color: string }>;
}> = {
  mind: {
    type: 'linear',
    angle: 135,
    stops: [
      { offset: 0, color: '#0F172A' },
      { offset: 50, color: '#1E3A8A' },
      { offset: 100, color: '#0EA5E9' },
    ],
  },
  action: {
    type: 'linear',
    angle: 135,
    stops: [
      { offset: 0, color: '#0F172A' },
      { offset: 50, color: '#7C2D12' },
      { offset: 100, color: '#F97316' },
    ],
  },
  tech: {
    type: 'linear',
    angle: 135,
    stops: [
      { offset: 0, color: '#0F172A' },
      { offset: 50, color: '#164E63' },
      { offset: 100, color: '#06B6D4' },
    ],
  },
  premium: {
    type: 'linear',
    angle: 135,
    stops: [
      { offset: 0, color: '#0F172A' },
      { offset: 50, color: '#78350F' },
      { offset: 100, color: '#F59E0B' },
    ],
  },
  dark: {
    type: 'linear',
    angle: 180,
    stops: [
      { offset: 0, color: '#0F172A' },
      { offset: 100, color: '#1E293B' },
    ],
  },
  energy: {
    type: 'linear',
    angle: 135,
    stops: [
      { offset: 0, color: '#0F172A' },
      { offset: 40, color: '#4C1D95' },
      { offset: 100, color: '#F97316' },
    ],
  },
  fresh: {
    type: 'linear',
    angle: 135,
    stops: [
      { offset: 0, color: '#0F172A' },
      { offset: 50, color: '#065F46' },
      { offset: 100, color: '#22C55E' },
    ],
  },
  fire: {
    type: 'linear',
    angle: 135,
    stops: [
      { offset: 0, color: '#0F172A' },
      { offset: 40, color: '#7F1D1D' },
      { offset: 100, color: '#EF4444' },
    ],
  },
};

// =============================================================================
// FONT LOADING
// =============================================================================

interface LoadedFonts {
  bold: ArrayBuffer;
  boldItalic: ArrayBuffer;
  semiBold: ArrayBuffer;
  medium: ArrayBuffer;
}

async function loadFonts(): Promise<LoadedFonts> {
  const baseUrl = 'https://mindandmuscle.ai/fonts';

  const [boldResponse, boldItalicResponse, semiBoldResponse, mediumResponse] = await Promise.all([
    fetch(`${baseUrl}/Inter-Bold.otf`),
    fetch(`${baseUrl}/Inter-BoldItalic.otf`),
    fetch(`${baseUrl}/Inter-SemiBold.otf`),
    fetch(`${baseUrl}/Inter-Medium.otf`),
  ]);

  if (!boldResponse.ok || !boldItalicResponse.ok || !semiBoldResponse.ok || !mediumResponse.ok) {
    throw new Error('Failed to load fonts');
  }

  return {
    bold: await boldResponse.arrayBuffer(),
    boldItalic: await boldItalicResponse.arrayBuffer(),
    semiBold: await semiBoldResponse.arrayBuffer(),
    medium: await mediumResponse.arrayBuffer(),
  };
}

function createFontConfig(fonts: LoadedFonts) {
  return [
    // Medium weights
    { name: 'Inter', data: fonts.medium, weight: 400 as const, style: 'normal' as const },
    { name: 'Inter', data: fonts.medium, weight: 500 as const, style: 'normal' as const },
    // SemiBold
    { name: 'Inter', data: fonts.semiBold, weight: 600 as const, style: 'normal' as const },
    // Bold weights
    { name: 'Inter', data: fonts.bold, weight: 700 as const, style: 'normal' as const },
    { name: 'Inter', data: fonts.bold, weight: 800 as const, style: 'normal' as const },
    { name: 'Inter', data: fonts.bold, weight: 900 as const, style: 'normal' as const },
    // Italic weights
    { name: 'Inter', data: fonts.boldItalic, weight: 700 as const, style: 'italic' as const },
    { name: 'Inter', data: fonts.boldItalic, weight: 800 as const, style: 'italic' as const },
    { name: 'Inter', data: fonts.boldItalic, weight: 900 as const, style: 'italic' as const },
  ];
}

// =============================================================================
// QR CODE GENERATION
// =============================================================================

async function generateQRCode(url: string, size: number = 300): Promise<string> {
  const qrBuffer = await QRCode.toBuffer(url, {
    width: size,
    margin: 1,
    errorCorrectionLevel: 'H',
    color: { dark: '#000000', light: '#ffffff' },
  });

  // Add M&M logo to center
  const logoUrl = 'https://mindandmuscle.ai/assets/images/icon-192.png';
  try {
    const logoResponse = await fetch(logoUrl);
    if (logoResponse.ok) {
      const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
      const logoSize = Math.floor(size * 0.25);
      const resizedLogo = await sharp(logoBuffer)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toBuffer();

      const circleSize = logoSize + 10;
      const circleSvg = `<svg width="${circleSize}" height="${circleSize}">
        <circle cx="${circleSize/2}" cy="${circleSize/2}" r="${circleSize/2}" fill="white"/>
      </svg>`;

      const qrWithLogo = await sharp(qrBuffer)
        .composite([
          { input: Buffer.from(circleSvg), top: Math.floor((size - circleSize) / 2), left: Math.floor((size - circleSize) / 2) },
          { input: resizedLogo, top: Math.floor((size - logoSize) / 2), left: Math.floor((size - logoSize) / 2) },
        ])
        .png()
        .toBuffer();

      return `data:image/png;base64,${qrWithLogo.toString('base64')}`;
    }
  } catch (err) {
    console.error('Error adding logo to QR code:', err);
  }

  return `data:image/png;base64,${qrBuffer.toString('base64')}`;
}

// =============================================================================
// BACKGROUND GENERATION
// =============================================================================

async function fetchBackgroundImage(): Promise<Buffer> {
  const backgroundUrl = 'https://mindandmuscle.ai/assets/images/baseball_field_dusk.png';
  try {
    const response = await fetch(backgroundUrl);
    if (response.ok) {
      return Buffer.from(await response.arrayBuffer());
    }
  } catch (err) {
    console.error('Error fetching background:', err);
  }

  // Fallback: create dark gradient background
  return sharp({
    create: { width: 1920, height: 1920, channels: 3, background: { r: 15, g: 23, b: 42 } },
  }).png().toBuffer();
}

function createGradientSvg(
  width: number,
  height: number,
  gradientPreset: GradientPreset
): string {
  const gradient = GRADIENTS[gradientPreset];
  const stops = gradient.stops
    .map(s => `<stop offset="${s.offset}%" stop-color="${s.color}" />`)
    .join('');

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" gradientTransform="rotate(${gradient.angle})">
          ${stops}
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `;
}

function createPhotoOverlaySvg(width: number, height: number): string {
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="overlay" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:rgb(15, 23, 42);stop-opacity:0.65" />
          <stop offset="55%" style="stop-color:rgb(15, 23, 42);stop-opacity:0.35" />
          <stop offset="100%" style="stop-color:rgb(15, 23, 42);stop-opacity:0.45" />
        </linearGradient>
        <radialGradient id="vignette" cx="35%" cy="50%">
          <stop offset="0%" style="stop-color:rgb(15, 23, 42);stop-opacity:0.6" />
          <stop offset="65%" style="stop-color:rgb(15, 23, 42);stop-opacity:0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#vignette)" />
      <rect width="100%" height="100%" fill="url(#overlay)" />
    </svg>
  `;
}

// =============================================================================
// LAYOUT COMPONENTS (Satori-compatible object notation)
// =============================================================================

interface LayoutParams {
  template: SocialImageTemplate;
  qrCodeDataUrl: string;
  partnerName: string;
  dims: PlatformDimensions;
  format: PlatformFormat;
}

// Style A: Bold Impact - Large headline dominates
function createBoldImpactLayout(params: LayoutParams): object {
  const { template, qrCodeDataUrl, partnerName, dims, format } = params;
  const { width, height, safeZone } = dims;
  const safeWidth = width - safeZone.left - safeZone.right;
  const safeHeight = height - safeZone.top - safeZone.bottom;

  const isVertical = format === 'story' || format === 'feed_portrait';
  const headlineSize = isVertical ? Math.floor(width * 0.065) : Math.floor(width * 0.045);
  const subheadSize = isVertical ? Math.floor(width * 0.022) : Math.floor(width * 0.018);
  const qrSize = isVertical ? Math.floor(width * 0.28) : Math.floor(width * 0.22);

  return {
    type: 'div',
    props: {
      style: {
        width,
        height,
        position: 'relative',
        display: 'flex',
        fontFamily: 'Inter',
      },
      children: [
        // Safe zone container
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: safeZone.top,
              left: safeZone.left,
              width: safeWidth,
              height: safeHeight,
              display: 'flex',
              flexDirection: isVertical ? 'column' : 'row',
              justifyContent: isVertical ? 'space-between' : 'center',
              alignItems: 'center',
            },
            children: [
              // Text content section
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isVertical ? 'center' : 'flex-start',
                    textAlign: isVertical ? 'center' : 'left',
                    width: isVertical ? '100%' : '60%',
                    paddingRight: isVertical ? 0 : 40,
                  },
                  children: [
                    // Partner badge
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 24,
                          padding: '8px 16px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: 8,
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: Math.floor(subheadSize * 0.9),
                                fontWeight: 600,
                                color: BRAND_COLORS.successGreen,
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                              },
                              children: `Partner: ${partnerName}`,
                            },
                          },
                        ],
                      },
                    },
                    // Main headline
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        },
                        children: template.headline.split('\n').map((line, i) => ({
                          type: 'span',
                          props: {
                            style: {
                              fontSize: headlineSize,
                              fontWeight: 900,
                              fontStyle: 'italic',
                              lineHeight: 1.1,
                              letterSpacing: -1.5,
                              textTransform: 'uppercase',
                              color: i % 2 === 0 ? template.accentColor : BRAND_COLORS.white,
                              textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                            },
                            children: line,
                          },
                        })),
                      },
                    },
                    // Subheadline
                    template.subheadline && {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 20,
                          fontSize: subheadSize,
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.9)',
                          lineHeight: 1.4,
                          maxWidth: isVertical ? '85%' : '100%',
                        },
                        children: template.subheadline,
                      },
                    },
                  ].filter(Boolean),
                },
              },
              // QR code section
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: isVertical ? 40 : 0,
                  },
                  children: [
                    // QR code on white card
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: BRAND_COLORS.white,
                          borderRadius: 16,
                          padding: 16,
                          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                        },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: qrCodeDataUrl,
                              style: {
                                width: qrSize,
                                height: qrSize,
                              },
                            },
                          },
                        ],
                      },
                    },
                    // CTA text
                    {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 16,
                          fontSize: Math.floor(subheadSize * 1.1),
                          fontWeight: 700,
                          color: BRAND_COLORS.white,
                          textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                        },
                        children: template.ctaText || 'Scan to Get Started',
                      },
                    },
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

// Style B: Clean Minimal - Centered, generous whitespace
function createCleanMinimalLayout(params: LayoutParams): object {
  const { template, qrCodeDataUrl, partnerName, dims, format } = params;
  const { width, height, safeZone } = dims;
  const safeWidth = width - safeZone.left - safeZone.right;
  const safeHeight = height - safeZone.top - safeZone.bottom;

  const isVertical = format === 'story' || format === 'feed_portrait';
  const headlineSize = isVertical ? Math.floor(width * 0.055) : Math.floor(width * 0.04);
  const subheadSize = isVertical ? Math.floor(width * 0.024) : Math.floor(width * 0.018);
  const qrSize = isVertical ? Math.floor(width * 0.32) : Math.floor(width * 0.2);

  return {
    type: 'div',
    props: {
      style: {
        width,
        height,
        position: 'relative',
        display: 'flex',
        fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: safeZone.top,
              left: safeZone.left,
              width: safeWidth,
              height: safeHeight,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            },
            children: [
              // Partner badge at top
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 32,
                    padding: '10px 20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 50,
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: Math.floor(subheadSize * 0.85),
                          fontWeight: 600,
                          color: 'rgba(255, 255, 255, 0.8)',
                        },
                        children: `Recommended by ${partnerName}`,
                      },
                    },
                  ],
                },
              },
              // Headline
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 24,
                  },
                  children: template.headline.split('\n').map((line) => ({
                    type: 'span',
                    props: {
                      style: {
                        fontSize: headlineSize,
                        fontWeight: 800,
                        lineHeight: 1.15,
                        letterSpacing: -1,
                        color: BRAND_COLORS.white,
                        textShadow: '0 2px 12px rgba(0, 0, 0, 0.4)',
                      },
                      children: line,
                    },
                  })),
                },
              },
              // Subheadline
              template.subheadline && {
                type: 'p',
                props: {
                  style: {
                    fontSize: subheadSize,
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: 1.5,
                    maxWidth: '75%',
                    marginBottom: 40,
                  },
                  children: template.subheadline,
                },
              },
              // QR code
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: BRAND_COLORS.white,
                          borderRadius: 20,
                          padding: 20,
                          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)',
                        },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: qrCodeDataUrl,
                              style: { width: qrSize, height: qrSize },
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 20,
                          fontSize: Math.floor(subheadSize * 1.1),
                          fontWeight: 600,
                          color: template.accentColor,
                        },
                        children: template.ctaText || 'Scan to Learn More',
                      },
                    },
                  ],
                },
              },
            ].filter(Boolean),
          },
        },
      ],
    },
  };
}

// Style C: Split Layout - 50/50 with photo
function createSplitLayout(params: LayoutParams): object {
  const { template, qrCodeDataUrl, partnerName, dims, format } = params;
  const { width, height, safeZone } = dims;
  const safeWidth = width - safeZone.left - safeZone.right;
  const safeHeight = height - safeZone.top - safeZone.bottom;

  const isVertical = format === 'story' || format === 'feed_portrait';
  const headlineSize = Math.floor(width * (isVertical ? 0.05 : 0.035));
  const subheadSize = Math.floor(width * (isVertical ? 0.022 : 0.016));
  const qrSize = Math.floor(width * (isVertical ? 0.25 : 0.18));

  return {
    type: 'div',
    props: {
      style: {
        width,
        height,
        position: 'relative',
        display: 'flex',
        fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: safeZone.top,
              left: safeZone.left,
              width: safeWidth,
              height: safeHeight,
              display: 'flex',
              flexDirection: isVertical ? 'column' : 'row',
            },
            children: [
              // Left/Top: Text content (50%)
              {
                type: 'div',
                props: {
                  style: {
                    width: isVertical ? '100%' : '55%',
                    height: isVertical ? '55%' : '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingRight: isVertical ? 0 : 32,
                  },
                  children: [
                    // Partner badge
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: 20,
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: Math.floor(subheadSize * 0.9),
                                fontWeight: 600,
                                color: BRAND_COLORS.successGreen,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                              },
                              children: partnerName,
                            },
                          },
                        ],
                      },
                    },
                    // Headlines
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', gap: 4 },
                        children: template.headline.split('\n').map((line, i) => ({
                          type: 'span',
                          props: {
                            style: {
                              fontSize: headlineSize,
                              fontWeight: 900,
                              fontStyle: 'italic',
                              lineHeight: 1.1,
                              letterSpacing: -1,
                              textTransform: 'uppercase',
                              color: i % 2 === 0 ? template.accentColor : BRAND_COLORS.white,
                              textShadow: '0 2px 16px rgba(0, 0, 0, 0.4)',
                            },
                            children: line,
                          },
                        })),
                      },
                    },
                    // Subheadline
                    template.subheadline && {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 16,
                          fontSize: subheadSize,
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.9)',
                          lineHeight: 1.45,
                        },
                        children: template.subheadline,
                      },
                    },
                    // Body text
                    template.bodyText && {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 12,
                          fontSize: Math.floor(subheadSize * 0.9),
                          fontWeight: 400,
                          color: 'rgba(255, 255, 255, 0.75)',
                          lineHeight: 1.5,
                        },
                        children: template.bodyText,
                      },
                    },
                  ].filter(Boolean),
                },
              },
              // Right/Bottom: QR code (45%)
              {
                type: 'div',
                props: {
                  style: {
                    width: isVertical ? '100%' : '45%',
                    height: isVertical ? '45%' : '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: BRAND_COLORS.white,
                          borderRadius: 16,
                          padding: 16,
                          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
                        },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: qrCodeDataUrl,
                              style: { width: qrSize, height: qrSize },
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 16,
                          fontSize: Math.floor(subheadSize * 1.1),
                          fontWeight: 700,
                          color: BRAND_COLORS.white,
                        },
                        children: template.ctaText || 'Scan to Start',
                      },
                    },
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

// Style D: Story Format - Optimized for 9:16
function createStoryLayout(params: LayoutParams): object {
  const { template, qrCodeDataUrl, partnerName, dims } = params;
  const { width, height, safeZone } = dims;
  const safeWidth = width - safeZone.left - safeZone.right;
  const safeHeight = height - safeZone.top - safeZone.bottom;

  const headlineSize = Math.floor(width * 0.065);
  const subheadSize = Math.floor(width * 0.028);
  const qrSize = Math.floor(width * 0.35);

  return {
    type: 'div',
    props: {
      style: {
        width,
        height,
        position: 'relative',
        display: 'flex',
        fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: safeZone.top,
              left: safeZone.left,
              width: safeWidth,
              height: safeHeight,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
            children: [
              // Top section: Partner badge
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    justifyContent: 'center',
                    paddingTop: 20,
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          padding: '12px 24px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: 50,
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: Math.floor(subheadSize * 0.85),
                                fontWeight: 600,
                                color: BRAND_COLORS.successGreen,
                              },
                              children: partnerName,
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              // Middle section: Headlines
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '0 20px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', gap: 8 },
                        children: template.headline.split('\n').map((line, i) => ({
                          type: 'span',
                          props: {
                            style: {
                              fontSize: headlineSize,
                              fontWeight: 900,
                              fontStyle: 'italic',
                              lineHeight: 1.08,
                              letterSpacing: -2,
                              textTransform: 'uppercase',
                              color: i % 2 === 0 ? template.accentColor : BRAND_COLORS.white,
                              textShadow: '0 4px 24px rgba(0, 0, 0, 0.5)',
                            },
                            children: line,
                          },
                        })),
                      },
                    },
                    template.subheadline && {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 24,
                          fontSize: subheadSize,
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.9)',
                          lineHeight: 1.4,
                          maxWidth: '90%',
                        },
                        children: template.subheadline,
                      },
                    },
                  ].filter(Boolean),
                },
              },
              // Bottom section: QR code
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingBottom: 20,
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: BRAND_COLORS.white,
                          borderRadius: 20,
                          padding: 20,
                          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
                        },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: qrCodeDataUrl,
                              style: { width: qrSize, height: qrSize },
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 20,
                          fontSize: Math.floor(subheadSize * 1.2),
                          fontWeight: 700,
                          color: BRAND_COLORS.white,
                          textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                        },
                        children: template.ctaText || 'Tap Link in Bio',
                      },
                    },
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

// Style E: Data/Stats - Infographic style
function createDataStatsLayout(params: LayoutParams): object {
  const { template, qrCodeDataUrl, partnerName, dims, format } = params;
  const { width, height, safeZone } = dims;
  const safeWidth = width - safeZone.left - safeZone.right;
  const safeHeight = height - safeZone.top - safeZone.bottom;

  const isVertical = format === 'story' || format === 'feed_portrait';
  const headlineSize = Math.floor(width * (isVertical ? 0.048 : 0.032));
  const statSize = Math.floor(width * (isVertical ? 0.08 : 0.055));
  const subheadSize = Math.floor(width * (isVertical ? 0.022 : 0.016));
  const qrSize = Math.floor(width * (isVertical ? 0.22 : 0.16));

  // Example stats - these would come from template in real implementation
  const stats = [
    { value: '14', label: 'Training Modules' },
    { value: '186', label: 'Game Scenarios' },
    { value: 'AI', label: 'Powered Analysis' },
  ];

  return {
    type: 'div',
    props: {
      style: {
        width,
        height,
        position: 'relative',
        display: 'flex',
        fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: safeZone.top,
              left: safeZone.left,
              width: safeWidth,
              height: safeHeight,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
            children: [
              // Top: Partner + Headline
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: Math.floor(subheadSize * 0.9),
                          fontWeight: 600,
                          color: BRAND_COLORS.successGreen,
                          marginBottom: 16,
                        },
                        children: partnerName,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', gap: 4 },
                        children: template.headline.split('\n').map((line) => ({
                          type: 'span',
                          props: {
                            style: {
                              fontSize: headlineSize,
                              fontWeight: 800,
                              lineHeight: 1.15,
                              letterSpacing: -1,
                              color: BRAND_COLORS.white,
                            },
                            children: line,
                          },
                        })),
                      },
                    },
                  ],
                },
              },
              // Middle: Stats grid
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: isVertical ? 'column' : 'row',
                    gap: isVertical ? 24 : 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  children: stats.map((stat) => ({
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '16px 24px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: 16,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      },
                      children: [
                        {
                          type: 'span',
                          props: {
                            style: {
                              fontSize: statSize,
                              fontWeight: 900,
                              color: template.accentColor,
                              lineHeight: 1,
                            },
                            children: stat.value,
                          },
                        },
                        {
                          type: 'span',
                          props: {
                            style: {
                              fontSize: Math.floor(subheadSize * 0.85),
                              fontWeight: 500,
                              color: 'rgba(255, 255, 255, 0.7)',
                              marginTop: 8,
                            },
                            children: stat.label,
                          },
                        },
                      ],
                    },
                  })),
                },
              },
              // Bottom: QR code
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: BRAND_COLORS.white,
                          borderRadius: 12,
                          padding: 12,
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: qrCodeDataUrl,
                              style: { width: qrSize, height: qrSize },
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 12,
                          fontSize: subheadSize,
                          fontWeight: 600,
                          color: BRAND_COLORS.white,
                        },
                        children: template.ctaText || 'Learn More',
                      },
                    },
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

// =============================================================================
// LAYOUT SELECTOR
// =============================================================================

function getLayoutComponent(style: string, params: LayoutParams): object {
  // For story format, always use story layout
  if (params.format === 'story') {
    return createStoryLayout(params);
  }

  switch (style) {
    case 'bold_impact':
      return createBoldImpactLayout(params);
    case 'clean_minimal':
      return createCleanMinimalLayout(params);
    case 'split_layout':
      return createSplitLayout(params);
    case 'data_stats':
      return createDataStatsLayout(params);
    default:
      return createBoldImpactLayout(params);
  }
}

// =============================================================================
// IMAGE COMPOSITION
// =============================================================================

async function compositeImage(
  template: SocialImageTemplate,
  svgString: string,
  width: number,
  height: number,
  backgroundBuffer: Buffer | null
): Promise<Buffer> {
  let baseImage: Buffer;

  if (template.backgroundType === 'photo' && backgroundBuffer) {
    // Use photo background with overlay
    const resizedBg = await sharp(backgroundBuffer)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .toBuffer();

    const overlayBuffer = Buffer.from(createPhotoOverlaySvg(width, height));
    const contentBuffer = Buffer.from(svgString);

    baseImage = await sharp(resizedBg)
      .composite([
        { input: overlayBuffer, blend: 'over' },
        { input: contentBuffer, blend: 'over' },
      ])
      .png()
      .toBuffer();
  } else {
    // Use gradient background
    const gradientPreset = template.gradientPreset || 'dark';
    const gradientBuffer = Buffer.from(createGradientSvg(width, height, gradientPreset));
    const contentBuffer = Buffer.from(svgString);

    // Create base gradient image
    const gradientImage = await sharp(gradientBuffer).png().toBuffer();

    baseImage = await sharp(gradientImage)
      .composite([{ input: contentBuffer, blend: 'over' }])
      .png()
      .toBuffer();
  }

  return baseImage;
}

// =============================================================================
// STORAGE
// =============================================================================

async function uploadToStorage(
  buffer: Buffer,
  storagePath: string
): Promise<string | null> {
  const { error } = await supabase.storage
    .from('partner-social-images')
    .upload(storagePath, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    console.error(`Error uploading ${storagePath}:`, error);
    return null;
  }

  const { data } = supabase.storage.from('partner-social-images').getPublicUrl(storagePath);
  return data.publicUrl;
}

// =============================================================================
// MAIN GENERATION FUNCTION
// =============================================================================

export async function generateSocialImages(params: {
  partnerName: string;
  partnerEmail: string;
  referralUrl: string;
  templateIds?: string[]; // Optional: generate specific templates only
  formats?: PlatformFormat[]; // Optional: generate specific formats only
}): Promise<GenerationResult> {
  const {
    partnerName,
    partnerEmail,
    referralUrl,
    templateIds,
    formats = ['feed_square', 'feed_portrait', 'story', 'twitter', 'linkedin'],
  } = params;

  const timestamp = Date.now();
  const sanitizedName = partnerName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const baseFolder = `${sanitizedName}-${timestamp}`;

  const results: GeneratedImage[] = [];

  try {
    // Load fonts
    const loadedFonts = await loadFonts();
    const fonts = createFontConfig(loadedFonts);

    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(referralUrl);

    // Fetch background image
    const backgroundBuffer = await fetchBackgroundImage();

    // Get templates to generate
    const templatesToGenerate = templateIds
      ? SOCIAL_IMAGE_TEMPLATES.filter(t => templateIds.includes(t.id))
      : SOCIAL_IMAGE_TEMPLATES;

    console.log(`Generating ${templatesToGenerate.length} templates × ${formats.length} formats...`);

    // Generate each template in each format
    for (const template of templatesToGenerate) {
      for (const format of formats) {
        const dims = PLATFORM_DIMENSIONS[format];
        const layoutParams: LayoutParams = {
          template,
          qrCodeDataUrl,
          partnerName,
          dims,
          format,
        };

        // Get layout component
        const layoutComponent = getLayoutComponent(template.style, layoutParams);

        // Render to SVG
        const svgString = await satori(layoutComponent as any, {
          width: dims.width,
          height: dims.height,
          fonts,
        });

        // Composite final image
        const imageBuffer = await compositeImage(
          template,
          svgString,
          dims.width,
          dims.height,
          template.backgroundType === 'photo' ? backgroundBuffer : null
        );

        // Upload to storage
        const storagePath = `${baseFolder}/${template.id}-${format}.png`;
        const url = await uploadToStorage(imageBuffer, storagePath);

        if (url) {
          results.push({
            templateId: template.id,
            format,
            url,
            width: dims.width,
            height: dims.height,
          });
        }
      }

      console.log(`✅ Generated all formats for template: ${template.name}`);
    }

    console.log(`🎉 Generated ${results.length} images for ${partnerName}`);

    return {
      success: true,
      images: results,
    };
  } catch (error) {
    console.error('Error generating social images:', error);
    return {
      success: false,
      images: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// SINGLE IMAGE GENERATION (for preview)
// =============================================================================

export async function generateSingleImage(params: {
  templateId: string;
  partnerName: string;
  referralUrl: string;
  format: PlatformFormat;
}): Promise<{ success: boolean; buffer?: Buffer; error?: string }> {
  const { templateId, partnerName, referralUrl, format } = params;

  const template = SOCIAL_IMAGE_TEMPLATES.find(t => t.id === templateId);
  if (!template) {
    return { success: false, error: 'Template not found' };
  }

  try {
    const loadedFonts = await loadFonts();
    const fonts = createFontConfig(loadedFonts);
    const qrCodeDataUrl = await generateQRCode(referralUrl);
    const backgroundBuffer = await fetchBackgroundImage();

    const dims = PLATFORM_DIMENSIONS[format];
    const layoutParams: LayoutParams = {
      template,
      qrCodeDataUrl,
      partnerName,
      dims,
      format,
    };

    const layoutComponent = getLayoutComponent(template.style, layoutParams);
    const svgString = await satori(layoutComponent as any, {
      width: dims.width,
      height: dims.height,
      fonts,
    });

    const imageBuffer = await compositeImage(
      template,
      svgString,
      dims.width,
      dims.height,
      template.backgroundType === 'photo' ? backgroundBuffer : null
    );

    return { success: true, buffer: imageBuffer };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export { SOCIAL_IMAGE_TEMPLATES };
