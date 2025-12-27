import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// OpenRouter for AI-powered prompt generation
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

const IMAGE_PROMPT_SYSTEM = `You are an expert at creating DALL-E image prompts for baseball/softball motivational content.

Given the content of a Daily Hit (title, body, audio script), create a cinematic image prompt that VISUALLY REPRESENTS the core message.

VISUAL STYLE REQUIREMENTS:
- Cinematic silhouette or dramatic sports photography
- Dramatic lighting: sunset orange, golden hour, stadium lights
- Color palette: deep orange, amber, dark blue twilight
- Atmospheric effects: haze, lens flare, volumetric light
- Epic/heroic framing
- Youth baseball/softball athletes (ages 12-20)

PROMPT STRUCTURE:
1. Main subject and action (must match the content's theme)
2. Emotional state/expression that matches the message
3. Lighting description
4. Atmosphere and effects
5. Color palette
6. Quality markers

IMPORTANT RULES:
- The image MUST visually represent the specific theme of the content
- If content is about "bouncing back from failure" → show player getting up from dirt
- If content is about "focus" → show intense concentration, locked eyes
- If content is about "confidence" → show powerful stance, commanding presence
- If content is about "preparation" → show early morning training
- NO text, watermarks, or logos in the image
- Keep prompt under 200 words

Respond with ONLY the image prompt, nothing else.`

async function generateWithAI(content: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://mindandmuscle.ai',
      'X-Title': 'Mind & Muscle Image Prompt Generator',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: IMAGE_PROMPT_SYSTEM },
        { role: 'user', content },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content.trim()
}

export async function POST(request: NextRequest) {
  try {
    const {
      title,
      body,
      audioScript,
      challenge,
      tags,
      draftId,
    } = await request.json()

    if (!title && !body && !audioScript) {
      return NextResponse.json(
        { error: 'Must provide title, body, or audioScript for prompt generation' },
        { status: 400 }
      )
    }

    // Build content summary for AI to analyze
    const contentSummary = `
DAILY HIT CONTENT:

Title: ${title || 'Not provided'}

Audio Script (main content):
${audioScript || body || 'Not provided'}

Challenge: ${challenge || 'Not provided'}

Tags: ${tags?.join(', ') || 'Not provided'}

Based on this content, create a DALL-E image prompt that visually represents the core message and theme.
`

    // Generate contextual prompt using AI
    const generatedPrompt = await generateWithAI(contentSummary)

    // Save prompt to draft if draftId provided
    if (draftId) {
      await supabase
        .from('daily_hit_drafts')
        .update({
          image_prompt: generatedPrompt,
          image_generation_status: 'prompt_ready',
        })
        .eq('id', draftId)
    }

    return NextResponse.json({
      success: true,
      prompt: generatedPrompt,
      contentAnalyzed: {
        title,
        hasAudioScript: !!audioScript,
        hasBody: !!body,
        tags: tags || [],
      },
      instructions: {
        platform: 'OpenAI DALL-E 3 or Midjourney',
        recommendedSize: '1792x1024 (landscape)',
        quality: 'hd',
        style: 'vivid',
        tips: [
          'This prompt was AI-generated to match your content',
          'Use DALL-E 3 for best results',
          'Try 2-3 generations and pick the best',
          'You can modify the prompt if needed',
        ]
      }
    })

  } catch (error) {
    console.error('Image prompt generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image prompt' },
      { status: 500 }
    )
  }
}

// GET - Return info about the service
export async function GET() {
  return NextResponse.json({
    service: 'AI-Powered Image Prompt Generator',
    description: 'Analyzes Daily Hit content and generates contextual DALL-E prompts',
    requiredFields: ['title', 'body or audioScript'],
    optionalFields: ['challenge', 'tags', 'draftId'],
  })
}
