import { createClient } from '@/utils/supabase/client'
import { logger } from '@/lib/logger'
import type { EmotionTimelineEntry, ActivitySummary, EmotionCalendarDay } from '@/types/database'

export type { ActivitySummary }

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

export async function getUserEmotionCalendar(userId: string, days = 30): Promise<EmotionCalendarDay[]> {
  const supabase = createClient()
  const start = new Date()
  start.setDate(start.getDate() - days)
  const { data, error } = await supabase.rpc('get_user_emotion_calendar', {
    p_user_id: userId,
    p_start: start.toISOString().slice(0, 10),
    p_end: new Date().toISOString().slice(0, 10),
  })
  if (error) {
    logger.error('[API] getUserEmotionCalendar 에러:', error.message, { code: error.code })
    throw error
  }
  return (data ?? []) as EmotionCalendarDay[]
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
