import satori from 'satori';
import sharp from 'sharp';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Load font for satori (must be TTF/OTF, not WOFF/WOFF2)
async function loadFont(): Promise<ArrayBuffer> {
  // Use Inter font TTF from GitHub (satori doesn't support WOFF2)
  const fontUrl = 'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Bold.otf';
  const response = await fetch(fontUrl);
  return await response.arrayBuffer();
}

// Fetch image as base64 data URL
async function fetchImageAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const contentType = response.headers.get('content-type') || 'image/png';
  return `data:${contentType};base64,${base64}`;
}

// Generate QR code as data URL
async function generateQRCode(url: string): Promise<string> {
  return await QRCode.toDataURL(url, {
    width: 300,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

// Upload image to Supabase Storage
async function uploadToStorage(
  buffer: Buffer,
  storagePath: string
): Promise<string | null> {
  const { error } = await supabase.storage
    .from('partner-banners')
    .upload(storagePath, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    console.error(`Error uploading ${storagePath}:`, error);
    return null;
  }

  const { data } = supabase.storage.from('partner-banners').getPublicUrl(storagePath);
  return data.publicUrl;
}

// =============================================================================
// FACEBOOK STANDARD BANNER - 1080x1080 (matches UI exactly)
// =============================================================================
function createFacebookStandardBanner(qrCodeDataUrl: string) {
  return {
    type: 'div',
    props: {
      style: {
        width: 1080,
        height: 1080,
        position: 'relative',
        display: 'flex',
        fontFamily: 'Inter',
      },
      children: [
        // SAFE ZONE CONTAINER: 860x860px centered (110px padding all sides)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 110,
              left: 110,
              width: 860,
              height: 860,
              display: 'flex',
            },
            children: [
              // LEFT SIDE - 60% width - Primary Message Block
              {
                type: 'div',
                props: {
                  style: {
                    width: '60%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingRight: 30,
                  },
                  children: [
                    // Headline
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 52,
                                fontWeight: 900,
                                fontStyle: 'italic',
                                lineHeight: 1.15,
                                letterSpacing: -1.5,
                                textTransform: 'uppercase',
                                color: '#0EA5E9',
                              },
                              children: 'Discipline the Mind.',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 52,
                                fontWeight: 900,
                                fontStyle: 'italic',
                                lineHeight: 1.15,
                                letterSpacing: -1.5,
                                textTransform: 'uppercase',
                                color: '#F97316',
                              },
                              children: 'Dominate the Game.',
                            },
                          },
                        ],
                      },
                    },
                    // Subhead
                    {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 24,
                          fontSize: 20,
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: 500,
                          letterSpacing: 0.3,
                        },
                        children: 'AI Training for Baseball & Softball Athletes',
                      },
                    },
                    // Brand name
                    {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 8,
                          fontSize: 15,
                          color: 'rgba(255, 255, 255, 0.85)',
                          fontWeight: 500,
                        },
                        children: 'Mind & Muscle',
                      },
                    },
                  ],
                },
              },
              // RIGHT SIDE - 40% width - QR Code Block
              {
                type: 'div',
                props: {
                  style: {
                    width: '40%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  children: [
                    // QR Code on white card
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: '#FFFFFF',
                          borderRadius: 12,
                          padding: 16,
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: qrCodeDataUrl,
                              style: {
                                width: 280,
                                height: 280,
                                objectFit: 'contain',
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
                          fontSize: 17,
                          fontWeight: 600,
                          color: 'white',
                        },
                        children: 'Scan to Get Started',
                      },
                    },
                    // Get Started FREE
                    {
                      type: 'div',
                      props: {
                        style: {
                          marginTop: 6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 20,
                                fontWeight: 700,
                                color: 'white',
                              },
                              children: 'Get Started',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 20,
                                fontWeight: 800,
                                color: '#22C55E',
                              },
                              children: 'FREE',
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
        },
      ],
    },
  };
}

