import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdmin } from '@/lib/admin-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// OpenRouter for AI-powered prompt generation
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Available image style presets
const IMAGE_STYLES = {
  cinematic_silhouette: {
    name: 'Cinematic Silhouette',
    description: 'Dramatic silhouettes against sunset/twilight sky',
    styleGuide: `
- Cinematic silhouette or dramatic backlit photography
- Dramatic lighting: sunset orange, golden hour, stadium lights
- Color palette: deep orange, amber, dark blue twilight
- Atmospheric effects: haze, lens flare, volumetric light
- Epic/heroic framing with backlit subjects
- Youth baseball/softball athletes (ages 12-20)`,
  },
  action_photography: {
    name: 'Action Photography',
    description: 'Dynamic frozen-motion sports shots',
    styleGuide: `
- High-speed frozen action sports photography
- Sharp focus on the athlete mid-motion
- Dynamic angles: low angle hero shots, dramatic perspectives
- Color palette: vibrant team colors, stadium lighting
- Motion blur on background, crisp subject
- Intense expressions, peak action moments`,
  },
  gritty_training: {
    name: 'Gritty Training',
    description: 'Raw, authentic practice & workout moments',
    styleGuide: `
- Raw, documentary-style training photography
- Early morning or late evening practice sessions
- Gritty textures: dirt, sweat, chalk, worn equipment
- Color palette: muted earth tones, natural lighting
- Focus on effort, determination, hard work
- Authentic, unpolished moments of dedication`,
  },
  stadium_epic: {
    name: 'Stadium Epic',
    description: 'Grand stadium atmospheres with dramatic lighting',
    styleGuide: `
- Epic wide shots of stadium environments
- Dramatic stadium lighting cutting through atmosphere
- Color palette: warm stadium lights, evening blue sky
- Atmospheric effects: light beams, crowd silhouettes
- Grand scale emphasizing the stage
- Focus on the magnitude of the moment`,
  },
  intimate_focus: {
    name: 'Intimate Focus',
    description: 'Close-up emotional portraits and details',
    styleGuide: `
- Intimate close-up portraits showing emotion
- Shallow depth of field, soft bokeh backgrounds
- Focus on eyes, expressions, small details
- Color palette: warm skin tones, soft natural light
- Contemplative, pre-game or post-game moments
- Equipment details: grip on bat, glove leather, cleats`,
  },
  vintage_baseball: {
    name: 'Vintage Baseball',
    description: 'Nostalgic, timeless baseball aesthetic',
    styleGuide: `
- Nostalgic, film-like baseball photography
- Warm vintage color grading
- Classic baseball imagery and compositions
- Color palette: sepia tones, faded colors, warm highlights
- Timeless moments that could be any era
- Focus on the pure love of the game`,
  },
}

const getImagePromptSystem = (style: keyof typeof IMAGE_STYLES) => {
  const styleConfig = IMAGE_STYLES[style] || IMAGE_STYLES.cinematic_silhouette
  return `You are an expert at creating DALL-E image prompts for baseball/softball motivational content.

Given the content of a Daily Hit (title, body, audio script), create an image prompt that VISUALLY REPRESENTS the core message.

VISUAL STYLE: ${styleConfig.name}
${styleConfig.styleGuide}

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
}

async function generateWithAI(content: string, style: keyof typeof IMAGE_STYLES = 'cinematic_silhouette'): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }

  const systemPrompt = getImagePromptSystem(style)

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
        { role: 'system', content: systemPrompt },
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
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const {
      title,
      body,
      audioScript,
      challenge,
      tags,
      draftId,
      style = 'cinematic_silhouette',
    } = await request.json()

    if (!title && !body && !audioScript) {
      return NextResponse.json(
        { error: 'Must provide title, body, or audioScript for prompt generation' },
        { status: 400 }
      )
    }

    // Validate style
    const selectedStyle = (style in IMAGE_STYLES ? style : 'cinematic_silhouette') as keyof typeof IMAGE_STYLES
    const styleConfig = IMAGE_STYLES[selectedStyle]

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

    // Generate contextual prompt using AI with selected style
    const generatedPrompt = await generateWithAI(contentSummary, selectedStyle)

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
      styleUsed: {
        key: selectedStyle,
        name: styleConfig.name,
        description: styleConfig.description,
      },
      instructions: {
        platform: 'OpenAI DALL-E 3 or Midjourney',
        recommendedSize: '1792x1024 (landscape)',
        quality: 'hd',
        style: styleConfig.name,
        tips: [
          'This prompt was AI-generated to match your content',
          `Style: ${styleConfig.name}`,
          'Use DALL-E 3 for best results',
          'Try 2-3 generations and pick the best',
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

// GET - Return available styles and service info
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const styles = Object.entries(IMAGE_STYLES).map(([key, value]) => ({
    key,
    name: value.name,
    description: value.description,
  }))

  return NextResponse.json({
    service: 'AI-Powered Image Prompt Generator',
    description: 'Analyzes Daily Hit content and generates contextual DALL-E prompts',
    requiredFields: ['title', 'body or audioScript'],
    optionalFields: ['challenge', 'tags', 'draftId', 'style'],
    availableStyles: styles,
    defaultStyle: 'cinematic_silhouette',
  })
}
