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

async function getTeamPreviewData(code: string): Promise<TeamPreviewData> {
  try {
    // First get the join code to find the team
    const { data: joinCode, error: codeError } = await supabase
      .from('team_join_codes')
      .select('id, code, team_id, is_active, expires_at')
      .eq('code', code)
      .eq('is_active', true)
      .maybeSingle();

    if (codeError || !joinCode) {
      return { team: null, error: 'Invalid invite link' };
    }

    // Check if expired
    if (joinCode.expires_at && new Date(joinCode.expires_at) < new Date()) {
      return { team: null, error: 'This invite link has expired' };
    }

    // Get team data
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name, logo_url, type')
      .eq('id', joinCode.team_id)
      .maybeSingle();

    if (teamError || !team) {
      return { team: null, error: 'Team not found' };
    }

    // Get member count
    const { count: memberCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', team.id);

    return {
      team: {
        id: team.id,
        name: team.name,
        logo_url: team.logo_url,
        type: team.type || 'baseball',
        member_count: memberCount || 0,
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