// =============================================================================
// FACEBOOK CO-BRANDED BANNER - 1080x1080 (with partner badge)
// =============================================================================
function createFacebookCoBrandedBanner(qrCodeDataUrl: string, partnerLogoDataUrl: string) {
  return {
    type: 'div',
    props: {
      style: {
        width: 1080,
        height: 1080,
        position: 'relative',
        display: 'flex',
        fontFamily: 'Inter',
      },
      children: [
        // SAFE ZONE CONTAINER
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 110,
              left: 110,
              width: 860,
              height: 860,
              display: 'flex',
            },
            children: [
              // LEFT SIDE - 60% width
              {
                type: 'div',
                props: {
                  style: {
                    width: '60%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingRight: 30,
                  },
                  children: [
                    // Partner Badge
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          marginBottom: 24,
                          padding: '10px 16px 10px 12px',
                          backgroundColor: 'rgba(15, 23, 42, 0.5)',
                          borderRadius: 10,
                        },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: partnerLogoDataUrl,
                              style: {
                                height: 70,
                                maxWidth: 180,
                                objectFit: 'contain',
                              },
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                              },
                              children: [
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontSize: 13,
                                      fontWeight: 500,
                                      color: 'rgba(255, 255, 255, 0.75)',
                                    },
                                    children: 'Powered by Mind & Muscle',
                                  },
                                },
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontSize: 11,
                                      fontWeight: 600,
                                      color: '#10B981',
                                      textTransform: 'uppercase',
                                      letterSpacing: 0.5,
                                    },
                                    children: 'Official Team Partner',
                                  },
                                },
                              ],
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
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 48,
                                fontWeight: 900,
                                fontStyle: 'italic',
                                lineHeight: 1.15,
                                letterSpacing: -1.5,
                                textTransform: 'uppercase',
                                color: '#0EA5E9',
                              },
                              children: 'Discipline the Mind.',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 48,
                                fontWeight: 900,
                                fontStyle: 'italic',
                                lineHeight: 1.15,
                                letterSpacing: -1.5,
                                textTransform: 'uppercase',
                                color: '#F97316',
                              },
                              children: 'Dominate the Game.',
                            },
                          },
                        ],
                      },
                    },
                    // Subhead
                    {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 20,
                          fontSize: 18,
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: 500,
                        },
                        children: 'AI Training for Baseball & Softball Athletes',
                      },
                    },
                  ],
                },
              },
              // RIGHT SIDE - 40% width - QR Code Block
              {
                type: 'div',
                props: {
                  style: {
                    width: '40%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          backgroundColor: '#FFFFFF',
                          borderRadius: 12,
                          padding: 16,
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: qrCodeDataUrl,
                              style: {
                                width: 260,
                                height: 260,
                                objectFit: 'contain',
                              },
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 14,
                          fontSize: 16,
                          fontWeight: 600,
                          color: 'white',
                        },
                        children: 'Scan to Join',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          marginTop: 5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 18,
                                fontWeight: 700,
                                color: 'white',
                              },
                              children: 'Teams Start',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 18,
                                fontWeight: 800,
                                color: '#22C55E',
                              },
                              children: 'FREE',
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
        },
      ],
    },
  };
}

