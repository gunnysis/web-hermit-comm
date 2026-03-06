'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getEmotionTrend } from '../api/postsApi'
import { EMOTION_EMOJI, EMOTION_COLOR_MAP } from '@/lib/constants'
import type { EmotionTrend } from '@/types/database'

interface CommunityPulseProps {
  onEmotionSelect?: (emotion: string) => void
  selectedEmotion?: string | null
}

export function CommunityPulse({ onEmotionSelect, selectedEmotion }: CommunityPulseProps) {
  const { data: trends = [] } = useQuery<EmotionTrend[]>({
    queryKey: ['emotionTrend', 7],
    queryFn: () => getEmotionTrend(7),
    staleTime: 5 * 60 * 1000,
  })

  const bubbles = useMemo(() => {
    if (!trends.length) return []
    const maxPct = Math.max(...trends.map((t) => t.pct ?? 0))
    return trends.slice(0, 5).map((t) => {
      const pct = t.pct ?? 0
      const size = Math.max(32, Math.min(56, (pct / (maxPct || 1)) * 56))
      const colors = EMOTION_COLOR_MAP[t.emotion]
      return { ...t, size, colors }
    })
  }, [trends])

  if (!bubbles.length) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground">커뮤니티 감정</h3>
      <div className="flex flex-wrap gap-2 items-end">
        {bubbles.map((b) => (
          <button
            key={b.emotion}
            onClick={() => onEmotionSelect?.(b.emotion)}
            className={`group relative flex flex-col items-center transition-transform hover:scale-110 ${
              selectedEmotion === b.emotion ? 'scale-110' : ''
            }`}
            title={`${b.emotion} ${b.pct ?? 0}%`}
          >
            <div
              className={`rounded-full flex items-center justify-center transition-all duration-300 ${
                selectedEmotion === b.emotion ? 'ring-2 ring-offset-2 ring-foreground/20' : ''
              }`}
              style={{
                width: b.size,
                height: b.size,
                background: b.colors
                  ? `linear-gradient(135deg, ${b.colors.gradient[0]}, ${b.colors.gradient[1]})`
                  : undefined,
              }}
            >
              <span className="text-sm">{EMOTION_EMOJI[b.emotion] ?? '💬'}</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {b.emotion}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
