import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * OpenAI DALL-E Optimized Image Prompt Generator
 *
 * Based on analysis of high-quality baseball imagery:
 * - Cinematic silhouettes of baseball players
 * - Dramatic lighting (sunset orange, stadium lights, golden hour)
 * - Orange/amber/deep blue color palette
 * - Atmospheric effects (smoke, particles, fire, aurora)
 * - Epic/heroic framing
 * - Painterly to photorealistic styles
 */

// Style presets for consistent visual language
const STYLE_PRESETS = {
  cinematic_silhouette: {
    base: 'cinematic silhouette photograph',
    lighting: 'dramatic sunset backlight with golden hour rays streaming through',
    atmosphere: 'atmospheric haze, lens flare, volumetric light rays',
    colors: 'deep orange and amber tones against dark blue twilight sky',
    quality: 'ultra high resolution, 8k, photorealistic, professional sports photography',
  },
  epic_hero: {
    base: 'epic heroic sports portrait',
    lighting: 'dramatic rim lighting with stadium spotlights creating halo effect',
    atmosphere: 'smoke and dust particles floating in the air, shallow depth of field',
    colors: 'warm orange highlights against cool blue shadows, high contrast',
    quality: 'cinematic quality, award-winning sports photography, hyperrealistic',
  },
  fiery_determination: {
    base: 'intense action sports photograph',
    lighting: 'fiery orange and red backlighting with sparks and embers',
    atmosphere: 'fire effects, smoke trails, dynamic motion blur on background',
    colors: 'blazing orange and red against dark shadowy background',
    quality: 'dramatic composition, high-end advertising quality, photorealistic',
  },
  aurora_mystical: {
    base: 'ethereal sports photograph with fantasy elements',
    lighting: 'northern lights aurora borealis in the background',
    atmosphere: 'magical particles, starfield, cosmic energy effects',
    colors: 'purple and teal aurora with orange warm highlights on subject',
    quality: 'dreamlike quality, artistic sports photography, hyperdetailed',
  },
  gritty_determination: {
    base: 'raw powerful sports photograph',
    lighting: 'harsh single spotlight creating dramatic shadows',
    atmosphere: 'rain or sweat droplets frozen in motion, dust kicked up',
    colors: 'high contrast black and white with selective orange color splash',
    quality: 'documentary style, grain texture, emotionally impactful',
  },
  golden_triumph: {
    base: 'triumphant victory sports photograph',
    lighting: 'golden hour sunlight streaming in from side',
    atmosphere: 'dust motes floating in light beams, lens flare',
    colors: 'warm golden tones, amber highlights, rich earth tones',
    quality: 'inspirational, magazine cover quality, masterful composition',
  }
}

// Baseball-specific action poses
const ACTION_POSES = {
  batter: [
    'baseball player in powerful batting stance, mid-swing follow-through',
    'batter loading up before swing, intense focus',
    'baseball player watching ball leave bat, triumphant pose',
    'youth baseball player practicing swing in batting cage',
    'softball player in aggressive batting stance',
  ],
  pitcher: [
    'pitcher in dramatic wind-up motion, leg high',
    'baseball pitcher mid-delivery, arm cocked back',
    'pitcher following through after release, dynamic pose',
    'youth pitcher on mound, determined expression',
    'softball pitcher in windmill motion',
  ],
  fielder: [
    'baseball player making diving catch, fully extended',
    'outfielder running back for catch, looking over shoulder',
    'infielder ready position, athletic stance',
    'shortstop turning double play, mid-throw',
    'catcher in full gear, blocking position',
  ],
  general: [
    'baseball player silhouette against dramatic sky',
    'athlete walking onto field at sunset',
    'player standing alone on diamond, contemplative',
    'youth athlete training with determination',
    'baseball player looking up at stadium lights',
  ]
}

