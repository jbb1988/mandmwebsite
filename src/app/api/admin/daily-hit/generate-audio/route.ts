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

/**
 * Pure JavaScript MP3 concatenation
 *
 * MP3 files can be concatenated if we handle the metadata correctly:
 * 1. ID3v2 tags appear at the start (variable length, starts with "ID3")
 * 2. MP3 audio frames start with sync word (0xFF followed by 0xE0-0xFF)
 * 3. ID3v1 tags appear at the end (fixed 128 bytes, starts with "TAG")
 *
 * For concatenation, we:
 * - Keep the first file's ID3v2 header (if present)
 * - Extract only the MP3 frame data from each file
 * - Skip ID3v1 tags from all files
 */

function findID3v2End(data: Uint8Array): number {
  // Check for ID3v2 header: "ID3"
  if (data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) {
    // ID3v2 header found
    // Bytes 6-9 contain the size (syncsafe integer)
    const size = ((data[6] & 0x7F) << 21) |
                 ((data[7] & 0x7F) << 14) |
                 ((data[8] & 0x7F) << 7) |
                 (data[9] & 0x7F)
    // Total header size = 10 bytes header + size
    return 10 + size
  }
  return 0
}

function findMP3FrameStart(data: Uint8Array, startOffset: number = 0): number {
  // Look for MP3 frame sync: 0xFF followed by 0xE0 or higher (11 sync bits)
  for (let i = startOffset; i < data.length - 1; i++) {
    if (data[i] === 0xFF && (data[i + 1] & 0xE0) === 0xE0) {
      return i
    }
  }
  return startOffset
}

function findID3v1Start(data: Uint8Array): number {
  // ID3v1 tag is exactly 128 bytes at the end, starting with "TAG"
  if (data.length >= 128) {
    const tagStart = data.length - 128
    if (data[tagStart] === 0x54 && data[tagStart + 1] === 0x41 && data[tagStart + 2] === 0x47) {
      return tagStart
    }
  }
  return data.length
}

function extractMP3Frames(data: Uint8Array, keepHeader: boolean = false): Uint8Array {
  const id3v2End = findID3v2End(data)
  const frameStart = findMP3FrameStart(data, id3v2End)
  const id3v1Start = findID3v1Start(data)

  if (keepHeader && id3v2End > 0) {
    // Keep the ID3v2 header for the first file
    const header = data.slice(0, id3v2End)
    const frames = data.slice(frameStart, id3v1Start)
    const result = new Uint8Array(header.length + frames.length)
    result.set(header, 0)
    result.set(frames, header.length)
    return result
  }

  // Just return the MP3 frames
  return data.slice(frameStart, id3v1Start)
}

async function mergeMP3Files(
  introUrl: string,
  ttsUrl: string,
  outroUrl: string
): Promise<Buffer> {
  console.log('Fetching audio files for merge...')

  // Fetch all audio files
  const [introData, ttsData, outroData] = await Promise.all([
    fetch(introUrl).then(r => r.arrayBuffer()),
    fetch(ttsUrl).then(r => r.arrayBuffer()),
    fetch(outroUrl).then(r => r.arrayBuffer()),
  ])

  console.log(`Audio files fetched: intro=${introData.byteLength}, tts=${ttsData.byteLength}, outro=${outroData.byteLength}`)

  // Convert to Uint8Arrays
  const introBytes = new Uint8Array(introData)
  const ttsBytes = new Uint8Array(ttsData)
  const outroBytes = new Uint8Array(outroData)

  // Extract MP3 frames from each file
  // Keep the header from the intro file
  const introFrames = extractMP3Frames(introBytes, true)
  const ttsFrames = extractMP3Frames(ttsBytes, false)
  const outroFrames = extractMP3Frames(outroBytes, false)

  console.log(`Extracted frames: intro=${introFrames.length}, tts=${ttsFrames.length}, outro=${outroFrames.length}`)

  // Concatenate all frames
  const totalLength = introFrames.length + ttsFrames.length + outroFrames.length
  const merged = new Uint8Array(totalLength)

  let offset = 0
  merged.set(introFrames, offset)
  offset += introFrames.length
  merged.set(ttsFrames, offset)
  offset += ttsFrames.length
  merged.set(outroFrames, offset)

  console.log(`Merged MP3 size: ${merged.length} bytes`)

  return Buffer.from(merged)
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

    // Step 3: Merge intro + TTS + outro using pure JS MP3 concatenation
    console.log('Merging audio files...')

    try {
      const mergedBuffer = await mergeMP3Files(
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
      // Merge failed, fall back to TTS only
      console.error('MP3 merge failed:', mergeError)

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
