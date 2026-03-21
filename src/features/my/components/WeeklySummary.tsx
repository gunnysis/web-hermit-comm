'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getWeeklyEmotionSummary } from '../api/myApi'
import { EMOTION_EMOJI, ACTIVITY_PRESETS } from '@/lib/constants'
import { getActivityLabel } from '@/lib/utils.generated'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface WeeklySummaryProps {
  enabled?: boolean
}

export function WeeklySummary({ enabled = true }: WeeklySummaryProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  const { data, isLoading } = useQuery({
    queryKey: ['weeklySummary', weekOffset],
    queryFn: () => getWeeklyEmotionSummary(weekOffset),
    enabled,
    staleTime: 30 * 60 * 1000,
  })

  const weekLabel = weekOffset === 0 ? '이번 주' : weekOffset === 1 ? '지난주' : `${weekOffset}주 전`

  // 로딩 스켈레톤
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-4 w-20" />
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-14 rounded-full" />
        </div>
      </div>
    )
  }

  if (!data) return null

  // 빈 상태 (days_logged === 0)
  if (!data.days_logged || data.days_logged === 0) {
    return (
      <div className="rounded-2xl border border-border/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">📅 {weekLabel} 감정 회고</h3>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-1 rounded hover:bg-muted transition-colors" aria-label="이전 주">
              <ChevronLeft size={14} />
            </button>
            {weekOffset > 0 && (
              <button onClick={() => setWeekOffset(weekOffset - 1)} className="p-1 rounded hover:bg-muted transition-colors" aria-label="다음 주">
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{weekLabel}에는 기록이 없어요</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/60 p-4 space-y-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">📅 {weekLabel} 감정 회고</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="p-1 rounded hover:bg-muted transition-colors"
            aria-label="이전 주"
          >
            <ChevronLeft size={14} />
          </button>
          {weekOffset > 0 && (
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-1 rounded hover:bg-muted transition-colors"
              aria-label="다음 주"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 기록일 */}
      <p className="text-xs text-muted-foreground">7일 중 {data.days_logged}일 기록</p>

      {/* Top 감정 */}
      {data.top_emotions && data.top_emotions.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">많이 느낀 감정</p>
          <div className="flex flex-wrap gap-1.5">
            {data.top_emotions.slice(0, 5).map((item) => (
              <span
                key={item.emotion}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-muted text-xs"
              >
                {EMOTION_EMOJI[item.emotion] ?? '💭'} {item.emotion}
                <span className="text-muted-foreground">{item.count}회</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top 활동 */}
      {data.top_activity && (
        <p className="text-xs text-muted-foreground">
          가장 많이 한 활동: {getActivityLabel(data.top_activity, ACTIVITY_PRESETS)}
        </p>
      )}
    </div>
  )
}
