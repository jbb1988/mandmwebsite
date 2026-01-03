import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdmin } from '@/lib/admin-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// POST - Publish draft to motivation_content
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { draftId, dayOfYear } = await request.json()

    if (!draftId) {
      return NextResponse.json({ error: 'Missing draftId' }, { status: 400 })
    }

    // Get the draft
    const { data: draft, error: draftError } = await supabase
      .from('daily_hit_drafts')
      .select('*')
      .eq('id', draftId)
      .single()

    if (draftError || !draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    // Validate draft has required fields
    if (!draft.audio_url) {
      return NextResponse.json(
        { error: 'Draft must have audio generated before publishing' },
        { status: 400 }
      )
    }

    const targetDayOfYear = dayOfYear || draft.day_of_year

    if (!targetDayOfYear) {
      return NextResponse.json(
        { error: 'Day of year must be specified' },
        { status: 400 }
      )
    }

    // Check if day_of_year is already taken by active content
    const { data: existing } = await supabase
      .from('motivation_content')
      .select('id, title')
      .eq('day_of_year', targetDayOfYear)
      .eq('status', 'active')
      .single()

    if (existing) {
      return NextResponse.json(
        {
          error: `Day ${targetDayOfYear} already has content: "${existing.title}". Please archive it first or choose a different day.`,
          existingId: existing.id,
        },
        { status: 409 }
      )
    }

    // Insert into motivation_content (exact format matching existing entries)
    const now = new Date().toISOString()
    const { data: published, error: publishError } = await supabase
      .from('motivation_content')
      .insert({
        title: draft.title,
        push_text: draft.push_text,
        headline: draft.headline || `Mind & Muscle Daily Hit: ${draft.title}`,
        body: draft.body,
        challenge: draft.challenge,
        audio_url: draft.audio_url,
        thumbnail_url: draft.thumbnail_url,
        tags: draft.tags || [],
        day_of_year: targetDayOfYear,
        media_type: draft.media_type || 'audio',
        key_takeaway: draft.key_takeaway,
        status: 'active',
        created_at: now,
        delivery_date: now,
        target_role: 'general',
        difficulty_level: 'intermediate',
        image_generation_status: 'none',
      })
      .select()
      .single()

    if (publishError) {
      throw new Error(`Failed to publish: ${publishError.message}`)
    }

    // Update draft status
    const { error: updateError } = await supabase
      .from('daily_hit_drafts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        published_content_id: published.id,
        day_of_year: targetDayOfYear,
      })
      .eq('id', draftId)

    if (updateError) {
      console.error('Failed to update draft status:', updateError)
    }

    return NextResponse.json({
      success: true,
      publishedId: published.id,
      dayOfYear: targetDayOfYear,
      message: `Successfully published "${draft.title}" for day ${targetDayOfYear}`,
    })

  } catch (error) {
    console.error('Error publishing draft:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish' },
      { status: 500 }
    )
  }
}
