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

      // Find the organization license by session ID
      const { data: orgLicense, error: orgError } = await supabase
        .from('organization_licenses')
        .select('id, organization_name')
        .eq('metadata->>created_from_session', sessionId)
        .single();

      if (orgError || !orgLicense) {
        console.error('Error finding organization license:', orgError);
        // Fallback: try to find teams by stripe subscription ID
        const subscriptionId = session.subscription as string;

        const { data: teams, error: teamsError } = await supabase
          .from('teams')
          .select(`
            id,
            name,
            license_seats_total,
            metadata
          `)
          .eq('stripe_subscription_id', subscriptionId)
          .order('metadata->>team_number', { ascending: true });

        if (teamsError || !teams || teams.length === 0) {
          console.error('Error fetching teams by subscription:', teamsError);
          // Ultimate fallback: return single codes from metadata
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

        // Build team codes from teams
        const teamCodes: TeamCode[] = teams.map((team, index) => ({
          teamNumber: team.metadata?.team_number || index + 1,
          teamName: team.name,
          coachCode: team.metadata?.coach_code || '',
          teamCode: team.metadata?.team_code || '',
          seatCount: team.license_seats_total,
        }));

        return NextResponse.json({
          isMultiTeamOrg: true,
          organizationName: organizationName || 'Your Organization',
          numberOfTeams: teams.length,
          teamCodes,
          email: session.customer_details?.email || '',
          totalSeatCount: parseInt(metadata.seat_count || '0'),
          lockedInRate: parseFloat(metadata.price_per_seat || '79'),
          discountPercentage: parseInt(metadata.discount_percentage || '0'),
        });
      }

      // Fetch all teams associated with this organization
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          license_seats_total,
          metadata
        `)
        .eq('metadata->>organization_license_id', orgLicense.id)
        .order('metadata->>team_number', { ascending: true });

      if (teamsError) {
        console.error('Error fetching organization teams:', teamsError);
      }

      const teamCodes: TeamCode[] = (teams || []).map((team, index) => ({
        teamNumber: team.metadata?.team_number || index + 1,
        teamName: team.name,
        coachCode: team.metadata?.coach_code || '',
        teamCode: team.metadata?.team_code || '',
        seatCount: team.license_seats_total,
      }));

      return NextResponse.json({
        isMultiTeamOrg: true,
        organizationName: orgLicense.organization_name || organizationName,
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
