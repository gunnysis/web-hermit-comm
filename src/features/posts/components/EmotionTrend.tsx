'use client'

import Link from 'next/link'
import { useEmotionTrend } from '../hooks/useEmotionTrend'
import { EMOTION_EMOJI } from '@/lib/constants'
import { Skeleton } from '@/components/ui/skeleton'
import { getEmotionClassName } from '@/lib/emotion-category'

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
        {top.map((item: { emotion: string; cnt: number; pct?: number }) => (
          <Link
            key={item.emotion}
            href={`/search?emotion=${encodeURIComponent(item.emotion)}`}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm hover:opacity-80 transition-opacity ${getEmotionClassName(item.emotion)}`}
          >
            <span>{EMOTION_EMOJI[item.emotion] ?? '💬'}</span>
            <span>{item.emotion}</span>
            <span className="text-xs text-muted-foreground">
              {item.pct != null ? `${item.pct}%` : `(${item.cnt})`}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
