import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Supported AI models
type AIModel = 'gpt-4o' | 'claude' | 'gemini'

const SYSTEM_PROMPT = `You are the Mind & Muscle Daily Hit content creator for youth baseball/softball athletes (ages 12-20).

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

// Generate with OpenAI GPT-4o
async function generateWithOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Generate with Claude (Anthropic)
async function generateWithClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API error: ${error}`)
  }

  const data = await response.json()
  return data.content[0].text
}

// Generate with Gemini
async function generateWithGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
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

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

// Check which models are available
function getAvailableModels(): AIModel[] {
  const models: AIModel[] = []
  if (process.env.OPENAI_API_KEY) models.push('gpt-4o')
  if (process.env.ANTHROPIC_API_KEY) models.push('claude')
  if (process.env.GEMINI_API_KEY) models.push('gemini')
  return models
}

// GET - Return available models
export async function GET() {
  const availableModels = getAvailableModels()

  return NextResponse.json({
    availableModels,
    recommended: availableModels.includes('gpt-4o') ? 'gpt-4o' : availableModels[0] || null,
    modelInfo: {
      'gpt-4o': {
        name: 'GPT-4o (OpenAI)',
        description: 'Best for creative writing, nuanced emotion, and narrative flair',
        available: availableModels.includes('gpt-4o'),
      },
      'claude': {
        name: 'Claude Opus (Anthropic)',
        description: 'Best for structured, uplifting prose with exceptional clarity and coherence',
        available: availableModels.includes('claude'),
      },
      'gemini': {
        name: 'Gemini 2.0 (Google)',
        description: 'Fast and efficient with good creative output',
        available: availableModels.includes('gemini'),
      },
    },
  })
}

// POST - Generate content using AI based on topic or source material
export async function POST(request: NextRequest) {
  try {
    const { topicId, sourceContent, prompt, model } = await request.json()

    if (!topicId && !sourceContent && !prompt) {
      return NextResponse.json(
        { error: 'Must provide topicId, sourceContent, or prompt' },
        { status: 400 }
      )
    }

    // Determine which model to use
    const availableModels = getAvailableModels()
    const selectedModel: AIModel = model && availableModels.includes(model)
      ? model
      : availableModels[0]

    if (!selectedModel) {
      return NextResponse.json(
        { error: 'No AI models configured. Please set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY' },
        { status: 500 }
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

    // Call the selected AI model
    let responseText: string
    switch (selectedModel) {
      case 'gpt-4o':
        responseText = await generateWithOpenAI(SYSTEM_PROMPT, userPrompt)
        break
      case 'claude':
        responseText = await generateWithClaude(SYSTEM_PROMPT, userPrompt)
        break
      case 'gemini':
        responseText = await generateWithGemini(SYSTEM_PROMPT, userPrompt)
        break
      default:
        throw new Error(`Unknown model: ${selectedModel}`)
    }

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
      model: selectedModel,
    })

  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    )
  }
}
