import { createClient } from '@/utils/supabase/client'
import { logger } from '@/lib/logger'
import type { EmotionTimelineEntry } from '@/types/database'

export interface ActivitySummary {
  post_count: number
  comment_count: number
  reaction_count: number
  streak: number
}

export async function getActivitySummary(): Promise<ActivitySummary> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_my_activity_summary')
  if (error) {
    logger.error('[API] getActivitySummary 에러:', error.message, { code: error.code })
    throw error
  }
  return data as unknown as ActivitySummary
}

export async function getEmotionTimeline(days = 7): Promise<EmotionTimelineEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_emotion_timeline', { p_days: days })
  if (error) {
    logger.error('[API] getEmotionTimeline 에러:', error.message, { code: error.code })
    throw error
  }
  return (data ?? []) as EmotionTimelineEntry[]
}

export async function getMyAlias(): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_my_alias')
  if (error) {
    logger.error('[API] getMyAlias 에러:', error.message, { code: error.code })
    return null
  }
  return data as string | null
}
