import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import PitchAnalysisClient from './PitchAnalysisClient';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PitchAnalysisPageProps {
  params: Promise<{ id: string }>;
}

interface PitchAnalysisData {
  analysis: {
    id: string;
    summary: string | null;
    overall_rating: string | null;
    thumbnail_urls: string[] | null;
    video_url: string | null;
    coach_note: string | null;
    drill_title: string | null;
    pitch_type: string | null;
    pitch_thrown: string | null;
    arm_health_score: number | null;
    arm_health_zone: string | null;
    created_at: string;
    owner_name: string | null;
    owner_avatar_url: string | null;
  } | null;
  error: string | null;
}

async function getPitchAnalysisData(id: string): Promise<PitchAnalysisData> {
  try {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return { analysis: null, error: 'Invalid analysis link' };
    }

    // Fetch the shared analysis with owner profile
    const { data: analysis, error: fetchError } = await supabase
      .from('pitch_lab_analyses')
      .select(`
        id,
        summary,
        overall_rating,
        thumbnail_urls,
        video_url,
        coach_note,
        drill_title,
        pitch_type,
        pitch_thrown,
        arm_health_score,
        arm_health_zone,
        created_at,
        is_shared,
        profiles!pitch_lab_analyses_user_id_fkey(name, avatar_url)
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
        pitch_type: analysis.pitch_type,
        pitch_thrown: analysis.pitch_thrown,
        arm_health_score: analysis.arm_health_score,
        arm_health_zone: analysis.arm_health_zone,
        created_at: analysis.created_at,
        owner_name: profile?.name || null,
        owner_avatar_url: profile?.avatar_url || null,
      },
      error: null,
    };
  } catch (err) {
    console.error('Error fetching pitch analysis:', err);
    return { analysis: null, error: 'An error occurred' };
  }
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: PitchAnalysisPageProps): Promise<Metadata> {
  const { id } = await params;
  const { analysis, error } = await getPitchAnalysisData(id);

  if (error || !analysis) {
    return {
      title: 'Pitch Analysis | Mind & Muscle',
      description: 'View this pitch analysis in the Mind & Muscle app',
    };
  }

  const pitchInfo = analysis.pitch_thrown
    ? `${analysis.pitch_thrown.charAt(0).toUpperCase() + analysis.pitch_thrown.slice(1)} `
    : '';

  const title = analysis.drill_title
    ? `${analysis.drill_title} | Mind & Muscle`
    : `${pitchInfo}Pitch Analysis | Mind & Muscle`;

  const description = analysis.summary
    ? analysis.summary.substring(0, 160)
    : `Pitch analysis rated ${analysis.overall_rating || 'N/A'} - shared via Mind & Muscle`;

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

export default async function PitchAnalysisPage({ params }: PitchAnalysisPageProps) {
  const { id } = await params;
  const { analysis, error } = await getPitchAnalysisData(id);

  return (
    <PitchAnalysisClient
      id={id}
      analysis={analysis}
      error={error}
    />
  );
}
