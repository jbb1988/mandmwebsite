import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// OpenRouter configuration
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const APP_REFERER = 'https://mindandmuscle.ai'
const APP_TITLE = 'Mind & Muscle Daily Hit Builder'

// Supported AI models via OpenRouter
type AIModel = 'gpt-4o' | 'claude' | 'gemini'

// Map friendly names to OpenRouter model IDs
const MODEL_MAP: Record<AIModel, string> = {
  'gpt-4o': 'openai/gpt-4o',
  'claude': 'anthropic/claude-3-opus',
  'gemini': 'google/gemini-2.0-flash-exp',
}

const SYSTEM_PROMPT = `You are the Mind & Muscle Daily Hit content creator for youth baseball/softball athletes (ages 12-20).

VOICE & STYLE:
- Direct & Punchy: Short, impactful sentences that hit hard. Many sentences are just 3-6 words.
- Conversational Authority: Speak like a coach who's been there
- Baseball-Specific: Use baseball terminology and scenarios naturally
- Motivational but Realistic: Inspiring without being cheesy
- Action-Oriented: Drive toward specific behavior change
- Rhythmic Flow: Sentences build on each other with a cadence that's easy to listen to

AUDIO SCRIPT FORMAT (CRITICAL - MUST be exactly ~400 words for 2-3 minutes of audio):
DO NOT include intro or outro - those are separate audio files added via FFmpeg.
The audioScript is ONLY the core teaching content.

*** IMPORTANT: The audioScript field MUST be approximately 400 words. Not 200, not 300 - exactly 400. ***

CORE CONTENT STRUCTURE (~400 words total):
1. HOOK (25 words): Grab attention with a bold statement or question
2. PROBLEM/CONTRAST (50 words): What most players do wrong
3. CORE TEACHING (150 words): The main lesson with specific baseball examples
4. MINDSET REFRAME (75 words): Perspective shift, mental approach
5. ACTION/APPLICATION (60 words): How to apply this in practice and games
6. POWERFUL CLOSE (40 words): End with conviction (but NOT the show outro)

STYLE REQUIREMENTS:
- Use SHORT punchy sentences. Many just 3-6 words.
- Include specific scenarios (at-bats, fielding, pressure moments)
- Build momentum with repetition and rhythm
- Direct address to the player ("You're going to..." "When you...")
- Use contrast: "Most players do X. Champions do Y."

WRITING PATTERNS TO USE:
- Question Hooks: "You know what separates..."
- Contrast Statements: "Most players do X. Champions do Y."
- Short Punchy Sentences: "That's intent." "That's mindset." "That's the game."
- Repetition for emphasis: "They don't sulk. They don't make excuses. They don't let one mistake define their entire game."
- Building statements: "It's waking up... It's facing... It's standing..."
- Direct Address: "You can..." "Your best at-bats..." "When you step in that box..."

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

CRITICAL: You must respond with ONLY a valid JSON object. No explanation, no introduction, no "Here is..." - ONLY the JSON.

{
  "title": "Short punchy title (5 words max)",
  "pushText": "One powerful sentence (8-12 words)",
  "headline": "Mind & Muscle Daily Hit: [Title]",
  "body": "Full body content with emojis as specified",
  "challenge": "Specific actionable challenge",
  "audioScript": "EXACTLY 400 WORDS. Count them. Full script with all 6 sections above. No intro/outro.",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "keyTakeaway": "One sentence key takeaway"
}

IMPORTANT: Start your response with { and end with }. Nothing else.`

