import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ contentId: string }>;
}

// Fetch content data from Supabase
async function getContent(contentId: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // First try motivation_content table (Daily Hit content)
    const { data: dailyMotivation, error: dailyError } = await supabase
      .from('motivation_content')
      .select('id, title, headline, body, thumbnail_url, media_type, delivery_date')
      .eq('id', contentId)
      .single();

    if (!dailyError && dailyMotivation) {
      return {
        id: dailyMotivation.id,
        title: dailyMotivation.title || 'Daily Hit',
        description: dailyMotivation.body || dailyMotivation.headline || 'Experience this mental training session',
        thumbnailUrl: dailyMotivation.thumbnail_url,
        category: 'mind',
      };
    }

    // Try media_hub table (other content)
    const { data: mediaContent, error: mediaError } = await supabase
      .from('media_hub')
      .select('id, title, description, thumbnail_url, category')
      .eq('id', contentId)
      .single();

    if (!mediaError && mediaContent) {
      return {
        id: mediaContent.id,
        title: mediaContent.title || 'Mind & Muscle Content',
        description: mediaContent.description || 'Experience this content on Mind & Muscle',
        thumbnailUrl: mediaContent.thumbnail_url,
        category: mediaContent.category || 'mind',
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching content:', error);
    return null;
  }
}

// Generate Open Graph metadata for the content
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const content = await getContent(resolvedParams.contentId);

  if (!content) {
    return {
      title: 'Mind & Muscle',
      description: 'Mental and physical training for elite performers',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mindandmuscle.ai';
  const shareUrl = `${baseUrl}/share/${content.id}`;

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.title,
      description: content.description,
      url: shareUrl,
      siteName: 'Mind & Muscle',
      images: content.thumbnailUrl
        ? [
            {
              url: content.thumbnailUrl,
              width: 1200,
              height: 630,
              alt: content.title,
            },
          ]
        : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
      images: content.thumbnailUrl ? [content.thumbnailUrl] : [],
    },
  };
}

// Share page component
export default async function SharePage({ params }: Props) {
  const resolvedParams = await params;
  const content = await getContent(resolvedParams.contentId);

  // If content not found, redirect to homepage
  if (!content) {
    redirect('/');
  }

  const appStoreUrl = 'https://apps.apple.com/app/mind-muscle/id6736613459';
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.mindandmuscle.app';
  const deepLinkUrl = `mindmuscle://content/${content.id}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Auto-redirect script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Try to open the app
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isAndroid = /Android/.test(navigator.userAgent);
            
            if (isIOS || isAndroid) {
              window.location.href = '${deepLinkUrl}';
              
              // After a delay, redirect to appropriate app store
              setTimeout(function() {
                if (isIOS) {
                  window.location.href = '${appStoreUrl}';
                } else if (isAndroid) {
                  window.location.href = '${playStoreUrl}';
                }
              }, 2000);
            }
          `,
        }}
      />

      {/* Content visible by default */}
      <div id="download-section" className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          {content.thumbnailUrl && (
            <img
              src={content.thumbnailUrl}
              alt={content.title}
              className="w-full max-w-md mx-auto rounded-2xl shadow-2xl mb-8"
            />
          )}
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            {content.title}
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            {content.description}
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-2xl font-bold text-white mb-6">
            Download Mind & Muscle to view this content
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={appStoreUrl}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Download on iOS
            </a>
            <a
              href={playStoreUrl}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Download on Android
            </a>
          </div>

          <p className="text-sm text-gray-400 mt-6">
            Already have the app?{' '}
            <a href={deepLinkUrl} className="text-blue-400 hover:underline">
              Open in Mind & Muscle
            </a>
          </p>
        </div>
      </div>

    </div>
  );
}
