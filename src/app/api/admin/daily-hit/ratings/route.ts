import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdmin } from '@/lib/admin-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - Get rating statistics
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') || 'summary'
    const contentId = searchParams.get('contentId')
    const category = searchParams.get('category')
    const days = parseInt(searchParams.get('days') || '30')

    // Calculate date range
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 0)
    const diff = now.getTime() - startOfYear.getTime()
    const todayDOY = Math.floor(diff / (1000 * 60 * 60 * 24))
    const startDOY = Math.max(1, todayDOY - days)

    if (view === 'content' && contentId) {
      // Get ratings for specific content
      const { data: ratings, error } = await supabase
        .from('daily_hit_ratings')
        .select('*')
        .eq('content_id', contentId)

      if (error) throw error

      const summary = {
        total: ratings?.length || 0,
        homeRuns: ratings?.filter(r => r.rating === 'home_run').length || 0,
        goodHits: ratings?.filter(r => r.rating === 'good_hit').length || 0,
        didntHits: ratings?.filter(r => r.rating === 'didnt_hit').length || 0,
        avgCompletion: ratings?.length
          ? Math.round(ratings.reduce((sum, r) => sum + (r.completion_percentage || 0), 0) / ratings.length)
          : 0,
        avgListenSeconds: ratings?.length
          ? Math.round(ratings.reduce((sum, r) => sum + (r.listen_duration_seconds || 0), 0) / ratings.length)
          : 0,
      }

      return NextResponse.json({ success: true, ratings, summary })
    }

    if (view === 'category') {
      // Get quality summary by category
      const { data: categoryStats, error } = await supabase
        .from('daily_hit_quality_summary')
        .select('*')

      if (error) throw error

      return NextResponse.json({ success: true, categoryStats })
    }

    if (view === 'top_performers') {
      // Get top performing content
      const { data: topContent, error } = await supabase
        .from('daily_hit_rating_stats')
        .select('*')
        .gt('total_ratings', 5)
        .order('home_runs', { ascending: false })
        .limit(10)

      if (error) throw error

      return NextResponse.json({ success: true, topContent })
    }

    if (view === 'drop_offs') {
      // Get content with low completion rates
      const { data: dropOffs, error } = await supabase
        .from('daily_hit_rating_stats')
        .select('*')
        .gt('total_ratings', 3)
        .lt('avg_completion', 50)
        .order('avg_completion', { ascending: true })
        .limit(10)

      if (error) throw error

      return NextResponse.json({ success: true, dropOffs })
    }

    // Default: overall summary
    const { data: allRatings, error } = await supabase
      .from('daily_hit_ratings')
      .select('*')
      .gte('day_of_year', startDOY)
      .lte('day_of_year', todayDOY)

    if (error) throw error

    const overallSummary = {
      totalRatings: allRatings?.length || 0,
      homeRunRate: allRatings?.length
        ? Math.round((allRatings.filter(r => r.rating === 'home_run').length / allRatings.length) * 100)
        : 0,
      goodHitRate: allRatings?.length
        ? Math.round((allRatings.filter(r => r.rating === 'good_hit').length / allRatings.length) * 100)
        : 0,
      didntHitRate: allRatings?.length
        ? Math.round((allRatings.filter(r => r.rating === 'didnt_hit').length / allRatings.length) * 100)
        : 0,
      avgCompletion: allRatings?.length
        ? Math.round(allRatings.reduce((sum, r) => sum + (r.completion_percentage || 0), 0) / allRatings.length)
        : 0,
      avgListenSeconds: allRatings?.length
        ? Math.round(allRatings.reduce((sum, r) => sum + (r.listen_duration_seconds || 0), 0) / allRatings.length)
        : 0,
    }

    // Rating distribution by day for chart
    const ratingsByDay: Record<number, { day: number; homeRuns: number; goodHits: number; didntHits: number }> = {}

    allRatings?.forEach(r => {
      if (!ratingsByDay[r.day_of_year]) {
        ratingsByDay[r.day_of_year] = { day: r.day_of_year, homeRuns: 0, goodHits: 0, didntHits: 0 }
      }
      if (r.rating === 'home_run') ratingsByDay[r.day_of_year].homeRuns++
      if (r.rating === 'good_hit') ratingsByDay[r.day_of_year].goodHits++
      if (r.rating === 'didnt_hit') ratingsByDay[r.day_of_year].didntHits++
    })

    return NextResponse.json({
      success: true,
      summary: overallSummary,
      ratingsByDay: Object.values(ratingsByDay).sort((a, b) => a.day - b.day),
      dateRange: { startDOY, endDOY: todayDOY, days },
    })

  } catch (error) {
    console.error('Ratings fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
}
