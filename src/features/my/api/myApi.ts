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

export interface DailyHistoryItem {
  id: number
  emotions: string[] | null
  activities: string[] | null
  content: string | null
  created_date_kst: string
  created_at: string
  like_count: number
  comment_count: number
}

export async function getDailyHistory(limit = 20, offset = 0): Promise<DailyHistoryItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_my_daily_history', { p_limit: limit, p_offset: offset })
  if (error) {
    logger.error('[API] getDailyHistory 에러:', error.message, { code: error.code })
    throw error
  }
  return (data ?? []) as unknown as DailyHistoryItem[]
}

export interface MonthlyEmotionReport {
  year: number
  month: number
  days_in_month: number
  days_logged: number
  top_emotions: { emotion: string; count: number }[]
  top_activities: { activity: string; count: number }[]
  total_reactions: number
  total_comments: number
}

export async function getMonthlyEmotionReport(year: number, month: number): Promise<MonthlyEmotionReport> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_monthly_emotion_report', { p_year: year, p_month: month })
  if (error) {
    logger.error('[API] getMonthlyEmotionReport 에러:', error.message, { code: error.code })
    throw error
  }
  return data as unknown as MonthlyEmotionReport
}

export interface WeeklyEmotionSummary {
  week_start: string
  week_end: string
  days_logged: number
  top_emotions: { emotion: string; count: number }[] | null
  top_activity: string | null
}

export async function getWeeklyEmotionSummary(weekOffset = 0): Promise<WeeklyEmotionSummary | null> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_weekly_emotion_summary', { p_week_offset: weekOffset })
  if (error) {
    logger.error('[API] getWeeklyEmotionSummary 에러:', error.message, { code: error.code })
    throw error
  }
  return data as unknown as WeeklyEmotionSummary | null
}

export async function getMyAlias(): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_my_alias')
  if (error) {
    logger.error('[API] getMyAlias 에러:', error.message, { code: error.code })
    throw error
  }
  return data as string | null
}
