import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TeamCode {
  teamNumber: number;
  teamName: string;
  coachCode: string;
  teamCode: string;
  seatCount: number;
}

export async function GET(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-09-30.acacia',
    });
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get subscription metadata
    const subscription = session.subscription as Stripe.Subscription;
    const metadata = subscription?.metadata || session.metadata;

    // Check if this is a multi-team organization purchase
    const isMultiTeamOrg = metadata?.is_multi_team_org === 'true';
    const organizationName = metadata?.organization_name;
    const numberOfTeams = metadata?.number_of_teams ? parseInt(metadata.number_of_teams) : 0;

    if (isMultiTeamOrg && numberOfTeams > 1) {
      // Multi-team org: fetch all team codes from database
      console.log('Multi-team org detected, fetching codes for:', organizationName);

      // Get subscription ID for querying teams
      const subscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : (session.subscription as Stripe.Subscription)?.id;

      console.log('Looking for teams with subscription ID:', subscriptionId);

      // Primary method: Find teams by stripe_subscription_id (most reliable)
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          license_seats_total,
          metadata
        `)
        .eq('stripe_subscription_id', subscriptionId)
        .order('created_at', { ascending: true });

      console.log('Teams query result:', { teamsCount: teams?.length, error: teamsError });

      if (teamsError || !teams || teams.length === 0) {
        console.error('Error fetching teams by subscription:', teamsError);

        // Fallback: try to find by session ID in metadata
        const { data: teamsBySession, error: sessionError } = await supabase
          .from('teams')
          .select(`
            id,
            name,
            license_seats_total,
            metadata
          `)
          .eq('metadata->>created_from_session', sessionId)
          .order('created_at', { ascending: true });

        console.log('Teams by session result:', { teamsCount: teamsBySession?.length, error: sessionError });

        if (sessionError || !teamsBySession || teamsBySession.length === 0) {
          // Ultimate fallback: return single codes from metadata (shouldn't happen)
          console.error('No teams found, falling back to metadata codes');
          return NextResponse.json({
            isMultiTeamOrg: false,
            coachCode: metadata.coach_code || '',
            teamCode: metadata.team_code || '',
            email: session.customer_details?.email || '',
            seatCount: parseInt(metadata.seat_count || '12'),
            lockedInRate: parseFloat(metadata.price_per_seat || '79'),
            discountPercentage: parseInt(metadata.discount_percentage || '0'),
          });
        }

        // Build team codes from teams found by session
        const teamCodes: TeamCode[] = teamsBySession.map((team, index) => ({
          teamNumber: team.metadata?.team_number || index + 1,
          teamName: team.name,
          coachCode: team.metadata?.coach_code || '',
          teamCode: team.metadata?.team_code || '',
          seatCount: team.license_seats_total,
        }));

        return NextResponse.json({
          isMultiTeamOrg: true,
          organizationName: organizationName || 'Your Organization',
          numberOfTeams: teamCodes.length,
          teamCodes,
          email: session.customer_details?.email || '',
          totalSeatCount: parseInt(metadata.seat_count || '0'),
          lockedInRate: parseFloat(metadata.price_per_seat || '79'),
          discountPercentage: parseInt(metadata.discount_percentage || '0'),
        });
      }

      // Build team codes from teams found by subscription
      const teamCodes: TeamCode[] = teams.map((team, index) => ({
        teamNumber: team.metadata?.team_number || index + 1,
        teamName: team.name,
        coachCode: team.metadata?.coach_code || '',
        teamCode: team.metadata?.team_code || '',
        seatCount: team.license_seats_total,
      }));

      // Get organization name from first team or metadata
      const orgName = organizationName || teams[0]?.name?.split(' - ')[0] || 'Your Organization';

      return NextResponse.json({
        isMultiTeamOrg: true,
        organizationName: orgName,
        numberOfTeams: teamCodes.length,
        teamCodes,
        email: session.customer_details?.email || '',
        totalSeatCount: parseInt(metadata.seat_count || '0'),
        lockedInRate: parseFloat(metadata.price_per_seat || '79'),
        discountPercentage: parseInt(metadata.discount_percentage || '0'),
      });
    }

    // Single team purchase - return standard response
    return NextResponse.json({
      isMultiTeamOrg: false,
      coachCode: metadata.coach_code || '',
      teamCode: metadata.team_code || '',
      email: session.customer_details?.email || '',
      seatCount: parseInt(metadata.seat_count || '12'),
      lockedInRate: parseFloat(metadata.price_per_seat || '79'),
      discountPercentage: parseInt(metadata.discount_percentage || '0'),
    });
  } catch (error: any) {
    console.error('Error retrieving checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
