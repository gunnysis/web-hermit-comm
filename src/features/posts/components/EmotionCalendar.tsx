'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUserEmotionCalendar } from '@/features/my/api/myApi'
import { EMOTION_COLOR_MAP, EMOTION_EMOJI } from '@/lib/constants'
import { Skeleton } from '@/components/ui/skeleton'
import type { EmotionCalendarDay } from '@/types/database'

interface EmotionCalendarProps {
  userId: string
  days?: number
}

export function EmotionCalendar({ userId, days = 30 }: EmotionCalendarProps) {
  const { data: calendarData = [], isLoading } = useQuery({
    queryKey: ['emotionCalendar', userId, days],
    queryFn: () => getUserEmotionCalendar(userId, days),
    staleTime: 5 * 60 * 1000,
    meta: { silent: true },
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

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">감정 캘린더</h3>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton key={j} className="w-4 h-4 rounded-sm" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Collect unique emotions that appear in the calendar for legend
  const usedEmotions = useMemo(() => {
    const set = new Set<string>()
    for (const day of calendarData) {
      if (day.emotions?.length > 0) set.add(day.emotions[0])
    }
    return [...set]
  }, [calendarData])

  if (!weeks.length) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">감정 캘린더</h3>
        <span className="text-[10px] text-muted-foreground">최근 {days}일</span>
      </div>
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
      {/* Color Legend */}
      {usedEmotions.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {usedEmotions.map((emotion) => {
            const colors = EMOTION_COLOR_MAP[emotion]
            return (
              <span key={emotion} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block"
                  style={{ backgroundColor: colors?.gradient[0] ?? '#e5e5e5' }}
                />
                {EMOTION_EMOJI[emotion]} {emotion}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
