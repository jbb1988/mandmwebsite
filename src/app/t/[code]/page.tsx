import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import TeamJoinClient from './TeamJoinClient';

// Disable caching - always fetch fresh data for share links
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TeamJoinPageProps {
  params: Promise<{ code: string }>;
}

interface TeamPreviewData {
  team: {
    id: string;
    name: string;
    logo_url: string | null;
    type: string;
    member_count: number;
  } | null;
  error: string | null;
}

interface TeamPreviewRpcResponse {
  is_valid: boolean;
  error_message: string | null;
  team_id: string | null;
  team_name: string | null;
  avatar_url: string | null;
  team_type: string | null;
  member_count: number | null;
}

async function getTeamPreviewData(code: string): Promise<TeamPreviewData> {
  try {
    // Use RPC function to get team preview (bypasses RLS safely)
    const { data, error } = await supabase
      .rpc('get_team_preview_by_code', { p_code: code })
      .single<TeamPreviewRpcResponse>();

    if (error || !data) {
      return { team: null, error: 'Invalid invite link' };
    }

    // Check if the result indicates an error
    if (!data.is_valid) {
      return { team: null, error: data.error_message || 'Invalid invite link' };
    }

    return {
      team: {
        id: data.team_id,
        name: data.team_name,
        logo_url: data.avatar_url,
        type: data.team_type || 'baseball',
        member_count: data.member_count || 0,
      },
      error: null,
    };
  } catch (err) {
    console.error('Error fetching team preview data:', err);
    return { team: null, error: 'An error occurred' };
  }
}

// Generate metadata for SEO and social sharing (rich link previews)
export async function generateMetadata({ params }: TeamJoinPageProps): Promise<Metadata> {
  const { code } = await params;
  const { team, error } = await getTeamPreviewData(code);

  if (error || !team) {
    return {
      title: 'Join Team | Mind & Muscle',
      description: 'Join a team on Mind & Muscle - the training app for baseball and softball athletes.',
      openGraph: {
        title: 'Join Team | Mind & Muscle',
        description: 'Join a team on Mind & Muscle',
        images: [{ url: 'https://mindandmuscle.ai/assets/images/og-image.png', width: 1200, height: 630 }],
        type: 'website',
      },
    };
  }

  const memberText = team.member_count === 1 ? '1 member' : `${team.member_count} members`;
  const sportType = team.type === 'softball' ? 'Softball' : 'Baseball';
  const description = `${memberText} · ${sportType} Training`;

  return {
    title: `Join ${team.name} | Mind & Muscle`,
    description: `Join ${team.name} on Mind & Muscle. ${description}`,
    openGraph: {
      title: `Join ${team.name} on Mind & Muscle`,
      description: description,
      images: team.logo_url
        ? [{ url: team.logo_url, width: 400, height: 400 }]
        : [{ url: 'https://mindandmuscle.ai/assets/images/og-image.png', width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Join ${team.name} on Mind & Muscle`,
      description: description,
      images: team.logo_url
        ? [team.logo_url]
        : ['https://mindandmuscle.ai/assets/images/og-image.png'],
    },
  };
}

export default async function TeamJoinPage({ params }: TeamJoinPageProps) {
  const { code } = await params;
  const { team, error } = await getTeamPreviewData(code);

  return (
    <TeamJoinClient
      code={code}
      team={team}
      error={error}
    />
  );
}
