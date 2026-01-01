import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import SwingAnalysisClient from './SwingAnalysisClient';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SwingAnalysisPageProps {
  params: Promise<{ id: string }>;
}

interface SwingAnalysisData {
  analysis: {
    id: string;
    summary: string | null;
    overall_rating: string | null;
    thumbnail_urls: string[] | null;
    video_url: string | null;
    coach_note: string | null;
    drill_title: string | null;
    created_at: string;
    owner_name: string | null;
    owner_avatar_url: string | null;
  } | null;
  error: string | null;
}

async function getSwingAnalysisData(id: string): Promise<SwingAnalysisData> {
  try {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return { analysis: null, error: 'Invalid analysis link' };
    }

    // Fetch the shared analysis with owner profile
    const { data: analysis, error: fetchError } = await supabase
      .from('swing_lab_analyses')
      .select(`
        id,
        summary,
        overall_rating,
        thumbnail_urls,
        video_url,
        coach_note,
        drill_title,
        created_at,
        is_shared,
        profiles!swing_lab_analyses_user_id_fkey(name, avatar_url)
      `)
      .eq('id', id)
      .eq('is_shared', true)
      .single();

    if (fetchError || !analysis) {
      return { analysis: null, error: 'Analysis not found or not shared' };
    }

    // Extract profile data - handle both single object and array returns from join
    const profileData = analysis.profiles;
    const profile = Array.isArray(profileData)
      ? profileData[0] as { name: string | null; avatar_url: string | null } | undefined
      : profileData as { name: string | null; avatar_url: string | null } | null;

    return {
      analysis: {
        id: analysis.id,
        summary: analysis.summary,
        overall_rating: analysis.overall_rating,
        thumbnail_urls: analysis.thumbnail_urls,
        video_url: analysis.video_url,
        coach_note: analysis.coach_note,
        drill_title: analysis.drill_title,
        created_at: analysis.created_at,
        owner_name: profile?.name || null,
        owner_avatar_url: profile?.avatar_url || null,
      },
      error: null,
    };
  } catch (err) {
    console.error('Error fetching swing analysis:', err);
    return { analysis: null, error: 'An error occurred' };
  }
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: SwingAnalysisPageProps): Promise<Metadata> {
  const { id } = await params;
  const { analysis, error } = await getSwingAnalysisData(id);

  if (error || !analysis) {
    return {
      title: 'Swing Analysis | Mind & Muscle',
      description: 'View this swing analysis in the Mind & Muscle app',
    };
  }

  const title = analysis.drill_title
    ? `${analysis.drill_title} Analysis | Mind & Muscle`
    : 'Swing Analysis | Mind & Muscle';

  const description = analysis.summary
    ? analysis.summary.substring(0, 160)
    : `Swing analysis rated ${analysis.overall_rating || 'N/A'} - shared via Mind & Muscle`;

  const thumbnail = analysis.thumbnail_urls?.[0] || null;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: thumbnail ? [{ url: thumbnail, width: 1200, height: 630 }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: thumbnail ? [thumbnail] : [],
    },
  };
}

export default async function SwingAnalysisPage({ params }: SwingAnalysisPageProps) {
  const { id } = await params;
  const { analysis, error } = await getSwingAnalysisData(id);

  return (
    <SwingAnalysisClient
      id={id}
      analysis={analysis}
      error={error}
    />
  );
}
