import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CategoryStats {
  name: string
  count: number
  percentage: number
  target: number
  status: 'balanced' | 'over' | 'under'
  lastUsed: string | null
}

interface CategoryRecommendation {
  category: string
  reason: string
  suggestedTopics: { id: string; title: string }[]
}

// Primary categories we want to track balance for
const PRIMARY_CATEGORIES = [
  'Mindset',
  'Mental Game',
  'Goal Setting',
  'Work Ethic',
  'Recovery',
  'Training',
  'Hitting',
  'Pitching',
  'Fielding',
  'Leadership',
  'Resilience',
  'Focus',
  'Discipline',
  'Athlete',
  'Life Skills',
]

// GET - Fetch category balance analytics from motivation_content tags
export async function GET() {
  try {
    // 1. Get all published content with tags
    const { data: content, error: contentError } = await supabase
      .from('motivation_content')
      .select('id, title, tags, day_of_year')
      .eq('status', 'active')
      .order('day_of_year', { ascending: false })

    if (contentError) throw contentError

    // 2. Count tags across all content
    const tagCounts: Record<string, { count: number; lastDay: number | null }> = {}

    content?.forEach(item => {
      const tags = item.tags as string[] || []
      tags.forEach(tag => {
        // Normalize tag (capitalize first letter)
        const normalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()

        // Only count primary categories (skip things like 'mental-toughness' slug variants)
        const matchedCategory = PRIMARY_CATEGORIES.find(
          cat => cat.toLowerCase() === tag.toLowerCase() ||
                 cat.toLowerCase().replace(/\s+/g, '-') === tag.toLowerCase()
        )

        if (matchedCategory) {
          if (!tagCounts[matchedCategory]) {
            tagCounts[matchedCategory] = { count: 0, lastDay: null }
          }
          tagCounts[matchedCategory].count++
          if (item.day_of_year && (!tagCounts[matchedCategory].lastDay || item.day_of_year > tagCounts[matchedCategory].lastDay)) {
            tagCounts[matchedCategory].lastDay = item.day_of_year
          }
        }
      })
    })

    // 3. Calculate stats for each primary category
    const totalTags = Object.values(tagCounts).reduce((sum, c) => sum + c.count, 0) || 1
    const numCategories = PRIMARY_CATEGORIES.length
    const targetPercentage = Math.round(100 / numCategories)

    const categories: CategoryStats[] = PRIMARY_CATEGORIES.map(categoryName => {
      const data = tagCounts[categoryName] || { count: 0, lastDay: null }
      const percentage = Math.round((data.count / totalTags) * 100)

      let status: 'balanced' | 'over' | 'under' = 'balanced'
      if (percentage > targetPercentage + 3) status = 'over'
      else if (percentage < targetPercentage - 3 || data.count === 0) status = 'under'

      return {
        name: categoryName,
        count: data.count,
        percentage,
        target: targetPercentage,
        status,
        lastUsed: data.lastDay ? `Day ${data.lastDay}` : null
      }
    })

    // Sort by count (lowest first to highlight under-represented)
    categories.sort((a, b) => a.count - b.count)

    // 4. Generate recommendations for under-represented categories
    const recommendations: CategoryRecommendation[] = []
    const underCategories = categories.filter(c => c.status === 'under')

    for (const cat of underCategories.slice(0, 3)) {
      // Get available topics from topic library matching this category
      const { data: topics } = await supabase
        .from('daily_hit_topic_library')
        .select('id, title, use_count')
        .ilike('category', `%${cat.name}%`)
        .eq('status', 'available')
        .order('use_count', { ascending: true, nullsFirst: true })
        .limit(3)

      recommendations.push({
        category: cat.name,
        reason: cat.count === 0
          ? 'No content with this tag yet'
          : `Only ${cat.count} items (${cat.percentage}% vs ${cat.target}% target)`,
        suggestedTopics: (topics || []).map(t => ({ id: t.id, title: t.title }))
      })
    }

    // 5. Get recent 30 days tag distribution
    const today = new Date()
    const startOfYear = new Date(today.getFullYear(), 0, 0)
    const diff = today.getTime() - startOfYear.getTime()
    const todayDOY = Math.floor(diff / (1000 * 60 * 60 * 24))

    const recentContent = content?.filter(c =>
      c.day_of_year && c.day_of_year >= todayDOY - 30 && c.day_of_year <= todayDOY
    ) || []

    const recentDistribution: Record<string, number> = {}
    recentContent.forEach(item => {
      const tags = item.tags as string[] || []
      tags.forEach(tag => {
        const matchedCategory = PRIMARY_CATEGORIES.find(
          cat => cat.toLowerCase() === tag.toLowerCase()
        )
        if (matchedCategory) {
          recentDistribution[matchedCategory] = (recentDistribution[matchedCategory] || 0) + 1
        }
      })
    })

    return NextResponse.json({
      success: true,
      totalContent: content?.length || 0,
      totalTags,
      categories,
      recommendations,
      recentDistribution,
      summary: {
        balanced: categories.filter(c => c.status === 'balanced').length,
        over: categories.filter(c => c.status === 'over').length,
        under: categories.filter(c => c.status === 'under').length,
        totalCategories: categories.length
      }
    })

  } catch (error) {
    console.error('Category balance error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch category balance' },
      { status: 500 }
    )
  }
}
