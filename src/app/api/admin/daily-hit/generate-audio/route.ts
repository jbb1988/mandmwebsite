import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

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

// Merge audio files using FFmpeg WASM
async function mergeAudioWithFFmpeg(
  introUrl: string,
  ttsUrl: string,
  outroUrl: string
): Promise<Buffer> {
  const ffmpeg = new FFmpeg()

  // Load FFmpeg WASM from CDN
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  })

  console.log('FFmpeg loaded, fetching audio files...')

  // Fetch all audio files
  const [introData, ttsData, outroData] = await Promise.all([
    fetch(introUrl).then(r => r.arrayBuffer()),
    fetch(ttsUrl).then(r => r.arrayBuffer()),
    fetch(outroUrl).then(r => r.arrayBuffer()),
  ])

  console.log(`Audio files fetched: intro=${introData.byteLength}, tts=${ttsData.byteLength}, outro=${outroData.byteLength}`)

  // Write input files to FFmpeg virtual filesystem
  await ffmpeg.writeFile('intro.mp3', new Uint8Array(introData))
  await ffmpeg.writeFile('tts.mp3', new Uint8Array(ttsData))
  await ffmpeg.writeFile('outro.mp3', new Uint8Array(outroData))

  // Create concat list file
  await ffmpeg.writeFile('list.txt',
    "file 'intro.mp3'\nfile 'tts.mp3'\nfile 'outro.mp3'"
  )

  console.log('Running FFmpeg concat...')

  // Merge using FFmpeg concat demuxer
  // Using -c copy for stream copy (no re-encoding) when formats match
  // If that fails, we'll re-encode
  try {
    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'list.txt',
      '-c', 'copy',
      'output.mp3'
    ])
  } catch (e) {
    console.log('Stream copy failed, re-encoding...')
    // Fallback: re-encode if stream copy doesn't work
    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'list.txt',
      '-acodec', 'libmp3lame',
      '-q:a', '2',
      'output.mp3'
    ])
  }

  // Read the output file
  const data = await ffmpeg.readFile('output.mp3')
  console.log(`FFmpeg merge complete: ${data.length} bytes`)

  // Terminate FFmpeg to free memory
  await ffmpeg.terminate()

  return Buffer.from(data as Uint8Array)
}

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
      // Just use TTS audio directly
      await supabase
        .from('daily_hit_drafts')
        .update({
          audio_url: ttsAudioUrl,
          audio_generation_status: 'complete',
        })
        .eq('id', draftId)

      return NextResponse.json({
        success: true,
        draftId,
        ttsAudioUrl,
        completeAudioUrl: ttsAudioUrl,
        message: 'TTS audio generated successfully (no intro/outro)',
      })
    }

    // Step 3: Merge intro + TTS + outro using FFmpeg WASM
    console.log('Merging audio with FFmpeg WASM...')

    try {
      const mergedBuffer = await mergeAudioWithFFmpeg(
        INTRO_URL,
        ttsAudioUrl,
        OUTRO_URL
      )

      // Generate output filename with day_of_year prefix if available
      const dayPrefix = dayOfYear ? `${dayOfYear}. ` : ''
      const outputFileName = `${dayPrefix}${sanitizedTitle}_complete.mp3`

      // Upload merged audio
      const { error: uploadError } = await supabase.storage
        .from('daily-motivation-audio')
        .upload(outputFileName, mergedBuffer, {
          contentType: 'audio/mpeg',
          upsert: true,
        })

      if (uploadError) {
        throw new Error(`Failed to upload merged audio: ${uploadError.message}`)
      }

      const { data: mergedUrlData } = supabase.storage
        .from('daily-motivation-audio')
        .getPublicUrl(outputFileName)

      const completeAudioUrl = mergedUrlData.publicUrl

      // Update draft with final combined audio URL
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
        message: 'Audio generated and merged successfully with intro/outro',
      })

    } catch (mergeError) {
      // FFmpeg merge failed, fall back to TTS only
      console.error('FFmpeg merge failed:', mergeError)

      await supabase
        .from('daily_hit_drafts')
        .update({
          audio_url: ttsAudioUrl,
          audio_generation_status: 'complete',
          audio_error: `Merge failed (using TTS only): ${mergeError instanceof Error ? mergeError.message : 'Unknown error'}`,
        })
        .eq('id', draftId)

      return NextResponse.json({
        success: true,
        draftId,
        ttsAudioUrl,
        completeAudioUrl: ttsAudioUrl,
        message: 'TTS audio generated (merge with intro/outro failed)',
        warning: mergeError instanceof Error ? mergeError.message : 'Merge failed',
      })
    }

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
