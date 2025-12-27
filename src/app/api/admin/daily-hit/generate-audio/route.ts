import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ElevenLabs Configuration
const ELEVENLABS_CONFIG = {
  voiceId: '15CVCzDByBinCIoCblXo', // Lucan Rook - Energetic Male
  modelId: 'eleven_multilingual_v2',
  stability: 0.6,
  similarityBoost: 0.8,
  style: 0.3,
  speed: 0.92,
}

// Intro/outro audio file URLs in daily-motivation-audio bucket
const INTRO_URL = `${supabaseUrl}/storage/v1/object/public/daily-motivation-audio/dhintro.mp3`
const OUTRO_URL = `${supabaseUrl}/storage/v1/object/public/daily-motivation-audio/dhoutro.mp3`

// POST - Generate audio for a draft using ElevenLabs
export async function POST(request: NextRequest) {
  try {
    const { draftId, script, title, dayOfYear, combineWithIntroOutro = true } = await request.json()

    if (!draftId || !script || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: draftId, script, title' },
        { status: 400 }
      )
    }

    console.log(`Generating audio for draft: ${draftId}, title: ${title}, day: ${dayOfYear}`)

    // Update draft status to generating
    await supabase
      .from('daily_hit_drafts')
      .update({
        audio_generation_status: 'generating',
        audio_error: null,
        audio_script: script,
      })
      .eq('id', draftId)

    // Step 1: Generate TTS audio from ElevenLabs
    console.log('Calling ElevenLabs API...')

    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_CONFIG.voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: script,
          model_id: ELEVENLABS_CONFIG.modelId,
          voice_settings: {
            stability: ELEVENLABS_CONFIG.stability,
            similarity_boost: ELEVENLABS_CONFIG.similarityBoost,
            style: ELEVENLABS_CONFIG.style,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text()
      throw new Error(`ElevenLabs API error: ${errorText}`)
    }

    const ttsAudioBuffer = Buffer.from(await ttsResponse.arrayBuffer())
    console.log(`TTS audio generated: ${ttsAudioBuffer.length} bytes`)

    // Step 2: Upload raw TTS audio
    const sanitizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')

    const timestamp = Date.now()
    const ttsFileName = `tts_${sanitizedTitle}_${timestamp}.mp3`

    const { error: ttsUploadError } = await supabase.storage
      .from('daily-motivation-audio')
      .upload(ttsFileName, ttsAudioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (ttsUploadError) {
      throw new Error(`Failed to upload TTS audio: ${ttsUploadError.message}`)
    }

    const { data: ttsUrlData } = supabase.storage
      .from('daily-motivation-audio')
      .getPublicUrl(ttsFileName)

    const ttsAudioUrl = ttsUrlData.publicUrl
    console.log(`TTS audio uploaded: ${ttsAudioUrl}`)

    // Update draft with TTS URL
    await supabase
      .from('daily_hit_drafts')
      .update({
        tts_audio_url: ttsAudioUrl,
        audio_generation_status: combineWithIntroOutro ? 'combining' : 'complete',
      })
      .eq('id', draftId)

    if (!combineWithIntroOutro) {
      return NextResponse.json({
        success: true,
        draftId,
        ttsAudioUrl,
        message: 'TTS audio generated successfully (no intro/outro)',
      })
    }

    // Step 3: Call the merge-audio Edge Function to combine intro + TTS + outro
    console.log('Calling merge-audio edge function...')

    // Generate output filename with day_of_year prefix if available
    // Format: "365. title_here_complete.mp4" to match existing entries
    const dayPrefix = dayOfYear ? `${dayOfYear}. ` : ''
    const outputFileName = `${dayPrefix}${sanitizedTitle}_complete.mp4`

    const combineResponse = await fetch(
      `${supabaseUrl}/functions/v1/merge-audio`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          introUrl: INTRO_URL,
          speechUrl: ttsAudioUrl,
          outroUrl: OUTRO_URL,
          outputFileName,
        }),
      }
    )

    if (!combineResponse.ok) {
      // Combination failed, but TTS was successful
      const errorData = await combineResponse.json().catch(() => ({ error: 'Unknown error' }))
      console.warn('Audio combination failed, falling back to TTS only:', errorData)

      // Use TTS audio as the final audio
      await supabase
        .from('daily_hit_drafts')
        .update({
          audio_url: ttsAudioUrl,
          audio_generation_status: 'complete',
          audio_error: 'Combination with intro/outro failed, using TTS audio only',
        })
        .eq('id', draftId)

      return NextResponse.json({
        success: true,
        draftId,
        ttsAudioUrl,
        completeAudioUrl: ttsAudioUrl,
        message: 'TTS audio generated (combination with intro/outro failed)',
        warning: errorData.error,
      })
    }

    const combineData = await combineResponse.json()

    // Update draft with final combined audio URL
    const completeAudioUrl = combineData.url
    await supabase
      .from('daily_hit_drafts')
      .update({
        audio_url: completeAudioUrl,
        audio_generation_status: 'complete',
      })
      .eq('id', draftId)

    return NextResponse.json({
      success: true,
      draftId,
      ttsAudioUrl,
      completeAudioUrl,
      outputFileName,
      message: 'Audio generated and combined successfully',
    })

  } catch (error) {
    console.error('Error generating audio:', error)

    // Update draft with error
    try {
      const body = await request.clone().json().catch(() => ({}))
      if (body.draftId) {
        await supabase
          .from('daily_hit_drafts')
          .update({
            audio_generation_status: 'failed',
            audio_error: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', body.draftId)
      }
    } catch (updateError) {
      console.error('Failed to update error status:', updateError)
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate audio' },
      { status: 500 }
    )
  }
}

// GET - Get audio generation status for a draft
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const draftId = searchParams.get('draftId')

  if (!draftId) {
    return NextResponse.json({ error: 'Missing draftId' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('daily_hit_drafts')
      .select('audio_generation_status, audio_url, tts_audio_url, audio_error')
      .eq('id', draftId)
      .single()

    if (error) throw error

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching audio status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch status' },
      { status: 500 }
    )
  }
}
