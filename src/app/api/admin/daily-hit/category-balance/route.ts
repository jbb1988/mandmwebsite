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

// GET - Fetch category balance analytics
export async function GET() {
  try {
    // 1. Get total published content count
    const { count: totalCount } = await supabase
      .from('motivation_content')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // 2. Get content distribution by category from topic library
    // Join through drafts to get source topic category
    const { data: categoryData, error: categoryError } = await supabase
      .from('daily_hit_topic_library')
      .select(`
        category,
        id,
        daily_hit_drafts!inner (
          day_of_year,
          status
        )
      `)
      .not('daily_hit_drafts', 'is', null)

    if (categoryError) throw categoryError

    // Count by category
    const categoryCounts: Record<string, { count: number; lastDay: number | null }> = {}
    const allCategories = new Set<string>()

    // First, get all unique categories from topic library
    const { data: allTopicsData } = await supabase
      .from('daily_hit_topic_library')
      .select('category')
      .order('category')

    allTopicsData?.forEach(t => allCategories.add(t.category))

    // Count drafts per category
    categoryData?.forEach(topic => {
      const cat = topic.category
      if (!categoryCounts[cat]) {
        categoryCounts[cat] = { count: 0, lastDay: null }
      }
      const drafts = topic.daily_hit_drafts as any[]
      if (drafts) {
        categoryCounts[cat].count += drafts.length
        drafts.forEach(d => {
          if (d.day_of_year && (!categoryCounts[cat].lastDay || d.day_of_year > categoryCounts[cat].lastDay)) {
            categoryCounts[cat].lastDay = d.day_of_year
          }
        })
      }
    })

    // 3. Calculate stats for each category
    const total = Object.values(categoryCounts).reduce((sum, c) => sum + c.count, 0) || 1
    const numCategories = allCategories.size || 1
    const targetPercentage = Math.round(100 / numCategories)

    const categories: CategoryStats[] = []

    allCategories.forEach(categoryName => {
      const data = categoryCounts[categoryName] || { count: 0, lastDay: null }
      const percentage = Math.round((data.count / total) * 100)

      let status: 'balanced' | 'over' | 'under' = 'balanced'
      if (percentage > targetPercentage + 5) status = 'over'
      else if (percentage < targetPercentage - 5) status = 'under'

      categories.push({
        name: categoryName,
        count: data.count,
        percentage,
        target: targetPercentage,
        status,
        lastUsed: data.lastDay ? `Day ${data.lastDay}` : null
      })
    })

    // Sort by percentage (under-represented first)
    categories.sort((a, b) => a.percentage - b.percentage)

    // 4. Generate recommendations for under-represented categories
    const recommendations: CategoryRecommendation[] = []

    const underCategories = categories.filter(c => c.status === 'under')

    for (const cat of underCategories.slice(0, 3)) {
      // Get available topics from this category
      const { data: topics } = await supabase
        .from('daily_hit_topic_library')
        .select('id, title, use_count')
        .eq('category', cat.name)
        .eq('status', 'available')
        .order('use_count', { ascending: true, nullsFirst: true })
        .limit(3)

      recommendations.push({
        category: cat.name,
        reason: `Under-represented by ${cat.target - cat.percentage}%`,
        suggestedTopics: (topics || []).map(t => ({ id: t.id, title: t.title }))
      })
    }

    // 5. Get upcoming 30 days distribution
    const today = new Date()
    const startOfYear = new Date(today.getFullYear(), 0, 0)
    const diff = today.getTime() - startOfYear.getTime()
    const todayDOY = Math.floor(diff / (1000 * 60 * 60 * 24))

    const { data: upcomingDrafts } = await supabase
      .from('daily_hit_drafts')
      .select(`
        day_of_year,
        source_topic_id,
        daily_hit_topic_library!inner (category)
      `)
      .gte('day_of_year', todayDOY)
      .lte('day_of_year', todayDOY + 30)

    const upcomingDistribution: Record<string, number> = {}
    upcomingDrafts?.forEach(d => {
      const topic = d.daily_hit_topic_library as any
      if (topic?.category) {
        upcomingDistribution[topic.category] = (upcomingDistribution[topic.category] || 0) + 1
      }
    })

    return NextResponse.json({
      success: true,
      totalContent: totalCount || 0,
      categories,
      recommendations,
      upcomingDistribution,
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
