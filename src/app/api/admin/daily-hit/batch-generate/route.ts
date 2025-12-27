import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// POST - Start batch generation for multiple days
export async function POST(request: NextRequest) {
  try {
    const { targetDays, topicIds, autoSelectTopics } = await request.json()

    if (!targetDays || !Array.isArray(targetDays) || targetDays.length === 0) {
      return NextResponse.json(
        { error: 'targetDays array is required' },
        { status: 400 }
      )
    }

    // Create batch record
    const { data: batch, error: batchError } = await supabase
      .from('daily_hit_batches')
      .insert({
        target_days: targetDays,
        status: 'generating',
        total_items: targetDays.length,
        completed_items: 0,
        failed_items: 0,
      })
      .select()
      .single()

    if (batchError) throw batchError

    // Get topics to use
    let selectedTopics: { id: string; title: string; category: string; suggested_hook: string; main_theme: string; tone: string; opening_style: string; sport_context: string; target_role: string; difficulty_level: string }[] = []

    if (topicIds && topicIds.length > 0) {
      // Use specified topics
      const { data } = await supabase
        .from('daily_hit_topic_library')
        .select('*')
        .in('id', topicIds)
      selectedTopics = data || []
    } else if (autoSelectTopics) {
      // Smart topic selection: prioritize unused, diverse categories
      const { data } = await supabase
        .from('daily_hit_topic_library')
        .select('*')
        .eq('status', 'available')
        .order('last_used_at', { ascending: true, nullsFirst: true })
        .order('use_count', { ascending: true })
        .limit(targetDays.length)

      selectedTopics = data || []
    }

    // If not enough topics, fetch more
    if (selectedTopics.length < targetDays.length) {
      const { data: moreTopic } = await supabase
        .from('daily_hit_topic_library')
        .select('*')
        .eq('status', 'available')
        .not('id', 'in', `(${selectedTopics.map(t => t.id).join(',')})`)
        .limit(targetDays.length - selectedTopics.length)

      selectedTopics = [...selectedTopics, ...(moreTopic || [])]
    }

    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    const results: { day: number; success: boolean; draftId?: string; error?: string }[] = []

    // Generate content for each day
    for (let i = 0; i < targetDays.length; i++) {
      const dayOfYear = targetDays[i]
      const topic = selectedTopics[i % selectedTopics.length]

      try {
        // Build the generation prompt
        const systemPrompt = `You are the Mind & Muscle Daily Hit content creator for youth baseball/softball athletes (ages 12-20).

VOICE & STYLE:
- Direct & Punchy: Short, impactful sentences that hit hard
- Conversational Authority: Speak like a coach who's been there
- Baseball-Specific: Use baseball terminology and scenarios naturally
- Motivational but Realistic: Inspiring without being cheesy
- Action-Oriented: Drive toward specific behavior change

AUDIO TRANSCRIPT STYLE (what gets sent to TTS):
- 150-250 words (60-90 seconds of audio)
- NO intro/outro - those are separate
- Hook statement to grab attention
- Core teaching with baseball examples
- Mindset shift or reframe
- Specific application to baseball
- Closing power statement

BODY FORMAT (for app display):
[Opening paragraph - core concept in baseball context]

🧠 Today's Mindset Reframe
[Key insight or reframe statement]

• [Bullet point 1]
• [Bullet point 2]
• [Bullet point 3]

🎯 Mind & Muscle Challenge:
[Challenge title/description]
[Specific actionable task]

That's Mind & Muscle.

Respond with a JSON object containing:
{
  "title": "Short punchy title (5 words max)",
  "pushText": "One powerful sentence (8-12 words)",
  "headline": "Mind & Muscle Daily Hit: [Title]",
  "body": "Full body content with emojis as specified",
  "challenge": "Specific actionable challenge",
  "audioScript": "The 150-250 word script for TTS (no intro/outro)",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "keyTakeaway": "One sentence key takeaway",
  "qualityScore": 7.5
}`

        const userPrompt = topic
          ? `Create a Daily Hit based on this topic:
Title: ${topic.title}
Category: ${topic.category}
Suggested Hook: ${topic.suggested_hook}
Main Theme: ${topic.main_theme}
Tone: ${topic.tone || 'motivational'}
Sport Context: ${topic.sport_context || 'general'}
Opening Style: ${topic.opening_style || 'direct'}
Target Role: ${topic.target_role || 'general'}
Difficulty: ${topic.difficulty_level || 'intermediate'}`
          : `Create a unique Daily Hit for day ${dayOfYear} of the year. Make it fresh and engaging.`

        // Call Gemini API
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }, { text: userPrompt }] }],
              generationConfig: {
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 4096,
              }
            })
          }
        )

        if (!geminiResponse.ok) {
          throw new Error(`Gemini API error: ${await geminiResponse.text()}`)
        }

        const geminiData = await geminiResponse.json()
        const responseText = geminiData.candidates[0].content.parts[0].text

        // Extract JSON from response
        let jsonText = responseText
        if (responseText.includes('```json')) {
          jsonText = responseText.split('```json')[1].split('```')[0].trim()
        } else if (responseText.includes('```')) {
          jsonText = responseText.split('```')[1].split('```')[0].trim()
        }

        const generatedContent = JSON.parse(jsonText)

        // Save draft
        const { data: draft, error: draftError } = await supabase
          .from('daily_hit_drafts')
          .insert({
            title: generatedContent.title,
            push_text: generatedContent.pushText,
            headline: generatedContent.headline,
            body: generatedContent.body,
            challenge: generatedContent.challenge,
            tags: generatedContent.tags,
            audio_script: generatedContent.audioScript,
            day_of_year: dayOfYear,
            source_topic_id: topic?.id || null,
            status: 'draft',
            batch_id: batch.id,
            quality_score: generatedContent.qualityScore || null,
            target_role: topic?.target_role || 'general',
            difficulty_level: topic?.difficulty_level || 'intermediate',
          })
          .select()
          .single()

        if (draftError) throw draftError

        // Update topic usage
        if (topic) {
          await supabase
            .from('daily_hit_topic_library')
            .update({
              last_used_at: new Date().toISOString(),
              use_count: (topic as any).use_count ? (topic as any).use_count + 1 : 1,
              status: 'used',
            })
            .eq('id', topic.id)
        }

        results.push({ day: dayOfYear, success: true, draftId: draft.id })

        // Update batch progress
        await supabase
          .from('daily_hit_batches')
          .update({
            completed_items: results.filter(r => r.success).length,
            failed_items: results.filter(r => !r.success).length,
          })
          .eq('id', batch.id)

      } catch (err) {
        results.push({
          day: dayOfYear,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    // Update batch final status
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    await supabase
      .from('daily_hit_batches')
      .update({
        status: failCount === 0 ? 'complete' : failCount === targetDays.length ? 'failed' : 'partial',
        completed_items: successCount,
        failed_items: failCount,
        completed_at: new Date().toISOString(),
      })
      .eq('id', batch.id)

    return NextResponse.json({
      success: true,
      batchId: batch.id,
      results,
      summary: {
        total: targetDays.length,
        successful: successCount,
        failed: failCount,
      }
    })

  } catch (error) {
    console.error('Batch generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Batch generation failed' },
      { status: 500 }
    )
  }
}

// GET - Get batch status and history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batchId')

    if (batchId) {
      // Get specific batch with its drafts
      const { data: batch, error } = await supabase
        .from('daily_hit_batches')
        .select('*')
        .eq('id', batchId)
        .single()

      if (error) throw error

      const { data: drafts } = await supabase
        .from('daily_hit_drafts')
        .select('*')
        .eq('batch_id', batchId)
        .order('day_of_year')

      return NextResponse.json({ batch, drafts })
    }

    // Get recent batches
    const { data: batches, error } = await supabase
      .from('daily_hit_batches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json({ batches })

  } catch (error) {
    console.error('Error fetching batches:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch batches' },
      { status: 500 }
    )
  }
}
