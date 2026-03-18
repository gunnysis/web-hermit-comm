'use client'

import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { getWeeklyEmotionSummary } from '@/features/posts/api/postsApi'
import { EMOTION_EMOJI, EMOTION_COLOR_MAP } from '@/lib/constants'

interface EmotionTrendChartProps {
  enabled?: boolean
}

export function EmotionTrendChart({ enabled = true }: EmotionTrendChartProps) {
  const weekQueries = useQueries({
    queries: [3, 2, 1, 0].map(offset => ({
      queryKey: ['weeklySummary', offset],
      queryFn: () => getWeeklyEmotionSummary(offset),
      enabled,
      staleTime: 30 * 60 * 1000,
      meta: { silent: true },
    })),
  })

  const weeks = useMemo(
    () => weekQueries.map(q => q.data).filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekQueries.map(q => q.data).join(',')]
  )

  const weekData = useMemo(() => weeks.map((w) => ({
    label: w!.days_logged > 0 ? `${w!.days_logged}일` : '-',
    topEmotion: w!.top_emotions?.[0]?.emotion ?? null,
    daysLogged: w!.days_logged ?? 0,
  })), [weeks])

  const maxDays = useMemo(() => Math.max(...weekData.map((w) => w.daysLogged), 1), [weekData])

  if (weeks.length < 2) return null

  return (
    <div className="rounded-2xl border border-border/60 p-4 space-y-3">
      <h3 className="text-sm font-semibold">📊 최근 4주 감정 흐름</h3>

      {/* 바 차트 */}
      <div className="flex items-end justify-between" style={{ height: 80 }}>
        {weekData.map((w, i) => {
          const height = w.daysLogged > 0 ? (w.daysLogged / maxDays) * 60 + 12 : 8
          const colors = w.topEmotion ? EMOTION_COLOR_MAP[w.topEmotion] : null
          const barColor = colors?.gradient[0] ?? 'var(--muted)'

          return (
            <div key={i} className="flex flex-col items-center flex-1">
              {w.topEmotion && (
                <span className="text-xs mb-1">{EMOTION_EMOJI[w.topEmotion]}</span>
              )}
              <div
                className="w-8 rounded-t-lg transition-all duration-500"
                style={{ height, backgroundColor: barColor }}
              />
              <span className="text-[10px] text-muted-foreground mt-1">
                {i === 3 ? '이번주' : `${3 - i}주전`}
              </span>
            </div>
          )
        })}
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-2 pt-2 border-t">
        {[...new Set(weekData.filter(w => w.topEmotion).map(w => w.topEmotion!))]
          .map((emotion) => (
            <span key={emotion} className="text-[10px] text-muted-foreground">
              {EMOTION_EMOJI[emotion]} {emotion}
            </span>
          ))}
      </div>
    </div>
  )
}
