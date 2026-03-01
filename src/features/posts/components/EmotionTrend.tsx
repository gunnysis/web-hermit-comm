'use client'

import { useEmotionTrend } from '../hooks/useEmotionTrend'
import { EMOTION_EMOJI } from '@/lib/constants'
import { Skeleton } from '@/components/ui/skeleton'

export function EmotionTrend() {
  const { data, isLoading } = useEmotionTrend()

  if (isLoading) {
    return (
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-7 w-20" />
        </div>
      </div>
    )
  }

  const top = data?.slice(0, 3) ?? []
  if (!top.length) return null

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground font-medium">요즘 마을 분위기</p>
      <div className="flex flex-wrap gap-2">
        {top.map((item: { emotion: string; cnt: number }) => (
          <span
            key={item.emotion}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-sm"
          >
            <span>{EMOTION_EMOJI[item.emotion] ?? '💬'}</span>
            <span>{item.emotion}</span>
            <span className="text-xs text-muted-foreground">({item.cnt})</span>
          </span>
        ))}
      </div>
    </div>
  )
}
