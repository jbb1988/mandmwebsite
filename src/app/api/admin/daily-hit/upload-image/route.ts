import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdmin } from '@/lib/admin-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// POST - Upload image to media-thumbnails bucket
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const title = formData.get('title') as string
    const dayOfYear = formData.get('dayOfYear') as string
    const draftId = formData.get('draftId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Generate filename matching existing pattern
    // Format: "365. title_here.jpg" to match audio naming convention
    const sanitizedTitle = (title || 'daily_hit')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')

    const extension = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
    const dayPrefix = dayOfYear ? `${dayOfYear}. ` : ''
    const fileName = `${dayPrefix}${sanitizedTitle}.${extension}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to media-thumbnails bucket
    const { data, error: uploadError } = await supabase.storage
      .from('media-thumbnails')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true, // Allow overwriting if file exists
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media-thumbnails')
      .getPublicUrl(fileName)

    const thumbnailUrl = urlData.publicUrl

    // Update draft with thumbnail URL if draftId provided
    if (draftId) {
      const { error: updateError } = await supabase
        .from('daily_hit_drafts')
        .update({ thumbnail_url: thumbnailUrl })
        .eq('id', draftId)

      if (updateError) {
        console.error('Failed to update draft with thumbnail:', updateError)
      }
    }

    return NextResponse.json({
      success: true,
      url: thumbnailUrl,
      fileName,
      message: 'Image uploaded successfully',
    })

  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    )
  }
}
