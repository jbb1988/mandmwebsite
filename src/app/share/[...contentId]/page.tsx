import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

// Force dynamic rendering to ensure runtime access to environment variables
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ contentId: string[] }>;
}

// Get preset image URL from Supabase storage
function getPresetImageUrl(presetId: string): string {
  const imageMap: Record<string, string> = {
    'anxiety_relief': 'Anxiety%20Relief.png',
    'deep_focus': 'Deep%20Focus.png',
    'recovery_healing': 'Recovery%20and%20Healing.png',
    'pre_competition_calm': 'Pre-Competition%20Calm.png',
    'power_intensity': 'Power%20and%20Intensity.png',
    'athletic_flow_state': 'Athletic%20Flow%20State.png',
    'high_energy_focus': 'High-Energy%20Focus.png',
    'meditation_mindfulness': 'Meditation%20and%20Mindfulness.png',
    'creative_flow': 'Creative%20Flow.png',
    'sleep_recovery': 'Sleep%20and%20Recovery.png',
  };
  
  const imageName = imageMap[presetId];
  if (imageName) {
    return `https://kuswlvbjplkgrqlmqtok.supabase.co/storage/v1/object/public/media-thumbnails/${imageName}`;
  }
  
  // Fallback to generic Sound Lab image
  return 'https://mindandmuscle.ai/images/sound-lab-preview.jpg';
}

// Fetch content data from Supabase
async function getContent(contentId: string) {
  console.log('[getContent] contentId:', contentId);
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if this is a Sound Lab share (format: sound-lab/mixId)
    if (contentId.includes('/')) {
      const [type, mixId] = contentId.split('/');
      if (type === 'sound-lab') {
        // First try to fetch from database (for user-created mixes)
        const { data: soundLabMix, error: soundLabError } = await supabase
          .from('sound_lab_mixes')
          .select('id, name, description')
          .eq('id', mixId)
          .single();

        if (!soundLabError && soundLabMix) {
          return {
            id: mixId,
            title: soundLabMix.name || 'Sound Lab Mix',
            description: soundLabMix.description || 'Custom sound mix for focus and relaxation',
            thumbnailUrl: 'https://mindandmuscle.ai/images/sound-lab-preview.jpg',
            category: 'sound-lab',
            type: 'sound-lab',
          };
        }
        
        // Try to fetch as a single soundscape from media_hub
        const { data: soundscape, error: soundscapeError } = await supabase
          .from('media_hub')
          .select('id, title, description, thumbnail_url')
          .eq('id', mixId)
          .eq('category', 'mind')
          .single();

        if (!soundscapeError && soundscape) {
          // Found actual soundscape - use its real thumbnail!
          return {
            id: mixId,
            title: soundscape.title,
            description: soundscape.description || 'Immersive soundscape for focus and relaxation',
            thumbnailUrl: soundscape.thumbnail_url,
            category: 'sound-lab',
            type: 'sound-lab',
          };
        }
        
        // Not in database - assume it's a preset mix
        // Handle both "preset-name" and just "name" formats
        const cleanMixId = mixId.replace('preset-', '');
        const mixName = cleanMixId
          .split(/[-_]/)  // Split on hyphens OR underscores
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Get the actual preset image from Supabase storage
        const presetImageUrl = getPresetImageUrl(cleanMixId);
        
        return {
          id: mixId,
          title: mixName,
          description: 'Custom sound mix for focus and relaxation',
          thumbnailUrl: presetImageUrl,
          category: 'sound-lab',
          type: 'sound-lab',
        };
      }
    }

    // First try media_hub table (for soundscapes and other content)
    // This handles soundscapes shared from Sound Lab via the media player
    const { data: mediaContent, error: mediaError } = await supabase
      .from('media_hub')
      .select('id, title, description, thumbnail_url, category')
      .eq('id', contentId)
      .single();

    console.log('[getContent] media_hub query:', { data: mediaContent, error: mediaError });

    if (!mediaError && mediaContent) {
      console.log('[getContent] Found in media_hub:', mediaContent.title);
      return {
        id: mediaContent.id,
        title: mediaContent.title || 'Mind & Muscle Content',
        description: mediaContent.description || 'Experience this content on Mind & Muscle',
        thumbnailUrl: mediaContent.thumbnail_url,
        category: mediaContent.category || 'mind',
        type: 'media-hub',
      };
    }

    // Try motivation_content table (Daily Hit content)
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
        type: 'daily-hit',
      };
    }

    console.log('[getContent] Content not found in any table');
    return null;
  } catch (error) {
    console.error('[getContent] Error fetching content:', error);
    return null;
  }
}

// Generate Open Graph metadata for the content
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const contentId = resolvedParams.contentId.join('/');
  const content = await getContent(contentId);

  if (!content) {
    return {
      title: 'Mind & Muscle',
      description: 'Mental and physical training for elite performers',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mindandmuscle.ai';
  // Fix URL construction for Sound Lab content
  const shareUrl = content.type === 'sound-lab' 
    ? `${baseUrl}/share/sound-lab/${content.id}`
    : `${baseUrl}/share/${content.id}`;

  // Clean up image URL (remove double slashes if present)
  // Replace any double slashes that aren't part of https://
  const cleanImageUrl = content.thumbnailUrl 
    ? content.thumbnailUrl.replace(/([^:])\/{2,}/g, '$1/')
    : null;

  const description = content.description.length > 200 
    ? content.description.substring(0, 197) + '...'
    : content.description;

  return {
    title: content.title,
    description: description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: shareUrl,
    },
    openGraph: {
      title: content.title,
      description: description,
      url: shareUrl,
      siteName: 'Mind & Muscle',
      locale: 'en_US',
      type: 'article',
      images: cleanImageUrl
        ? [
            {
              url: cleanImageUrl,
              width: 1200,
              height: 630,
              alt: content.title,
              type: 'image/jpeg',
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@mindandmuscle',
      title: content.title,
      description: description,
      images: cleanImageUrl ? [cleanImageUrl] : [],
    },
  };
}

// Share page component
export default async function SharePage({ params }: Props) {
  const resolvedParams = await params;
  const contentId = resolvedParams.contentId.join('/');
  const content = await getContent(contentId);

  // If content not found, redirect to homepage
  if (!content) {
    redirect('/');
  }

  const appStoreUrl = 'https://apps.apple.com/app/mind-muscle/id6736613459';
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.mindandmuscle.app';
  const deepLinkUrl = content.type === 'sound-lab' 
    ? `mindmuscle://sound-lab/${content.id}`
    : `mindmuscle://daily-hit?contentId=${content.id}`;

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