// =============================================================================
// TWITTER STANDARD BANNER - 1600x900 (matches UI exactly)
// =============================================================================
function createTwitterStandardBanner(qrCodeDataUrl: string) {
  return {
    type: 'div',
    props: {
      style: {
        width: 1600,
        height: 900,
        position: 'relative',
        display: 'flex',
        fontFamily: 'Inter',
      },
      children: [
        // SAFE ZONE CONTAINER: 1320x720px centered (140px L/R, 90px T/B)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 90,
              left: 140,
              width: 1320,
              height: 720,
              display: 'flex',
            },
            children: [
              // LEFT SIDE - 65% width
              {
                type: 'div',
                props: {
                  style: {
                    width: '65%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingRight: 40,
                  },
                  children: [
                    // Headline
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 64,
                                fontWeight: 900,
                                fontStyle: 'italic',
                                lineHeight: 1.12,
                                letterSpacing: -1,
                                textTransform: 'uppercase',
                                color: '#0EA5E9',
                              },
                              children: 'Discipline the Mind.',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 64,
                                fontWeight: 900,
                                fontStyle: 'italic',
                                lineHeight: 1.12,
                                letterSpacing: -1,
                                textTransform: 'uppercase',
                                color: '#F97316',
                              },
                              children: 'Dominate the Game.',
                            },
                          },
                        ],
                      },
                    },
                    // Subhead
                    {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 28,
                          fontSize: 22,
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: 500,
                        },
                        children: 'AI Training for Baseball & Softball Athletes',
                      },
                    },
                    // Brand name
                    {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 8,
                          fontSize: 16,
                          color: 'rgba(255, 255, 255, 0.85)',
                          fontWeight: 500,
                        },
                        children: 'Mind & Muscle',
                      },
                    },
                  ],
                },
              },
              // RIGHT SIDE - 35% width - QR Code Block
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
                        style: {
                          backgroundColor: '#FFFFFF',
                          borderRadius: 10,
                          padding: 14,
                          boxShadow: '0 6px 28px rgba(0, 0, 0, 0.4)',
                        },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: qrCodeDataUrl,
                              style: {
                                width: 240,
                                height: 240,
                                objectFit: 'contain',
                              },
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 9,
                          fontSize: 16,
                          fontWeight: 600,
                          color: 'white',
                        },
                        children: 'Scan to Get Started',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          marginTop: 5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 18,
                                fontWeight: 700,
                                color: 'white',
                              },
                              children: 'Get Started',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 18,
                                fontWeight: 800,
                                color: '#22C55E',
                              },
                              children: 'FREE',
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
        },
      ],
    },
  };
}

// =============================================================================
// TWITTER CO-BRANDED BANNER - 1600x900 (with partner badge)
// =============================================================================
function createTwitterCoBrandedBanner(qrCodeDataUrl: string, partnerLogoDataUrl: string) {
  return {
    type: 'div',
    props: {
      style: {
        width: 1600,
        height: 900,
        position: 'relative',
        display: 'flex',
        fontFamily: 'Inter',
      },
      children: [
        // SAFE ZONE CONTAINER
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 90,
              left: 140,
              width: 1320,
              height: 720,
              display: 'flex',
            },
            children: [
              // LEFT SIDE - 65% width
              {
                type: 'div',
                props: {
                  style: {
                    width: '65%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingRight: 40,
                  },
                  children: [
                    // Partner Badge
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                          marginBottom: 28,
                          padding: '12px 20px 12px 14px',
                          backgroundColor: 'rgba(15, 23, 42, 0.5)',
                          borderRadius: 12,
                        },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: partnerLogoDataUrl,
                              style: {
                                height: 95,
                                maxWidth: 240,
                                objectFit: 'contain',
                              },
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4,
                              },
                              children: [
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontSize: 15,
                                      fontWeight: 500,
                                      color: 'rgba(255, 255, 255, 0.75)',
                                    },
                                    children: 'Powered by Mind & Muscle',
                                  },
                                },
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontSize: 13,
                                      fontWeight: 600,
                                      color: '#10B981',
                                      textTransform: 'uppercase',
                                      letterSpacing: 0.5,
                                    },
                                    children: 'Official Team Partner',
                                  },
                                },
                              ],
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
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 64,
                                fontWeight: 900,
                                fontStyle: 'italic',
                                lineHeight: 1.12,
                                letterSpacing: -1,
                                textTransform: 'uppercase',
                                color: '#0EA5E9',
                              },
                              children: 'Discipline the Mind.',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 64,
                                fontWeight: 900,
                                fontStyle: 'italic',
                                lineHeight: 1.12,
                                letterSpacing: -1,
                                textTransform: 'uppercase',
                                color: '#F97316',
                              },
                              children: 'Dominate the Game.',
                            },
                          },
                        ],
                      },
                    },
                    // Subhead
                    {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 28,
                          fontSize: 22,
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: 500,
                        },
                        children: 'AI Training for Baseball & Softball Athletes',
                      },
                    },
                  ],
                },
              },
              // RIGHT SIDE - 35% width - QR Code Block
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
                        style: {
                          backgroundColor: '#FFFFFF',
                          borderRadius: 10,
                          padding: 14,
                          boxShadow: '0 6px 28px rgba(0, 0, 0, 0.4)',
                        },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: qrCodeDataUrl,
                              style: {
                                width: 240,
                                height: 240,
                                objectFit: 'contain',
                              },
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
                          fontSize: 16,
                          fontWeight: 600,
                          color: 'white',
                        },
                        children: 'Scan to Join',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          marginTop: 5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 18,
                                fontWeight: 700,
                                color: 'white',
                              },
                              children: 'Teams Start',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 18,
                                fontWeight: 800,
                                color: '#22C55E',
                              },
                              children: 'FREE',
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
        },
      ],
    },
  };
}

