'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { EMOTION_COLOR_MAP, EMOTION_EMOJI } from '@/lib/constants'
import { Skeleton } from '@/components/ui/skeleton'
import type { EmotionTimelineEntry } from '@/types/database'

async function getEmotionTimeline(days = 7): Promise<EmotionTimelineEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_emotion_timeline', { p_days: days })
  if (error) throw error
  return (data ?? []) as EmotionTimelineEntry[]
}

interface EmotionWaveProps {
  days?: number
}

export function EmotionWave({ days = 7 }: EmotionWaveProps) {
  const { data: timeline = [], isLoading } = useQuery({
    queryKey: ['emotionTimeline', days],
    queryFn: () => getEmotionTimeline(days),
    staleTime: 5 * 60 * 1000,
  })

  const { dayLabels, topEmotions, bars } = useMemo(() => {
    if (!timeline.length) return { dayLabels: [], topEmotions: new Set<string>(), bars: [] }

    const byDay = new Map<string, Map<string, number>>()
    for (const entry of timeline) {
      if (!byDay.has(entry.day)) byDay.set(entry.day, new Map())
      byDay.get(entry.day)!.set(entry.emotion, Number(entry.cnt))
    }

    const emotionTotals = new Map<string, number>()
    for (const dayMap of byDay.values()) {
      for (const [emotion, cnt] of dayMap) {
        emotionTotals.set(emotion, (emotionTotals.get(emotion) ?? 0) + cnt)
      }
    }

    const topEmotions = new Set(
      [...emotionTotals.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([e]) => e),
    )

    const dayLabels = [...byDay.keys()].sort()
    const bars = dayLabels.map((day) => {
      const dayMap = byDay.get(day)!
      const segments: { emotion: string; count: number }[] = []
      for (const emotion of topEmotions) {
        const count = dayMap.get(emotion) ?? 0
        if (count > 0) segments.push({ emotion, count })
      }
      const total = segments.reduce((s, seg) => s + seg.count, 0)
      return { day, segments, total }
    })

    return { dayLabels, topEmotions, bars }
  }, [timeline])

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">감정 타임라인</h3>
        <div className="flex items-end gap-1 h-24">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 rounded-t-sm" style={{ height: `${30 + Math.random() * 60}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (!bars.length) return null

  const maxTotal = Math.max(...bars.map((b) => b.total))

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">감정 타임라인</h3>
      <div className="flex items-end gap-1 h-24">
        {bars.map((bar) => (
          <div key={bar.day} className="flex-1 flex flex-col justify-end h-full">
            <div
              className="flex flex-col rounded-t-sm overflow-hidden"
              style={{ height: `${(bar.total / (maxTotal || 1)) * 100}%` }}
            >
              {bar.segments.map((seg) => {
                const colors = EMOTION_COLOR_MAP[seg.emotion]
                return (
                  <div
                    key={seg.emotion}
                    style={{
                      flex: seg.count,
                      backgroundColor: colors?.gradient[1] ?? '#E7D7FF',
                    }}
                  />
                )
              })}
            </div>
            <span className="text-[9px] text-muted-foreground text-center mt-1">
              {new Date(bar.day).getDate()}일
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {[...topEmotions].map((emotion) => {
          const colors = EMOTION_COLOR_MAP[emotion]
          return (
            <span key={emotion} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: colors?.gradient[1] ?? '#E7D7FF' }}
              />
              {EMOTION_EMOJI[emotion]} {emotion}
            </span>
          )
        })}
      </div>
    </div>
  )
}
