import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - Get distribution stats and status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') || 'overview'
    const contentId = searchParams.get('contentId')
    const days = parseInt(searchParams.get('days') || '30')

    // Calculate date range
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 0)
    const diff = now.getTime() - startOfYear.getTime()
    const todayDOY = Math.floor(diff / (1000 * 60 * 60 * 24))
    const startDOY = Math.max(1, todayDOY - days)

    if (view === 'content' && contentId) {
      // Get distribution for specific content
      const { data: distribution, error } = await supabase
        .from('daily_hit_distribution')
        .select('*')
        .eq('content_id', contentId)

      if (error) throw error

      return NextResponse.json({ success: true, distribution })
    }

    // Get channel statistics
    const { data: allDistribution, error } = await supabase
      .from('daily_hit_distribution')
      .select('*')
      .gte('day_of_year', startDOY)
      .lte('day_of_year', todayDOY)

    if (error) throw error

    // Channel breakdown
    const channels = ['push', 'email', 'x', 'facebook', 'instagram']
    const channelStats = channels.map(channel => {
      const channelData = allDistribution?.filter(d => d.channel === channel) || []
      const sent = channelData.filter(d => d.status === 'sent')
      return {
        channel,
        total: channelData.length,
        sent: sent.length,
        failed: channelData.filter(d => d.status === 'failed').length,
        pending: channelData.filter(d => d.status === 'pending').length,
        totalEngagement: sent.reduce((sum, d) => sum + (d.engagement_count || 0), 0),
        totalClicks: sent.reduce((sum, d) => sum + (d.click_count || 0), 0),
        avgEngagement: sent.length ? Math.round(sent.reduce((sum, d) => sum + (d.engagement_count || 0), 0) / sent.length) : 0,
      }
    })

    // Get push notification stats from actual push data
    const { data: pushStats } = await supabase
      .from('user_daily_hit_views')
      .select('*', { count: 'exact' })
      .gte('day_of_year', startDOY)
      .lte('day_of_year', todayDOY)

    // Get email subscriber count
    const { count: emailSubscribers } = await supabase
      .from('daily_hit_email_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('subscribed', true)

    // Calculate overall distribution coverage
    const { data: publishedContent } = await supabase
      .from('motivation_content')
      .select('id, day_of_year')
      .eq('content_type', 'daily_hit')
      .eq('status', 'published')
      .gte('day_of_year', startDOY)
      .lte('day_of_year', todayDOY)

    const totalPublished = publishedContent?.length || 0
    const contentWithDistribution = new Set(allDistribution?.map(d => d.content_id) || [])

    const overview = {
      totalPublished,
      withDistribution: contentWithDistribution.size,
      coverageRate: totalPublished ? Math.round((contentWithDistribution.size / totalPublished) * 100) : 0,
      pushViews: pushStats?.length || 0,
      emailSubscribers: emailSubscribers || 0,
      dateRange: { startDOY, endDOY: todayDOY, days },
    }

    // Best performing by channel
    const bestPerforming = {
      push: allDistribution?.filter(d => d.channel === 'push').sort((a, b) => (b.engagement_count || 0) - (a.engagement_count || 0))[0],
      email: allDistribution?.filter(d => d.channel === 'email').sort((a, b) => (b.click_count || 0) - (a.click_count || 0))[0],
      x: allDistribution?.filter(d => d.channel === 'x').sort((a, b) => (b.engagement_count || 0) - (a.engagement_count || 0))[0],
      facebook: allDistribution?.filter(d => d.channel === 'facebook').sort((a, b) => (b.engagement_count || 0) - (a.engagement_count || 0))[0],
    }

    return NextResponse.json({
      success: true,
      overview,
      channelStats,
      bestPerforming,
    })

  } catch (error) {
    console.error('Distribution fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch distribution stats' },
      { status: 500 }
    )
  }
}

// POST - Create distribution record or trigger distribution
export async function POST(request: NextRequest) {
  try {
    const { action, contentId, dayOfYear, channel, externalId, engagement, clicks } = await request.json()

    if (action === 'track') {
      // Create or update distribution tracking record
      const { data, error } = await supabase
        .from('daily_hit_distribution')
        .upsert({
          content_id: contentId,
          day_of_year: dayOfYear,
          channel,
          status: 'sent',
          sent_at: new Date().toISOString(),
          external_id: externalId,
          engagement_count: engagement || 0,
          click_count: clicks || 0,
        }, {
          onConflict: 'content_id,channel'
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ success: true, distribution: data })
    }

    if (action === 'update_engagement') {
      // Update engagement metrics
      const { error } = await supabase
        .from('daily_hit_distribution')
        .update({
          engagement_count: engagement,
          click_count: clicks,
        })
        .eq('content_id', contentId)
        .eq('channel', channel)

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    if (action === 'mark_failed') {
      const { errorMessage } = await request.json()

      const { error } = await supabase
        .from('daily_hit_distribution')
        .update({
          status: 'failed',
          error_message: errorMessage,
        })
        .eq('content_id', contentId)
        .eq('channel', channel)

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Distribution update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Distribution update failed' },
      { status: 500 }
    )
  }
}