// =============================================================================
// PARTNER BANNER - 1600x900 (with partner branding - matches UI)
// =============================================================================
function createPartnerBanner(qrCodeDataUrl: string, partnerLogoDataUrl: string) {
  return {
    type: 'div',
    props: {
      style: {
        width: 1600,
        height: 900,
        position: 'relative',
        display: 'flex',
        fontFamily: 'Inter',
      },
      children: [
        // SAFE ZONE CONTAINER
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 90,
              left: 140,
              width: 1320,
              height: 720,
              display: 'flex',
            },
            children: [
              // LEFT SIDE - 65% width
              {
                type: 'div',
                props: {
                  style: {
                    width: '65%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingRight: 40,
                  },
                  children: [
                    // Partner Badge - Logo prominent
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                          marginBottom: 28,
                          padding: '12px 20px 12px 14px',
                          backgroundColor: 'rgba(15, 23, 42, 0.5)',
                          borderRadius: 12,
                        },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: partnerLogoDataUrl,
                              style: {
                                height: 95,
                                maxWidth: 240,
                                objectFit: 'contain',
                              },
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4,
                              },
                              children: [
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontSize: 15,
                                      fontWeight: 500,
                                      color: 'rgba(255, 255, 255, 0.75)',
                                    },
                                    children: 'Powered by Mind & Muscle',
                                  },
                                },
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontSize: 13,
                                      fontWeight: 600,
                                      color: '#10B981',
                                      textTransform: 'uppercase',
                                      letterSpacing: 0.5,
                                    },
                                    children: 'Official Team Partner',
                                  },
                                },
                              ],
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
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 64,
                                fontWeight: 900,
                                fontStyle: 'italic',
                                lineHeight: 1.12,
                                letterSpacing: -1,
                                textTransform: 'uppercase',
                                color: '#0EA5E9',
                              },
                              children: 'Discipline the Mind.',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 64,
                                fontWeight: 900,
                                fontStyle: 'italic',
                                lineHeight: 1.12,
                                letterSpacing: -1,
                                textTransform: 'uppercase',
                                color: '#F97316',
                              },
                              children: 'Dominate the Game.',
                            },
                          },
                        ],
                      },
                    },
                    // Subhead
                    {
                      type: 'p',
                      props: {
                        style: {
                          marginTop: 28,
                          fontSize: 22,
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontWeight: 500,
                        },
                        children: 'AI Training for Baseball & Softball Athletes',
                      },
                    },
                  ],
                },
              },
              // RIGHT SIDE - 35% width - QR Code Block
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
                        style: {
                          backgroundColor: '#FFFFFF',
                          borderRadius: 10,
                          padding: 14,
                          boxShadow: '0 6px 28px rgba(0, 0, 0, 0.4)',
                        },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: qrCodeDataUrl,
                              style: {
                                width: 240,
                                height: 240,
                                objectFit: 'contain',
                              },
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
                          fontSize: 16,
                          fontWeight: 600,
                          color: 'white',
                        },
                        children: 'Scan to Join',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          marginTop: 5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 18,
                                fontWeight: 700,
                                color: 'white',
                              },
                              children: 'Teams Start',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: 18,
                                fontWeight: 800,
                                color: '#22C55E',
                              },
                              children: 'FREE',
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
        },
      ],
    },
  };
}