// Generate content via OpenRouter (unified API for all models)
async function generateWithOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  model: AIModel
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')

  const openRouterModel = MODEL_MAP[model]

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': APP_REFERER,
      'X-Title': APP_TITLE,
    },
    body: JSON.stringify({
      model: openRouterModel,
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
    throw new Error(`OpenRouter API error (${openRouterModel}): ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Check if OpenRouter is configured
function isOpenRouterAvailable(): boolean {
  return !!process.env.OPENROUTER_API_KEY
}

// GET - Return available models
export async function GET() {
  const hasOpenRouter = isOpenRouterAvailable()

  // All models available if OpenRouter is configured
  const availableModels: AIModel[] = hasOpenRouter ? ['gpt-4o', 'claude', 'gemini'] : []

  return NextResponse.json({
    availableModels,
    recommended: hasOpenRouter ? 'gpt-4o' : null,
    provider: 'OpenRouter',
    modelInfo: {
      'gpt-4o': {
        name: 'GPT-4o (OpenAI)',
        description: 'Best for creative writing, nuanced emotion, and narrative flair',
        available: hasOpenRouter,
        openRouterId: MODEL_MAP['gpt-4o'],
      },
      'claude': {
        name: 'Claude Opus (Anthropic)',
        description: 'Best for structured, uplifting prose with exceptional clarity and coherence',
        available: hasOpenRouter,
        openRouterId: MODEL_MAP['claude'],
      },
      'gemini': {
        name: 'Gemini 2.0 Flash (Google)',
        description: 'Fast and efficient with good creative output',
        available: hasOpenRouter,
        openRouterId: MODEL_MAP['gemini'],
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

    // Check OpenRouter availability
    if (!isOpenRouterAvailable()) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY not configured. Add it in Vercel environment variables.' },
        { status: 500 }
      )
    }

    // Default to gpt-4o if no model specified
    const selectedModel: AIModel = model && ['gpt-4o', 'claude', 'gemini'].includes(model)
      ? model
      : 'gpt-4o'

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

    // Generate via OpenRouter
    const responseText = await generateWithOpenRouter(SYSTEM_PROMPT, userPrompt, selectedModel)

    // Extract JSON from response - try multiple approaches
    let jsonText = responseText
    let generatedContent = null

    // Approach 1: Look for ```json code block
    if (responseText.includes('```json')) {
      jsonText = responseText.split('```json')[1].split('```')[0].trim()
    }
    // Approach 2: Look for any ``` code block
    else if (responseText.includes('```')) {
      jsonText = responseText.split('```')[1].split('```')[0].trim()
    }
    // Approach 3: Look for JSON object pattern anywhere in response
    else {
      const jsonMatch = responseText.match(/\{[\s\S]*"title"[\s\S]*"audioScript"[\s\S]*\}/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      }
    }

    // Helper to fix common JSON issues from AI output
    const repairJson = (str: string): string => {
      // Strategy: Process the string character by character to properly escape newlines inside strings
      let result = ''
      let inString = false
      let escaped = false

      for (let i = 0; i < str.length; i++) {
        const char = str[i]

        if (escaped) {
          result += char
          escaped = false
          continue
        }

        if (char === '\\') {
          escaped = true
          result += char
          continue
        }

        if (char === '"') {
          inString = !inString
          result += char
          continue
        }

        if (inString) {
          // Inside a string - escape newlines and other control chars
          if (char === '\n') {
            result += '\\n'
          } else if (char === '\r') {
            result += '\\r'
          } else if (char === '\t') {
            result += '\\t'
          } else {
            result += char
          }
        } else {
          result += char
        }
      }

      // Remove trailing commas before } or ]
      result = result.replace(/,(\s*[}\]])/g, '$1')

      return result
    }

    try {
      generatedContent = JSON.parse(jsonText)
    } catch (parseError) {
      // Try repairing the JSON (fix unescaped newlines, etc.)
      try {
        const repaired = repairJson(jsonText)
        generatedContent = JSON.parse(repaired)
      } catch {
        // Last resort: extract from { to } and try again
        const jsonStartIndex = responseText.indexOf('{')
        const jsonEndIndex = responseText.lastIndexOf('}')

        if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
          const extractedJson = responseText.substring(jsonStartIndex, jsonEndIndex + 1)
          try {
            generatedContent = JSON.parse(extractedJson)
          } catch {
            // Try repairing the extracted JSON
            try {
              const repairedExtracted = repairJson(extractedJson)
              generatedContent = JSON.parse(repairedExtracted)
            } catch (finalError) {
              console.error('JSON parse error:', finalError)
              console.error('Raw response (first 500 chars):', responseText.substring(0, 500))
              throw new Error(`Failed to parse AI response as JSON. Response started with: "${responseText.substring(0, 100)}..."`)
            }
          }
        } else {
          throw new Error(`AI did not return valid JSON. Response started with: "${responseText.substring(0, 100)}..."`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      content: generatedContent,
      topicId: topicId || null,
      model: selectedModel,
      openRouterId: MODEL_MAP[selectedModel],
    })

  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    )
  }
}
