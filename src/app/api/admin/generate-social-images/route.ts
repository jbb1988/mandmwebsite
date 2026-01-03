import { NextRequest, NextResponse } from 'next/server';
import { generateAllStaticImages, SOCIAL_IMAGE_TEMPLATES } from '@/lib/social-image-generator';
import { verifyAdmin } from '@/lib/admin-auth';

// Admin endpoint to generate all static social images
// This only needs to be run once (or when templates change)
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {

    const body = await request.json().catch(() => ({}));
    const { templateIds, formats } = body as {
      templateIds?: string[];
      formats?: string[];
    };

    console.log('Starting static social image generation...');
    console.log(`Templates: ${templateIds?.length || SOCIAL_IMAGE_TEMPLATES.length}`);

    const result = await generateAllStaticImages({
      templateIds,
      formats: formats as any,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${result.images.length} static images`,
      images: result.images,
    });
  } catch (error) {
    console.error('Error in admin generate-social-images:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET: Return list of templates and their static URLs
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const templates = SOCIAL_IMAGE_TEMPLATES.map(t => ({
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
    }));

    return NextResponse.json({
      success: true,
      templates,
      totalTemplates: templates.length,
      formatsPerTemplate: 5,
      totalImages: templates.length * 5,
    });
  } catch (error) {
    console.error('Error getting templates:', error);
    return NextResponse.json(
      { error: 'Failed to get templates' },
      { status: 500 }
    );
  }
}