// =============================================================================
// COMPOSITE BANNER - Render SVG elements over background image
// =============================================================================
async function compositeBanner(
  backgroundBuffer: Buffer,
  svgString: string,
  width: number,
  height: number,
  gradientType: 'facebook' | 'twitter'
): Promise<Buffer> {
  // Create gradient overlay based on type
  let gradientSvg: string;

  if (gradientType === 'facebook') {
    gradientSvg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="overlay" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgb(15, 23, 42);stop-opacity:0.55" />
            <stop offset="55%" style="stop-color:rgb(15, 23, 42);stop-opacity:0.35" />
            <stop offset="100%" style="stop-color:rgb(15, 23, 42);stop-opacity:0.25" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#overlay)" />
      </svg>
    `;
  } else {
    gradientSvg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="overlay" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgb(15, 23, 42);stop-opacity:0.65" />
            <stop offset="55%" style="stop-color:rgb(15, 23, 42);stop-opacity:0.35" />
            <stop offset="100%" style="stop-color:rgb(15, 23, 42);stop-opacity:0.45" />
          </linearGradient>
          <radialGradient id="vignette" cx="35%" cy="50%">
            <stop offset="0%" style="stop-color:rgb(15, 23, 42);stop-opacity:0.7" />
            <stop offset="65%" style="stop-color:rgb(15, 23, 42);stop-opacity:0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#vignette)" />
        <rect width="100%" height="100%" fill="url(#overlay)" />
      </svg>
    `;
  }

  // Resize background to exact dimensions
  const resizedBackground = await sharp(backgroundBuffer)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .toBuffer();

  // Convert gradient SVG to buffer
  const gradientBuffer = Buffer.from(gradientSvg);

  // Convert content SVG to buffer
  const contentBuffer = Buffer.from(svgString);

  // Composite: background -> gradient overlay -> content
  return await sharp(resizedBackground)
    .composite([
      { input: gradientBuffer, blend: 'over' },
      { input: contentBuffer, blend: 'over' },
    ])
    .png()
    .toBuffer();
}

