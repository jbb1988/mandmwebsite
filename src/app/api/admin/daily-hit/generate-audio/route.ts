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

// POST - Generate TTS audio for a draft using ElevenLabs
export async function POST(request: NextRequest) {
  try {
    const { draftId, script, title, dayOfYear } = await request.json()

    if (!draftId || !script || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: draftId, script, title' },
        { status: 400 }
      )
    }

    console.log(`Generating TTS for draft: ${draftId}, title: ${title}`)

    // Update draft status to generating
    await supabase
      .from('daily_hit_drafts')
      .update({
        audio_generation_status: 'generating',
        audio_error: null,
        audio_script: script,
      })
      .eq('id', draftId)

    // Generate TTS audio from ElevenLabs
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

    // Generate filename
    const sanitizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')

    const dayPrefix = dayOfYear ? `${dayOfYear}. ` : ''
    const fileName = `${dayPrefix}${sanitizedTitle}_tts.mp3`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('daily-motivation-audio')
      .upload(fileName, ttsAudioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Failed to upload audio: ${uploadError.message}`)
    }

    const { data: urlData } = supabase.storage
      .from('daily-motivation-audio')
      .getPublicUrl(fileName)

    const audioUrl = urlData.publicUrl
    console.log(`TTS audio uploaded: ${audioUrl}`)

    // Update draft with audio URL
    await supabase
      .from('daily_hit_drafts')
      .update({
        tts_audio_url: audioUrl,
        audio_url: audioUrl,
        audio_generation_status: 'complete',
      })
      .eq('id', draftId)

    return NextResponse.json({
      success: true,
      draftId,
      audioUrl,
      fileName,
      message: 'TTS audio generated successfully',
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
