'use client'

import { useQuery } from '@tanstack/react-query'
import { getWeeklyEmotionSummary } from '@/features/posts/api/postsApi'
import { EMOTION_EMOJI, EMOTION_COLOR_MAP } from '@/lib/constants'

interface EmotionTrendChartProps {
  enabled?: boolean
}

export function EmotionTrendChart({ enabled = true }: EmotionTrendChartProps) {
  const week0 = useQuery({
    queryKey: ['weeklySummary', 0],
    queryFn: () => getWeeklyEmotionSummary(0),
    enabled,
    staleTime: 30 * 60 * 1000,
  })
  const week1 = useQuery({
    queryKey: ['weeklySummary', 1],
    queryFn: () => getWeeklyEmotionSummary(1),
    enabled,
    staleTime: 30 * 60 * 1000,
  })
  const week2 = useQuery({
    queryKey: ['weeklySummary', 2],
    queryFn: () => getWeeklyEmotionSummary(2),
    enabled,
    staleTime: 30 * 60 * 1000,
  })
  const week3 = useQuery({
    queryKey: ['weeklySummary', 3],
    queryFn: () => getWeeklyEmotionSummary(3),
    enabled,
    staleTime: 30 * 60 * 1000,
  })

  const weeks = [week3.data, week2.data, week1.data, week0.data].filter(Boolean)
  if (weeks.length < 2) return null

  const weekData = weeks.map((w) => ({
    label: w!.days_logged > 0 ? `${w!.days_logged}일` : '-',
    topEmotion: w!.top_emotions?.[0]?.emotion ?? null,
    daysLogged: w!.days_logged ?? 0,
  }))

  const maxDays = Math.max(...weekData.map((w) => w.daysLogged), 1)

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
        {weekData
          .filter((w) => w.topEmotion)
          .reduce((acc, w) => {
            if (!acc.find((a) => a === w.topEmotion)) acc.push(w.topEmotion!)
            return acc
          }, [] as string[])
          .map((emotion) => (
            <span key={emotion} className="text-[10px] text-muted-foreground">
              {EMOTION_EMOJI[emotion]} {emotion}
            </span>
          ))}
      </div>
    </div>
  )
}
