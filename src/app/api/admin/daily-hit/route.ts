import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdmin } from '@/lib/admin-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - List drafts, calendar view, or gap analysis
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const view = searchParams.get('view') || 'drafts'
  const status = searchParams.get('status')
  const dayOfYear = searchParams.get('dayOfYear')

  try {
    if (view === 'calendar') {
      // Get full calendar view with gaps
      const { data, error } = await supabase
        .from('daily_hit_content_calendar')
        .select('*')
        .order('day_of_year')

      if (error) throw error

      // Calculate stats
      const stats = {
        total: 365,
        published: data?.filter(d => d.slot_status === 'published').length || 0,
        drafts: data?.filter(d => d.slot_status === 'draft').length || 0,
        pendingReview: data?.filter(d => d.slot_status === 'pending_review').length || 0,
        empty: data?.filter(d => d.slot_status === 'empty').length || 0,
      }

      return NextResponse.json({ calendar: data, stats })
    }

    if (view === 'content') {
      // Get published content with audio URL for a specific day
      if (!dayOfYear) {
        return NextResponse.json({ error: 'dayOfYear required for content view' }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('motivation_content')
        .select('id, title, push_text, headline, body, challenge, audio_url, thumbnail_url, day_of_year, status, tags, key_takeaway')
        .eq('day_of_year', parseInt(dayOfYear))
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return NextResponse.json({ content: data })
    }

    if (view === 'gaps') {
      // Get only empty days
      const { data, error } = await supabase
        .from('daily_hit_content_calendar')
        .select('*')
        .eq('slot_status', 'empty')
        .order('day_of_year')

      if (error) throw error

      return NextResponse.json({ gaps: data, count: data?.length || 0 })
    }

    if (view === 'topics') {
      // Get available topics from library
      const { data, error } = await supabase
        .from('daily_hit_topic_library')
        .select('*')
        .eq('status', 'available')
        .order('priority_tier')
        .limit(50)

      if (error) throw error

      return NextResponse.json({ topics: data })
    }

    // Default: list drafts
    let query = supabase
      .from('daily_hit_drafts')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (dayOfYear) {
      query = query.eq('day_of_year', parseInt(dayOfYear))
    }

    const { data, error } = await query.limit(100)

    if (error) throw error

    return NextResponse.json({ drafts: data })

  } catch (error) {
    console.error('Error fetching daily hit data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

// POST - Create new draft
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const {
      title,
      pushText,
      headline,
      body: contentBody,
      challenge,
      tags,
      dayOfYear,
      audioScript,
      sourceTopicId,
      sourceContent,
      status = 'draft',
    } = body

    if (!title || !pushText || !headline || !contentBody) {
      return NextResponse.json(
        { error: 'Missing required fields: title, pushText, headline, body' },
        { status: 400 }
      )
    }

    // Check if day_of_year is already taken
    if (dayOfYear) {
      const { data: existing } = await supabase
        .from('motivation_content')
        .select('id, title')
        .eq('day_of_year', dayOfYear)
        .eq('status', 'active')
        .single()

      if (existing) {
        return NextResponse.json(
          { error: `Day ${dayOfYear} already has published content: "${existing.title}"` },
          { status: 409 }
        )
      }
    }

    // Create draft
    const { data, error } = await supabase
      .from('daily_hit_drafts')
      .insert({
        title,
        push_text: pushText,
        headline,
        body: contentBody,
        challenge,
        tags: tags || [],
        day_of_year: dayOfYear,
        audio_script: audioScript,
        source_topic_id: sourceTopicId,
        source_content: sourceContent,
        status,
        created_by: 'admin',
      })
      .select()
      .single()

    if (error) throw error

    // If topic was used, update its status
    if (sourceTopicId) {
      await supabase
        .from('daily_hit_topic_library')
        .update({ status: 'used' })
        .eq('id', sourceTopicId)
    }

    return NextResponse.json({ draft: data }, { status: 201 })

  } catch (error) {
    console.error('Error creating draft:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create draft' },
      { status: 500 }
    )
  }
}

// PATCH - Update draft
export async function PATCH(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing draft id' }, { status: 400 })
    }

    // Map camelCase to snake_case for DB columns
    const dbUpdates: Record<string, unknown> = {}
    const fieldMap: Record<string, string> = {
      title: 'title',
      pushText: 'push_text',
      headline: 'headline',
      body: 'body',
      challenge: 'challenge',
      tags: 'tags',
      dayOfYear: 'day_of_year',
      audioScript: 'audio_script',
      audioUrl: 'audio_url',
      audio_url: 'audio_url',
      ttsAudioUrl: 'tts_audio_url',
      thumbnailUrl: 'thumbnail_url',
      thumbnail_url: 'thumbnail_url',
      media_type: 'media_type',
      mediaType: 'media_type',
      status: 'status',
      reviewNotes: 'review_notes',
      rejectionReason: 'rejection_reason',
      audioGenerationStatus: 'audio_generation_status',
      audio_generation_status: 'audio_generation_status',
      audioError: 'audio_error',
      audio_error: 'audio_error',
      // Approval workflow fields
      script_approved: 'script_approved',
      script_approved_at: 'script_approved_at',
      audio_approved: 'audio_approved',
      audio_approved_at: 'audio_approved_at',
    }

    for (const [key, value] of Object.entries(updates)) {
      const dbKey = fieldMap[key]
      if (dbKey) {
        dbUpdates[dbKey] = value
      }
    }

    // Add review timestamp if status is being updated to pending_review or approved
    if (updates.status === 'pending_review' || updates.status === 'approved') {
      dbUpdates.reviewed_at = new Date().toISOString()
      dbUpdates.reviewed_by = 'admin'
    }

    const { data, error } = await supabase
      .from('daily_hit_drafts')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ draft: data })

  } catch (error) {
    console.error('Error updating draft:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update draft' },
      { status: 500 }
    )
  }
}

// DELETE - Delete draft
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing draft id' }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('daily_hit_drafts')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting draft:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete draft' },
      { status: 500 }
    )
  }
}
