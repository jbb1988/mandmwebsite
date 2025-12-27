import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// POST - Generate content using AI based on topic or source material
export async function POST(request: NextRequest) {
  try {
    const { topicId, sourceContent, prompt } = await request.json()

    if (!topicId && !sourceContent && !prompt) {
      return NextResponse.json(
        { error: 'Must provide topicId, sourceContent, or prompt' },
        { status: 400 }
      )
    }

    // Get topic details if topicId provided
    let topic = null
    if (topicId) {
      const { data } = await supabase
        .from('daily_hit_topic_library')
        .select('*')
        .eq('id', topicId)
        .single()
      topic = data
    }

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

WRITING PATTERNS TO USE:
- Question Hooks: "You know what separates..."
- Contrast Statements: "Most players do X. Champions do Y."
- Baseball Scenarios: Specific at-bat, fielding, pressure situations
- Short Punchy Sentences: "That's intent. That's mindset."
- Direct Address: "You can..." "Your best at-bats..."

Respond with a JSON object containing:
{
  "title": "Short punchy title (5 words max)",
  "pushText": "One powerful sentence (8-12 words)",
  "headline": "Mind & Muscle Daily Hit: [Title]",
  "body": "Full body content with emojis as specified",
  "challenge": "Specific actionable challenge",
  "audioScript": "The 150-250 word script for TTS (no intro/outro)",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "keyTakeaway": "One sentence key takeaway"
}`

    const userPrompt = topic
      ? `Create a Daily Hit based on this topic:
Title: ${topic.title}
Category: ${topic.category}
Suggested Hook: ${topic.suggested_hook}
Main Theme: ${topic.main_theme}
Tone: ${topic.tone || 'motivational'}
Sport Context: ${topic.sport_context || 'general'}
Opening Style: ${topic.opening_style || 'direct'}`
      : sourceContent
      ? `Transform this source content into a Mind & Muscle Daily Hit (make it completely original, don't copy):

SOURCE CONTENT:
${sourceContent}`
      : `Create a Daily Hit based on this prompt:
${prompt}`

    // Call Gemini API for content generation
    const geminiApiKey = process.env.GEMINI_API_KEY

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      )
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt },
              { text: userPrompt }
            ]
          }],
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
      const errorText = await geminiResponse.text()
      throw new Error(`Gemini API error: ${errorText}`)
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

    return NextResponse.json({
      success: true,
      content: generatedContent,
      topicId: topicId || null,
    })

  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    )
  }
}
