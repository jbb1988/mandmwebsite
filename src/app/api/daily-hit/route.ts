import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Calculate day of year in Central timezone (matches app behavior)
function getDayOfYearCentral(): number {
  // Get current date in Central timezone
  const now = new Date();
  const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));

  const start = new Date(centralTime.getFullYear(), 0, 0);
  const diff = centralTime.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  return dayOfYear;
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const dayOfYear = getDayOfYearCentral();

    // Fetch today's Daily Hit
    const { data, error } = await supabase
      .from('motivation_content')
      .select('id, title, headline, body, challenge, audio_url, thumbnail_url, tags, day_of_year')
      .eq('day_of_year', dayOfYear)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (error) {
      // No content for today - return null (not an error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { dailyHit: null, dayOfYear },
          {
            status: 200,
            headers: {
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
            }
          }
        );
      }

      console.error('Supabase error fetching daily hit:', error);
      return NextResponse.json(
        { error: 'Failed to fetch daily hit' },
        { status: 500 }
      );
    }

    const dailyHit = {
      id: data.id,
      title: data.title,
      headline: data.headline,
      body: data.body,
      challenge: data.challenge,
      videoUrl: data.audio_url, // audio_url contains the MP4 audiogram
      thumbnailUrl: data.thumbnail_url,
      tags: data.tags,
      dayOfYear: data.day_of_year,
    };

    return NextResponse.json(
      { dailyHit, dayOfYear },
      {
        status: 200,
        headers: {
          // Cache for 1 hour, allow stale content for 30 min while revalidating
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
        }
      }
    );
  } catch (error) {
    console.error('Unexpected error in daily-hit API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
