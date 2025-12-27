import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - Detect content gaps
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lookahead = parseInt(searchParams.get('lookahead') || '30')

    // Get current day of year
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 0)
    const diff = now.getTime() - startOfYear.getTime()
    const todayDOY = Math.floor(diff / (1000 * 60 * 60 * 24))

    // Get all days with published content
    const { data: published } = await supabase
      .from('motivation_content')
      .select('day_of_year')
      .eq('status', 'active')
      .gte('day_of_year', todayDOY)
      .lte('day_of_year', todayDOY + lookahead)

    const publishedDays = new Set((published || []).map(p => p.day_of_year))

    // Get all days with drafts (approved or pending)
    const { data: drafts } = await supabase
      .from('daily_hit_drafts')
      .select('day_of_year, status')
      .in('status', ['approved', 'pending_review', 'draft'])
      .gte('day_of_year', todayDOY)
      .lte('day_of_year', todayDOY + lookahead)

    const draftDays = new Map<number, string>()
    ;(drafts || []).forEach(d => {
      if (d.day_of_year) draftDays.set(d.day_of_year, d.status)
    })

    // Find gaps
    const gaps: { dayOfYear: number; gapType: 'critical' | 'warning' | 'upcoming'; daysUntil: number; hasDraft: boolean; draftStatus?: string }[] = []

    for (let day = todayDOY; day <= Math.min(todayDOY + lookahead, 365); day++) {
      const isPublished = publishedDays.has(day)
      const draftStatus = draftDays.get(day)

      if (!isPublished) {
        const daysUntil = day - todayDOY

        let gapType: 'critical' | 'warning' | 'upcoming'
        if (daysUntil <= 2) {
          gapType = 'critical'
        } else if (daysUntil <= 7) {
          gapType = 'warning'
        } else {
          gapType = 'upcoming'
        }

        gaps.push({
          dayOfYear: day,
          gapType,
          daysUntil,
          hasDraft: !!draftStatus,
          draftStatus,
        })
      }
    }

    // Summary stats
    const summary = {
      critical: gaps.filter(g => g.gapType === 'critical').length,
      warning: gaps.filter(g => g.gapType === 'warning').length,
      upcoming: gaps.filter(g => g.gapType === 'upcoming').length,
      totalGaps: gaps.length,
      withDrafts: gaps.filter(g => g.hasDraft).length,
      needsContent: gaps.filter(g => !g.hasDraft).length,
    }

    // Get active alerts
    const { data: alerts } = await supabase
      .from('daily_hit_gap_alerts')
      .select('*')
      .eq('status', 'active')
      .order('day_of_year')

    return NextResponse.json({
      success: true,
      gaps,
      summary,
      alerts: alerts || [],
      todayDOY,
      lookahead,
    })

  } catch (error) {
    console.error('Gap detection error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gap detection failed' },
      { status: 500 }
    )
  }
}

// POST - Create/update gap alerts or auto-generate content for critical gaps
export async function POST(request: NextRequest) {
  try {
    const { action, dayOfYear, alertId } = await request.json()

    if (action === 'create_alert') {
      // Get current day of year
      const now = new Date()
      const startOfYear = new Date(now.getFullYear(), 0, 0)
      const diff = now.getTime() - startOfYear.getTime()
      const todayDOY = Math.floor(diff / (1000 * 60 * 60 * 24))
      const daysUntil = dayOfYear - todayDOY

      const alertType = daysUntil <= 2 ? 'critical' : 'warning'

      const { data: alert, error } = await supabase
        .from('daily_hit_gap_alerts')
        .insert({
          day_of_year: dayOfYear,
          alert_type: alertType,
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ success: true, alert })
    }

    if (action === 'resolve_alert') {
      const { error } = await supabase
        .from('daily_hit_gap_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', alertId)

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    if (action === 'ignore_alert') {
      const { error } = await supabase
        .from('daily_hit_gap_alerts')
        .update({ status: 'ignored' })
        .eq('id', alertId)

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Gap alert error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gap alert action failed' },
      { status: 500 }
    )
  }
}
