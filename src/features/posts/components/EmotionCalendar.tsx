'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { EMOTION_COLOR_MAP, EMOTION_EMOJI } from '@/lib/constants'
import type { EmotionCalendarDay } from '@/types/database'

async function getUserEmotionCalendar(userId: string, days = 30): Promise<EmotionCalendarDay[]> {
  const supabase = createClient()
  const start = new Date()
  start.setDate(start.getDate() - days)
  const { data, error } = await supabase.rpc('get_user_emotion_calendar', {
    p_user_id: userId,
    p_start: start.toISOString().slice(0, 10),
    p_end: new Date().toISOString().slice(0, 10),
  })
  if (error) throw error
  return (data ?? []) as EmotionCalendarDay[]
}

interface EmotionCalendarProps {
  userId: string
  days?: number
}

export function EmotionCalendar({ userId, days = 30 }: EmotionCalendarProps) {
  const { data: calendarData = [] } = useQuery({
    queryKey: ['emotionCalendar', userId, days],
    queryFn: () => getUserEmotionCalendar(userId, days),
    staleTime: 5 * 60 * 1000,
  })

  const weeks = useMemo(() => {
    if (!calendarData.length) return []
    const result: EmotionCalendarDay[][] = []
    let week: EmotionCalendarDay[] = []
    for (const day of calendarData) {
      const dow = new Date(day.day).getDay()
      if (dow === 0 && week.length > 0) {
        result.push(week)
        week = []
      }
      week.push(day)
    }
    if (week.length > 0) result.push(week)
    return result
  }, [calendarData])

  if (!weeks.length) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">감정 캘린더</h3>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => {
              const primaryEmotion = day.emotions?.[0]
              const colors = primaryEmotion ? EMOTION_COLOR_MAP[primaryEmotion] : null
              const bg = colors ? colors.gradient[0] : undefined
              const label = `${day.day} — ${day.post_count}개 글${
                day.emotions?.length > 0
                  ? ` (${day.emotions.map((e: string) => `${EMOTION_EMOJI[e] ?? ''} ${e}`).join(', ')})`
                  : ''
              }`
              return (
                <div
                  key={day.day}
                  role="img"
                  aria-label={label}
                  className={`w-4 h-4 rounded-sm transition-colors group relative cursor-default ${
                    day.post_count === 0 ? 'bg-muted' : ''
                  }`}
                  style={bg ? { backgroundColor: bg } : undefined}
                  title={label}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