// Main export function to generate all banners
export async function generatePartnerBanners(params: {
  partnerName: string;
  partnerEmail: string;
  partnerLogoUrl: string;
  referralUrl: string;
}): Promise<{
  qrCodeUrl: string | null;
  bannerPartnerUrl: string | null;
  bannerFacebookUrl: string | null;
  bannerFacebookCoBrandedUrl: string | null;
  bannerTwitterUrl: string | null;
  bannerTwitterCoBrandedUrl: string | null;
}> {
  const { partnerName, partnerEmail, partnerLogoUrl, referralUrl } = params;

  const timestamp = Date.now();
  const sanitizedName = partnerName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const baseFolder = `${sanitizedName}-${timestamp}`;

  // Load font for satori
  const fontData = await loadFont();
  const fonts = [
    {
      name: 'Inter',
      data: fontData,
      weight: 400 as const,
      style: 'normal' as const,
    },
    {
      name: 'Inter',
      data: fontData,
      weight: 500 as const,
      style: 'normal' as const,
    },
    {
      name: 'Inter',
      data: fontData,
      weight: 600 as const,
      style: 'normal' as const,
    },
    {
      name: 'Inter',
      data: fontData,
      weight: 700 as const,
      style: 'normal' as const,
    },
    {
      name: 'Inter',
      data: fontData,
      weight: 800 as const,
      style: 'normal' as const,
    },
    {
      name: 'Inter',
      data: fontData,
      weight: 900 as const,
      style: 'normal' as const,
    },
  ];

  // Fetch the background image from the public website
  const backgroundUrl = 'https://mindandmuscle.ai/assets/images/baseball_field_dusk.png';
  let backgroundBuffer: Buffer;

  try {
    const bgResponse = await fetch(backgroundUrl);
    if (!bgResponse.ok) {
      throw new Error(`Failed to fetch background: ${bgResponse.status}`);
    }
    const bgArrayBuffer = await bgResponse.arrayBuffer();
    backgroundBuffer = Buffer.from(bgArrayBuffer);
    console.log('✅ Fetched background image');
  } catch (err) {
    console.error('Error fetching background image:', err);
    // Create a fallback dark gradient background
    backgroundBuffer = await sharp({
      create: {
        width: 1600,
        height: 900,
        channels: 3,
        background: { r: 15, g: 23, b: 42 },
      },
    }).png().toBuffer();
  }

  // Generate QR code
  const qrCodeDataUrl = await generateQRCode(referralUrl);

  // Fetch partner logo as data URL
  let partnerLogoDataUrl: string;
  try {
    partnerLogoDataUrl = await fetchImageAsDataUrl(partnerLogoUrl);
    console.log('✅ Fetched partner logo');
  } catch (err) {
    console.error('Error fetching partner logo:', err);
    // Use a placeholder
    partnerLogoDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }

  // Results object
  const results: {
    qrCodeUrl: string | null;
    bannerPartnerUrl: string | null;
    bannerFacebookUrl: string | null;
    bannerFacebookCoBrandedUrl: string | null;
    bannerTwitterUrl: string | null;
    bannerTwitterCoBrandedUrl: string | null;
  } = {
    qrCodeUrl: null,
    bannerPartnerUrl: null,
    bannerFacebookUrl: null,
    bannerFacebookCoBrandedUrl: null,
    bannerTwitterUrl: null,
    bannerTwitterCoBrandedUrl: null,
  };

  try {
    // Upload QR code
    const qrBase64 = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
    const qrBuffer = Buffer.from(qrBase64, 'base64');
    results.qrCodeUrl = await uploadToStorage(qrBuffer, `${baseFolder}/qr-code.png`);
    console.log('✅ Uploaded QR code');

    // Generate Facebook Standard banner
    const fbStandardSvg = await satori(
      createFacebookStandardBanner(qrCodeDataUrl) as any,
      { width: 1080, height: 1080, fonts }
    );
    const fbStandardPng = await compositeBanner(backgroundBuffer, fbStandardSvg, 1080, 1080, 'facebook');
    results.bannerFacebookUrl = await uploadToStorage(fbStandardPng, `${baseFolder}/banner-facebook.png`);
    console.log('✅ Generated Facebook standard banner');

    // Generate Facebook Co-Branded banner
    const fbCoBrandedSvg = await satori(
      createFacebookCoBrandedBanner(qrCodeDataUrl, partnerLogoDataUrl) as any,
      { width: 1080, height: 1080, fonts }
    );
    const fbCoBrandedPng = await compositeBanner(backgroundBuffer, fbCoBrandedSvg, 1080, 1080, 'facebook');
    results.bannerFacebookCoBrandedUrl = await uploadToStorage(fbCoBrandedPng, `${baseFolder}/banner-facebook-cobranded.png`);
    console.log('✅ Generated Facebook co-branded banner');

    // Generate Twitter Standard banner
    const twStandardSvg = await satori(
      createTwitterStandardBanner(qrCodeDataUrl) as any,
      { width: 1600, height: 900, fonts }
    );
    const twStandardPng = await compositeBanner(backgroundBuffer, twStandardSvg, 1600, 900, 'twitter');
    results.bannerTwitterUrl = await uploadToStorage(twStandardPng, `${baseFolder}/banner-twitter.png`);
    console.log('✅ Generated Twitter standard banner');

    // Generate Twitter Co-Branded banner
    const twCoBrandedSvg = await satori(
      createTwitterCoBrandedBanner(qrCodeDataUrl, partnerLogoDataUrl) as any,
      { width: 1600, height: 900, fonts }
    );
    const twCoBrandedPng = await compositeBanner(backgroundBuffer, twCoBrandedSvg, 1600, 900, 'twitter');
    results.bannerTwitterCoBrandedUrl = await uploadToStorage(twCoBrandedPng, `${baseFolder}/banner-twitter-cobranded.png`);
    console.log('✅ Generated Twitter co-branded banner');

    // Generate Partner banner
    const partnerSvg = await satori(
      createPartnerBanner(qrCodeDataUrl, partnerLogoDataUrl) as any,
      { width: 1600, height: 900, fonts }
    );
    const partnerPng = await compositeBanner(backgroundBuffer, partnerSvg, 1600, 900, 'twitter');
    results.bannerPartnerUrl = await uploadToStorage(partnerPng, `${baseFolder}/banner-partner.png`);
    console.log('✅ Generated Partner banner');

    console.log(`🎉 Generated ${Object.values(results).filter(Boolean).length} banner assets for ${partnerName}`);
  } catch (error) {
    console.error('Error generating banners:', error);
  }

  return results;
}

// Export QR code generation for standalone use
export { generateQRCode };