// Theme-specific enhancements
const THEME_MODIFIERS = {
  confidence: 'powerful stance, chest out, commanding presence',
  resilience: 'getting up from dirt, dust on uniform, determined expression',
  focus: 'intense concentration, narrowed eyes, locked on target',
  preparation: 'early morning training session, fog on field, dedication',
  teamwork: 'high-five moment, teammates celebrating',
  mental_strength: 'calm composed expression amid chaos, zen-like focus',
  pressure: 'stadium packed with fans, bright lights, high-stakes moment',
  victory: 'arms raised in celebration, emotional triumph',
  failure_recovery: 'head down moment transforming to head up, phoenix rising',
  growth: 'young athlete looking up at professional player silhouette',
}

export async function POST(request: NextRequest) {
  try {
    const {
      title,
      body,
      challenge,
      tags,
      theme,
      targetRole,
      customElements,
      stylePreset,
      draftId,
    } = await request.json()

    if (!title && !body && !theme) {
      return NextResponse.json(
        { error: 'Must provide title, body, or theme for prompt generation' },
        { status: 400 }
      )
    }

    // Select style preset
    const style = STYLE_PRESETS[stylePreset as keyof typeof STYLE_PRESETS] || STYLE_PRESETS.cinematic_silhouette

    // Determine action pose based on target role or random
    const roleKey = (targetRole === 'hitter' ? 'batter' : targetRole) as keyof typeof ACTION_POSES || 'general'
    const poses = ACTION_POSES[roleKey] || ACTION_POSES.general
    const selectedPose = poses[Math.floor(Math.random() * poses.length)]

    // Get theme modifier if theme matches
    let themeModifier = ''
    const themeLower = (theme || title || '').toLowerCase()
    for (const [key, modifier] of Object.entries(THEME_MODIFIERS)) {
      if (themeLower.includes(key) || tags?.some((t: string) => t.toLowerCase().includes(key))) {
        themeModifier = modifier
        break
      }
    }

    // Build the OpenAI-optimized prompt
    const promptParts = [
      style.base,
      selectedPose,
      themeModifier,
      customElements,
      style.lighting,
      style.atmosphere,
      style.colors,
      style.quality,
      'no text, no watermarks, no logos, clean composition',
    ].filter(Boolean)

    const fullPrompt = promptParts.join(', ')

    // Generate alternative prompts with different styles
    const styleKeys = Object.keys(STYLE_PRESETS)
    const alternativePrompts = styleKeys
      .filter(key => key !== (stylePreset || 'cinematic_silhouette'))
      .slice(0, 3)
      .map(key => {
        const altStyle = STYLE_PRESETS[key as keyof typeof STYLE_PRESETS]
        return {
          style: key,
          prompt: [
            altStyle.base,
            selectedPose,
            themeModifier,
            altStyle.lighting,
            altStyle.atmosphere,
            altStyle.colors,
            altStyle.quality,
            'no text, no watermarks, no logos, clean composition',
          ].filter(Boolean).join(', ')
        }
      })

    // Save prompt to draft if draftId provided
    if (draftId) {
      await supabase
        .from('daily_hit_drafts')
        .update({
          image_prompt: fullPrompt,
          image_generation_status: 'prompt_ready',
        })
        .eq('id', draftId)
    }

    return NextResponse.json({
      success: true,
      prompt: fullPrompt,
      alternatives: alternativePrompts,
      metadata: {
        style: stylePreset || 'cinematic_silhouette',
        pose: selectedPose,
        themeModifier: themeModifier || null,
        targetRole: targetRole || 'general',
      },
      instructions: {
        platform: 'OpenAI DALL-E 3',
        size: '1792x1024 (landscape) or 1024x1792 (portrait) recommended',
        quality: 'hd',
        style: 'vivid',
        tips: [
          'Use 1792x1024 for wide cinematic shots',
          'Use 1024x1024 for balanced compositions',
          'Enable "vivid" style for maximum drama',
          'Run 2-3 generations and pick the best one',
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

// GET - Get all style presets and options
export async function GET() {
  return NextResponse.json({
    stylePresets: Object.keys(STYLE_PRESETS).map(key => ({
      id: key,
      name: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: STYLE_PRESETS[key as keyof typeof STYLE_PRESETS].base,
    })),
    actionPoses: Object.keys(ACTION_POSES),
    themeModifiers: Object.keys(THEME_MODIFIERS),
  })
}
