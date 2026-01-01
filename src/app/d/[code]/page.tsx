import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import DrillShareClient from './DrillShareClient';

// Disable caching - always fetch fresh data for share links
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface DrillSharePageProps {
  params: Promise<{ code: string }>;
}

interface DrillShareData {
  shareCode: {
    id: string;
    code: string;
    drill_id: string;
    is_active: boolean;
    expires_at: string | null;
  } | null;
  drill: {
    id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    skill_category: string;
    age_range: string;
    owner_name: string | null;
    owner_avatar_url: string | null;
  } | null;
  error: string | null;
}

async function getDrillShareData(code: string): Promise<DrillShareData> {
  try {
    // First get the share code
    const { data: shareCode, error: codeError } = await supabase
      .from('drill_share_codes')
      .select('id, code, drill_id, is_active, expires_at')
      .eq('code', code)
      .single();

    if (codeError || !shareCode) {
      return { shareCode: null, drill: null, error: 'Invalid share link' };
    }

    // Check if expired
    if (shareCode.expires_at && new Date(shareCode.expires_at) < new Date()) {
      return { shareCode, drill: null, error: 'This share link has expired' };
    }

    // Check if active
    if (!shareCode.is_active) {
      return { shareCode, drill: null, error: 'This share link is no longer active' };
    }

    // Get drill data
    const { data: drill, error: drillError } = await supabase
      .from('drills')
      .select('id, title, description, thumbnail_url, skill_category, age_range, owner_name, owner_avatar_url')
      .eq('id', shareCode.drill_id)
      .single();

    if (drillError || !drill) {
      return { shareCode, drill: null, error: 'Drill not found' };
    }

    return { shareCode, drill, error: null };
  } catch (err) {
    console.error('Error fetching drill share data:', err);
    return { shareCode: null, drill: null, error: 'An error occurred' };
  }
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: DrillSharePageProps): Promise<Metadata> {
  const { code } = await params;
  const { drill, error } = await getDrillShareData(code);

  if (error || !drill) {
    return {
      title: 'Shared Drill | Mind & Muscle',
      description: 'View this drill in the Mind & Muscle app',
    };
  }

  return {
    title: `${drill.title} | Mind & Muscle Drill`,
    description: drill.description || `Check out "${drill.title}" - a ${drill.skill_category} drill on Mind & Muscle`,
    openGraph: {
      title: `${drill.title} | Mind & Muscle`,
      description: drill.description || `A ${drill.skill_category} drill shared via Mind & Muscle`,
      images: drill.thumbnail_url ? [{ url: drill.thumbnail_url, width: 1200, height: 630 }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${drill.title} | Mind & Muscle`,
      description: drill.description || `A ${drill.skill_category} drill shared via Mind & Muscle`,
      images: drill.thumbnail_url ? [drill.thumbnail_url] : [],
    },
  };
}

export default async function DrillSharePage({ params }: DrillSharePageProps) {
  const { code } = await params;
  const { shareCode, drill, error } = await getDrillShareData(code);

  return (
    <DrillShareClient
      code={code}
      drill={drill}
      error={error}
    />
  );
}
