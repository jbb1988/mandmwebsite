import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { escapeHtml } from '@/lib/validation';
import { partnerApplicationRateLimit, getClientIp, checkRateLimit } from '@/lib/rate-limit';
import { generatePartnerBanners } from '@/lib/banner-generator';

// Supabase client for storing partner data
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to validate form data fields
function validateFormData(data: {
  name: string;
  email: string;
  turnstileToken: string;
  networkSize?: string;
  promotionChannel?: string;
  whyExcited?: string;
}): { valid: boolean; error?: string } {
  if (!data.name || data.name.trim().length < 2) {
    return { valid: false, error: 'Name is required and must be at least 2 characters' };
  }
  if (!data.email || !data.email.includes('@')) {
    return { valid: false, error: 'Valid email is required' };
  }
  if (!data.turnstileToken) {
    return { valid: false, error: 'Security verification is required' };
  }
  return { valid: true };
}

// Verify Cloudflare Turnstile token
async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: ip,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const ip = getClientIp(request);
    const rateLimitResult = await checkRateLimit(partnerApplicationRateLimit, ip);

    if (rateLimitResult && !rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimitResult.reset ? Math.ceil((rateLimitResult.reset - Date.now()) / 1000) : 300
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.reset ? Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString() : '300',
            'X-RateLimit-Limit': rateLimitResult.limit?.toString() || '2',
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Parse FormData (supports both FormData and JSON for backwards compatibility)
    let name: string;
    let email: string;
    let organization: string | undefined;
    let audience: string | undefined;
    let networkSize: string | undefined;
    let promotionChannel: string | undefined;
    let whyExcited: string | undefined;
    let turnstileToken: string;
    let logoFile: File | null = null;
    let source: string | undefined;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData submission
      const formData = await request.formData();
      name = formData.get('name') as string || '';
      email = formData.get('email') as string || '';
      organization = formData.get('organization') as string || undefined;
      audience = formData.get('audience') as string || undefined;
      networkSize = formData.get('networkSize') as string || undefined;
      promotionChannel = formData.get('promotionChannel') as string || undefined;
      whyExcited = formData.get('whyExcited') as string || undefined;
      turnstileToken = formData.get('turnstileToken') as string || '';
      logoFile = formData.get('logo') as File | null;
      source = formData.get('source') as string || undefined;
    } else {
      // Handle JSON submission (backwards compatibility)
      const body = await request.json();
      name = body.name || '';
      email = body.email || '';
      organization = body.organization;
      audience = body.audience;
      networkSize = body.networkSize;
      promotionChannel = body.promotionChannel;
      whyExcited = body.whyExcited;
      turnstileToken = body.turnstileToken || '';
      source = body.source;
    }

    // Validate input
    const validation = validateFormData({ name, email, turnstileToken, networkSize, promotionChannel, whyExcited });
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Verify Turnstile CAPTCHA token
    const isCaptchaValid = await verifyTurnstileToken(turnstileToken, ip);

    if (!isCaptchaValid) {
      return NextResponse.json(
        { error: 'CAPTCHA verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // Escape HTML in user inputs for email display
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeOrganization = organization ? escapeHtml(organization) : 'Not provided';
    const safeNetworkSize = networkSize ? escapeHtml(networkSize) : 'Not provided';
    const safePromotionChannel = promotionChannel ? escapeHtml(promotionChannel) : 'Not provided';
    const safeWhyExcited = whyExcited ? escapeHtml(whyExcited) : 'Not provided';
    const safeAudience = audience ? escapeHtml(audience) : 'Not provided';

    // Split name into first and last for Tolt API
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || name;
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Automatically create partner in Tolt
    const toltApiKey = process.env.TOLT_API_KEY;

    if (!toltApiKey) {
      console.error('TOLT_API_KEY not configured');
      return NextResponse.json({ error: 'Partner system not configured' }, { status: 500 });
    }

    let toltCreationSucceeded = false;
    let toltPartnerId: string | null = null;
    let referralSlug: string | null = null;
    let referralUrl: string | null = null;

    try {
      // Prepare the request body with required program_id
      const toltRequestBody: any = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        program_id: "prg_XZjuxmy3JkyE9oTFKEFDbcLD", // Mind & Muscle's Program ID
      };

      // Add optional fields if provided
      if (organization && organization.trim()) {
        toltRequestBody.company_name = organization;
      }

      // Add country code (default to US for now)
      toltRequestBody.country_code = "US";

      // Set payout method to none by default (partner can configure later in dashboard)
      toltRequestBody.payout_method = "none";

      console.log('=== TOLT API REQUEST (Create Partner) ===');
      console.log('Endpoint:', 'https://api.tolt.com/v1/partners');

      // Create partner in Tolt via API
      const toltResponse = await fetch('https://api.tolt.com/v1/partners', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${toltApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toltRequestBody),
      });

      if (!toltResponse.ok) {
        const errorData = await toltResponse.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Tolt API Error Response:', JSON.stringify(errorData, null, 2));

        // If partner already exists, try to fetch their ID
        if (errorData.message?.includes('already exists') || errorData.error?.includes('already exists') || toltResponse.status === 409) {
          console.log('Partner may already exist, fetching existing partner...');
          try {
            const searchResponse = await fetch(`https://api.tolt.com/v1/partners?email=${encodeURIComponent(email)}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${toltApiKey}`,
                'Content-Type': 'application/json',
              },
            });
            if (searchResponse.ok) {
              const searchData = await searchResponse.json();
              console.log('Search response:', JSON.stringify(searchData, null, 2));
              if (searchData.data && searchData.data.length > 0) {
                toltPartnerId = searchData.data[0].id;
                toltCreationSucceeded = true;
                console.log('✅ Found existing partner ID:', toltPartnerId);
              }
            }
          } catch (searchErr) {
            console.error('Error searching for existing partner:', searchErr);
          }
        }
      } else {
        const toltData = await toltResponse.json();
        console.log('✅ Partner created in Tolt successfully!');
        console.log('Tolt response:', JSON.stringify(toltData, null, 2));
        // Tolt returns data as an array
        toltPartnerId = toltData.data?.[0]?.id || toltData.data?.id || toltData.id || null;
        toltCreationSucceeded = true;
      }

      // Step 2: Create referral link for the partner
      if (toltPartnerId) {
          // Generate slug from name (e.g., "John Smith" -> "john-smith")
          let baseSlug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

          // Try to create the link, add random suffix if slug collision
          let linkCreated = false;
          let attempts = 0;
          const maxAttempts = 3;

          while (!linkCreated && attempts < maxAttempts) {
            const slugToTry = attempts === 0 ? baseSlug : `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

            console.log(`=== TOLT API REQUEST (Create Link, attempt ${attempts + 1}) ===`);
            console.log('Slug:', slugToTry);

            const linkResponse = await fetch('https://api.tolt.com/v1/links', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${toltApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                param: 'ref',
                value: slugToTry,
                partner_id: toltPartnerId,
              }),
            });

            if (linkResponse.ok) {
              const linkData = await linkResponse.json();
              console.log('✅ Referral link created successfully!');
              referralSlug = slugToTry;
              referralUrl = `https://mindandmuscle.ai/?ref=${slugToTry}`;
              linkCreated = true;
            } else {
              const linkError = await linkResponse.json().catch(() => ({ message: 'Unknown error' }));
              console.error(`❌ Link creation attempt ${attempts + 1} failed:`, linkError);
              attempts++;
            }
          }

          if (!linkCreated) {
            console.error('❌ Failed to create referral link after all attempts');
          }
        }
    } catch (toltError: any) {
      console.error('❌ Exception calling Tolt API:', toltError.message);
      // Don't fail the whole request - still send notification email
    }

    // Upload logo to Supabase Storage if provided
    let logoUrl: string | null = null;
    if (logoFile && logoFile.size > 0) {
      try {
        const timestamp = Date.now();
        const sanitizedEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const fileExt = logoFile.name.split('.').pop() || 'png';
        const logoPath = `partner-logos/${sanitizedEmail}-${timestamp}.${fileExt}`;

        const logoBuffer = Buffer.from(await logoFile.arrayBuffer());

        const { error: uploadError } = await supabase.storage
          .from('partner-logos')
          .upload(logoPath, logoBuffer, {
            contentType: logoFile.type,
            upsert: true,
          });

        if (uploadError) {
          console.error('Error uploading partner logo:', uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('partner-logos')
            .getPublicUrl(logoPath);
          logoUrl = urlData.publicUrl;
          console.log('✅ Partner logo uploaded:', logoUrl);
        }
      } catch (uploadErr) {
        console.error('Exception uploading logo:', uploadErr);
        // Don't fail - logo is optional
      }
    }

    // Save partner to Supabase (for FB outreach tracking and local analytics)
    try {
      const { error: supabaseError } = await supabase
        .from('partners')
        .upsert({
          email: email,
          name: name,
          first_name: firstName,
          last_name: lastName,
          organization: organization || null,
          network_size: networkSize || null,
          promotion_channel: promotionChannel || null,
          why_excited: whyExcited || null,
          audience: audience || null,
          logo_url: logoUrl,
          referral_slug: referralSlug,
          referral_url: referralUrl,
          tolt_partner_id: toltPartnerId,
          source: source || null,
        }, {
          onConflict: 'email',
        });

      if (supabaseError) {
        console.error('Error saving partner to Supabase:', supabaseError);
      } else {
        console.log('✅ Partner saved to Supabase');
      }
    } catch (supabaseErr) {
      console.error('Exception saving to Supabase:', supabaseErr);
      // Don't fail the request - Tolt is primary source of truth
    }

    // Generate banners if referral URL is available (logo is optional - determines which banners are made)
    let bannerUrls: {
      qrCodeUrl: string | null;
      bannerPartnerUrl: string | null;
      bannerFacebookUrl: string | null;
      bannerFacebookCoBrandedUrl: string | null;
      bannerTwitterUrl: string | null;
      bannerTwitterCoBrandedUrl: string | null;
    } | null = null;

    if (referralUrl) {
      try {
        console.log('🎨 Generating banners for partner...');
        console.log(logoUrl ? '📷 Partner has logo - will generate all banners' : '⚠️ No logo - will generate standard banners only');
        bannerUrls = await generatePartnerBanners({
          partnerName: name,
          partnerEmail: email,
          partnerLogoUrl: logoUrl || null, // Pass null if no logo
          referralUrl: referralUrl,
        });

        // Save to partner_banners table
        if (bannerUrls) {
          const { error: bannerDbError } = await supabase
            .from('partner_banners')
            .insert({
              partner_name: name,
              partner_email: email,
              partner_logo_url: logoUrl || null,
              qr_code_url: bannerUrls.qrCodeUrl,
              banner_partner_url: bannerUrls.bannerPartnerUrl,
              banner_facebook_url: bannerUrls.bannerFacebookUrl,
              banner_facebook_cobranded_url: bannerUrls.bannerFacebookCoBrandedUrl,
              banner_twitter_url: bannerUrls.bannerTwitterUrl,
              banner_twitter_cobranded_url: bannerUrls.bannerTwitterCoBrandedUrl,
              notes: logoUrl ? 'Auto-generated on partner signup' : 'Auto-generated (standard only - no logo provided)',
            });

          if (bannerDbError) {
            console.error('Error saving banners to database:', bannerDbError);
          } else {
            console.log('✅ Banners saved to partner_banners table');
          }
        }
      } catch (bannerErr) {
        console.error('Error generating banners:', bannerErr);
        // Don't fail - banners are nice-to-have
      }
    }

    // Send internal notification email
    await resend.emails.send({
      from: 'Mind & Muscle Partners <partners@mindandmuscle.ai>',
      to: 'support@mindandmuscle.ai',
      replyTo: email,
      subject: `New Partner Application: ${safeName}`,
      html: `
        <h2>New Partner Program Application</h2>

        <h3>Applicant Details:</h3>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Organization:</strong> ${safeOrganization}</p>
        <p><strong>Network Size:</strong> ${safeNetworkSize}</p>
        <p><strong>Promotion Channel:</strong> ${safePromotionChannel}</p>

        <h3>Why They're Excited:</h3>
        <p>${safeWhyExcited}</p>

        <h3>Audience Information:</h3>
        <p>${safeAudience}</p>

        ${logoUrl ? `
        <h3>Partner Logo:</h3>
        <p><a href="${logoUrl}" target="_blank">View uploaded logo</a></p>
        <img src="${logoUrl}" alt="Partner logo" style="max-width: 200px; max-height: 200px; border: 1px solid #eee; border-radius: 8px; padding: 10px;" />
        ` : ''}

        ${referralUrl ? `
        <h3>Referral Link:</h3>
        <p><a href="${referralUrl}" target="_blank">${referralUrl}</a></p>
        <p style="color: #666; font-size: 12px;">Slug: <code>${referralSlug}</code></p>
        ` : ''}

        ${bannerUrls ? `
        <h3>Auto-Generated Banners:</h3>
        <ul style="font-size: 14px;">
          ${bannerUrls.bannerFacebookUrl ? `<li><a href="${bannerUrls.bannerFacebookUrl}">Facebook Standard (1080x1080)</a></li>` : ''}
          ${bannerUrls.bannerFacebookCoBrandedUrl ? `<li><a href="${bannerUrls.bannerFacebookCoBrandedUrl}">Facebook Co-Branded (1080x1080)</a></li>` : ''}
          ${bannerUrls.bannerTwitterUrl ? `<li><a href="${bannerUrls.bannerTwitterUrl}">X/Twitter Standard (1600x900)</a></li>` : ''}
          ${bannerUrls.bannerTwitterCoBrandedUrl ? `<li><a href="${bannerUrls.bannerTwitterCoBrandedUrl}">X/Twitter Co-Branded (1600x900)</a></li>` : ''}
          ${bannerUrls.bannerPartnerUrl ? `<li><a href="${bannerUrls.bannerPartnerUrl}">Partner Banner (1600x900)</a></li>` : ''}
          ${bannerUrls.qrCodeUrl ? `<li><a href="${bannerUrls.qrCodeUrl}">QR Code</a></li>` : ''}
        </ul>
        <p style="color: #28a745; font-size: 12px;">✅ Banners were emailed to partner as attachments</p>
        ` : ''}

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />

        ${toltCreationSucceeded
          ? `<p style="color: #28a745; font-weight: bold;">✅ Partner automatically created in Tolt!</p>
             <p style="color: #666; font-size: 12px;">
               The partner has been added to Tolt and will receive their onboarding email with dashboard access.<br />
               ${referralUrl ? `Referral link auto-created: <strong>${referralUrl}</strong><br />` : ''}
               View them in your <a href="https://app.tolt.io">Tolt dashboard</a> → Partners.<br /><br />
               If needed, you can remove or block the partner in the dashboard.
             </p>`
          : `<p style="color: #dc3545; font-weight: bold;">⚠️ Tolt partner creation failed</p>
             <p style="color: #666; font-size: 12px;">
               The partner was NOT created in Tolt automatically. Check Vercel logs for details.<br />
               You'll need to manually create this partner in your <a href="https://app.tolt.io">Tolt dashboard</a>.<br /><br />
               User details: ${safeEmail} (${safeName})
             </p>`
        }
      `,
    });

    // Prepare email attachments if banners were generated
    const emailAttachments: { filename: string; content: Buffer }[] = [];

    if (bannerUrls) {
      try {
        // Fetch all banner images and add as attachments
        const bannerFetchPromises: Promise<{ filename: string; buffer: Buffer } | null>[] = [];

        if (bannerUrls.qrCodeUrl) {
          bannerFetchPromises.push(
            fetch(bannerUrls.qrCodeUrl)
              .then(r => r.arrayBuffer())
              .then(ab => ({ filename: 'qr-code.png', buffer: Buffer.from(ab) }))
              .catch(() => null)
          );
        }

        if (bannerUrls.bannerFacebookUrl) {
          bannerFetchPromises.push(
            fetch(bannerUrls.bannerFacebookUrl)
              .then(r => r.arrayBuffer())
              .then(ab => ({ filename: 'facebook-banner-1080x1080.png', buffer: Buffer.from(ab) }))
              .catch(() => null)
          );
        }

        if (bannerUrls.bannerFacebookCoBrandedUrl) {
          bannerFetchPromises.push(
            fetch(bannerUrls.bannerFacebookCoBrandedUrl)
              .then(r => r.arrayBuffer())
              .then(ab => ({ filename: 'facebook-cobranded-1080x1080.png', buffer: Buffer.from(ab) }))
              .catch(() => null)
          );
        }

        if (bannerUrls.bannerTwitterUrl) {
          bannerFetchPromises.push(
            fetch(bannerUrls.bannerTwitterUrl)
              .then(r => r.arrayBuffer())
              .then(ab => ({ filename: 'twitter-banner-1600x900.png', buffer: Buffer.from(ab) }))
              .catch(() => null)
          );
        }

        if (bannerUrls.bannerTwitterCoBrandedUrl) {
          bannerFetchPromises.push(
            fetch(bannerUrls.bannerTwitterCoBrandedUrl)
              .then(r => r.arrayBuffer())
              .then(ab => ({ filename: 'twitter-cobranded-1600x900.png', buffer: Buffer.from(ab) }))
              .catch(() => null)
          );
        }

        if (bannerUrls.bannerPartnerUrl) {
          bannerFetchPromises.push(
            fetch(bannerUrls.bannerPartnerUrl)
              .then(r => r.arrayBuffer())
              .then(ab => ({ filename: 'partner-banner-1600x900.png', buffer: Buffer.from(ab) }))
              .catch(() => null)
          );
        }

        const fetchedBanners = await Promise.all(bannerFetchPromises);
        for (const banner of fetchedBanners) {
          if (banner) {
            emailAttachments.push({ filename: banner.filename, content: banner.buffer });
          }
        }

        console.log(`📎 Prepared ${emailAttachments.length} banner attachments for email`);
      } catch (attachErr) {
        console.error('Error preparing email attachments:', attachErr);
        // Don't fail - send email without attachments
      }
    }

    // Build the welcome email content - varies based on whether banners were generated
    const hasBanners = bannerUrls && emailAttachments.length > 0;
    const hasReferralLink = referralUrl && referralSlug;
    const hasLogo = Boolean(logoUrl);
    const hasCoBrandedBanners = hasLogo && bannerUrls?.bannerFacebookCoBrandedUrl;

    // Sample co-branded banner URL for partners without logos
    const sampleCoBrandedBannerUrl = 'https://api.mindandmuscle.ai/storage/v1/object/public/partner-banners/samples/sample-cobranded-banner.png';

    const welcomeEmailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: linear-gradient(135deg, #fb923c 0%, #3b82f6 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <img src="https://mindandmuscle.ai/assets/images/logo.png" alt="Mind & Muscle Logo" style="max-width: 180px; height: auto; margin-bottom: 20px;" />
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 800;">Welcome to the Team!</h1>
          </div>

          <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 18px; color: #111; margin-bottom: 20px;">Hi ${safeName},</p>

            <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 20px;">
              Thanks for joining the Mind & Muscle Partner Program! You've been automatically set up in our system and your partner dashboard is ready to go.
            </p>

            ${hasReferralLink ? `
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #22c55e; padding: 25px; margin: 30px 0; border-radius: 12px; text-align: center;">
              <h2 style="margin: 0 0 15px 0; font-size: 22px; color: #16a34a;">🎉 Your Referral Link is Ready!</h2>
              <p style="font-size: 14px; color: #555; margin-bottom: 15px;">Share this link to earn <strong>10% base commission</strong> (+ 15% bonus at 100+ users):</p>
              <div style="background: white; border: 2px dashed #22c55e; padding: 15px 20px; border-radius: 8px; margin-bottom: 15px;">
                <a href="${referralUrl}" style="font-size: 18px; font-weight: 700; color: #16a34a; text-decoration: none; word-break: break-all;">${referralUrl}</a>
              </div>
              <p style="font-size: 12px; color: #666; margin: 0;">Your unique partner code: <code style="background: #e5e7eb; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${referralSlug}</code></p>
            </div>
            ` : ''}

            ${hasBanners && hasCoBrandedBanners ? `
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; padding: 25px; margin: 30px 0; border-radius: 12px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #d97706;">🎨 Your Custom Marketing Banners</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 15px;">
                We've created personalized banners featuring your logo and a QR code linked to your referral URL. <strong>Check the attachments in this email!</strong>
              </p>
              <div style="background: white; border-radius: 8px; padding: 15px;">
                <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;"><strong>Included banners:</strong></p>
                <ul style="font-size: 13px; color: #555; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li><strong>Facebook (1080x1080)</strong> - Perfect for posts and ads</li>
                  <li><strong>Facebook Co-Branded (1080x1080)</strong> - Features your logo</li>
                  <li><strong>X/Twitter (1600x900)</strong> - Ideal for tweets and headers</li>
                  <li><strong>X/Twitter Co-Branded (1600x900)</strong> - Features your logo</li>
                  <li><strong>Partner Banner (1600x900)</strong> - For your website/email</li>
                  <li><strong>QR Code</strong> - Links directly to your referral URL</li>
                </ul>
              </div>
              <p style="font-size: 13px; color: #666; margin-top: 15px; font-style: italic;">
                💡 Tip: Use the co-branded banners to build trust with your audience!
              </p>
            </div>
            ` : hasBanners ? `
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; padding: 25px; margin: 30px 0; border-radius: 12px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #d97706;">🎨 Your Marketing Banners</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 15px;">
                We've created banners with a QR code linked to your referral URL. <strong>Check the attachments in this email!</strong>
              </p>
              <div style="background: white; border-radius: 8px; padding: 15px;">
                <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;"><strong>Included banners:</strong></p>
                <ul style="font-size: 13px; color: #555; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li><strong>Facebook (1080x1080)</strong> - Perfect for posts and ads</li>
                  <li><strong>X/Twitter (1600x900)</strong> - Ideal for tweets and headers</li>
                  <li><strong>QR Code</strong> - Links directly to your referral URL</li>
                </ul>
              </div>

              <div style="background: #f0f9ff; border: 2px dashed #3b82f6; padding: 20px; margin-top: 20px; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #3b82f6;">🌟 Want Co-Branded Banners With YOUR Logo?</h3>
                <p style="font-size: 14px; line-height: 1.6; color: #555; margin-bottom: 15px;">
                  We can create personalized <strong>co-branded banners</strong> featuring YOUR organization's logo alongside Mind & Muscle! These are perfect for building trust with your audience.
                </p>
                <p style="font-size: 14px; line-height: 1.6; color: #555; margin-bottom: 15px;">
                  <strong>Here's an example of what your co-branded banner could look like:</strong>
                </p>
                <div style="text-align: center; margin-bottom: 15px;">
                  <a href="${sampleCoBrandedBannerUrl}" target="_blank" style="display: inline-block;">
                    <img src="${sampleCoBrandedBannerUrl}" alt="Click to view sample co-branded banner with partner logo" style="max-width: 100%; height: auto; border-radius: 8px; border: 2px solid #3b82f6;" />
                  </a>
                </div>
                <p style="font-size: 12px; color: #888; margin-bottom: 15px; text-align: center; font-style: italic;">
                  (If the image doesn't load, <a href="${sampleCoBrandedBannerUrl}" target="_blank" style="color: #3b82f6;">click here to view the sample</a>)
                </p>
                <div style="background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center;">
                  <p style="font-size: 15px; color: #1e40af; margin: 0; font-weight: 600;">
                    📧 Just reply to this email with your logo!
                  </p>
                  <p style="font-size: 13px; color: #3b82f6; margin: 10px 0 0 0;">
                    Send us a PNG or JPG (at least 200x200px) and we'll create your custom co-branded banners for Facebook, X/Twitter, and more!
                  </p>
                </div>
              </div>
            </div>
            ` : ''}

            <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border: 2px solid #8b5cf6; padding: 25px; margin: 30px 0; border-radius: 12px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #7c3aed;">📧 Ready-to-Use Email Templates</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 20px;">
                We've created professionally written email templates you can use to promote Mind & Muscle to your network. Just copy, personalize, and send!
              </p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="https://mindandmuscle.ai/partner/login" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);">
                  Open Partner Dashboard →
                </a>
              </div>
              <div style="background: white; border-radius: 8px; padding: 15px; margin-top: 15px;">
                <ul style="font-size: 13px; color: #555; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li><strong>16 proven templates</strong> for different audiences</li>
                  <li><strong>One-click copy</strong> with your referral link pre-filled</li>
                  <li><strong>Works perfectly</strong> in Gmail, Outlook, and any email client</li>
                </ul>
              </div>
            </div>

            <div style="background: #fff3e0; border-left: 4px solid #fb923c; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #fb923c;">🚀 Access Your Partner Dashboard</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 20px;">
                Your partner account has been created! Access your dashboard with a simple login link:
              </p>

              <div style="background: #f0fdf4; border: 2px solid #22c55e; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0 0 10px 0;">
                  <strong style="color: #22c55e;">Step 1:</strong> Go to <a href="https://mindandmuscle.ai/partner/login" style="color: #fb923c; text-decoration: none; font-weight: 600;">mindandmuscle.ai/partner/login</a>
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0 0 10px 0;">
                  <strong style="color: #22c55e;">Step 2:</strong> Enter your email: <strong>${safeEmail}</strong>
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0;">
                  <strong style="color: #22c55e;">Step 3:</strong> Check your email for a <strong>magic login link</strong> and click it!
                </p>
              </div>

              <div style="text-align: center; margin: 20px 0;">
                <a href="https://mindandmuscle.ai/partner/login" style="display: inline-block; background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(251, 146, 60, 0.4);">
                  Access Partner Dashboard →
                </a>
              </div>

              <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 15px; font-style: italic; text-align: center;">
                💡 No password needed - we use secure magic links for easy login!
              </p>
            </div>

            <div style="background: #f8fafc; border-left: 4px solid #fb923c; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #fb923c;">📚 What You'll Find in Your Dashboard</h2>
              <ul style="font-size: 15px; line-height: 1.8; color: #555; margin: 10px 0;">
                <li>📊 <strong>Performance Overview</strong> - Earnings, referrals, and pending payouts</li>
                <li>✉️ <strong>Email Templates</strong> - Ready-to-send outreach emails for every audience</li>
                <li>📱 <strong>Social Media Posts</strong> - Copy-paste content for Instagram, X, TikTok & more</li>
                <li>📂 <strong>Resources</strong> - PDFs, brand assets, and program guides</li>
                <li>🎨 <strong>Your Assets</strong> - Custom banners, QR codes, and marketing materials</li>
              </ul>
              <p style="font-size: 14px; color: #666; margin-top: 15px; font-style: italic;">
                💡 For detailed click tracking and payout history, you can also access your <a href="https://mind-and-muscle.tolt.io" style="color: #8b5cf6; font-weight: 600;">Tolt Dashboard</a>.
              </p>
            </div>

            <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #3b82f6;">💰 Commission Structure</h2>
              <ul style="font-size: 15px; line-height: 1.8; color: #555; margin: 10px 0;">
                <li><strong>10% base commission</strong> on all referrals (lifetime recurring!)</li>
                <li><strong>15% bonus commission</strong> on organizations with 100+ users</li>
                <li><strong>90-day cookie window</strong> for attribution</li>
                <li><strong>$50 minimum payout</strong> threshold</li>
                <li><strong>Monthly PayPal payouts</strong> (NET-60 terms)</li>
              </ul>
            </div>

            ${hasReferralLink ? `
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #22c55e;">🎯 Start Earning Now!</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 15px;">
                Your referral link is already active. Here's how to maximize your earnings:
              </p>
              <ol style="font-size: 15px; line-height: 1.8; color: #555; margin: 10px 0; padding-left: 20px;">
                <li><strong>Share your link</strong> - Post on social media, add to your website, or send to your network</li>
                <li><strong>Use the banners</strong> - ${hasBanners ? 'Check the attachments for ready-to-use marketing materials' : 'Visit your dashboard for marketing materials'}</li>
                <li><strong>Track your performance</strong> - Monitor clicks and conversions in your dashboard</li>
                <li><strong>Get paid</strong> - Earn 10% base + 15% bonus at 100+ users!</li>
              </ol>
            </div>
            ` : `
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #22c55e;">🎯 Next Steps to Start Earning</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 15px;">
                Your partner account is ready! Here's how to get started:
              </p>
              <ol style="font-size: 15px; line-height: 1.8; color: #555; margin: 10px 0; padding-left: 20px;">
                <li><strong>Access your Partner Dashboard</strong> - Visit <a href="https://mindandmuscle.ai/partner/login" style="color: #fb923c;">mindandmuscle.ai/partner/login</a> to see your resources, email templates, and marketing materials</li>
                <li><strong>Create your referral link</strong> - Go to your <a href="https://mind-and-muscle.tolt.io" style="color: #fb923c;">Tolt Dashboard</a>, click "Create Link" and enter a custom value (e.g., "john", "wildcats")</li>
                <li><strong>Share your link</strong> - Post on social media, email your network, or add to your website</li>
                <li><strong>Start earning</strong> - Earn 10% base + 15% bonus at 100+ users!</li>
              </ol>
              <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 15px; font-style: italic;">
                💡 Tip: Your referral link works immediately - no approval needed! Start earning as soon as you share it.
              </p>
            </div>
            `}

            <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 30px 0 20px 0;">
              Questions? Just reply to this email or reach out to <a href="mailto:partners@mindandmuscle.ai" style="color: #fb923c; text-decoration: none; font-weight: 600;">partners@mindandmuscle.ai</a>
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 10px;">
              Let's build something great together! 💪🧠
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 0;">
              <strong>The Mind & Muscle Team</strong>
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #999; font-size: 14px;">
            <p style="margin: 0; font-weight: 600;">Mind and Muscle</p>
            <p style="margin: 5px 0; font-style: italic;">Discipline the Mind. Dominate the Game.</p>
            <p style="margin: 10px 0 5px 0; font-size: 12px;">
              <strong>Partner Program:</strong> Earn 10% base + 15% bonus at 100+ users
            </p>
            <p style="margin: 5px 0 0 0;">
              <a href="https://mindandmuscle.ai/partner-program" style="color: #fb923c; text-decoration: none;">Learn More</a> |
              <a href="https://mindandmuscle.ai" style="color: #fb923c; text-decoration: none; margin-left: 8px;">mindandmuscle.ai</a>
            </p>
          </div>
        </div>
      `;

    // Send welcome email to partner with resources link (and attachments if available)
    await resend.emails.send({
      from: 'Mind & Muscle Partners <partners@mindandmuscle.ai>',
      to: email,
      subject: hasBanners
        ? 'Welcome to Mind & Muscle! 🎉 Your Custom Banners Are Attached'
        : 'Welcome to the Mind & Muscle Partner Program! 🎉',
      html: welcomeEmailHtml,
      ...(emailAttachments.length > 0 && { attachments: emailAttachments }),
    });

    console.log('Partner Application:', { name, email, organization, networkSize });

    return NextResponse.json({
      success: true,
      message: 'Application received and partner created in Tolt'
    });
  } catch (error: any) {
    console.error('Error processing partner application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
