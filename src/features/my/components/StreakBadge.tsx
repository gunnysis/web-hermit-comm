'use client'

import { useQuery } from '@tanstack/react-query'
import { getMyStreak } from '../api/myApi'

const MILESTONES = [
  { days: 7, emoji: '🌱', label: '새싹' },
  { days: 14, emoji: '🌿', label: '잎사귀' },
  { days: 30, emoji: '🌳', label: '나무' },
  { days: 50, emoji: '🌲', label: '큰 나무' },
  { days: 100, emoji: '🏔️', label: '산' },
]

interface StreakBadgeProps {
  enabled?: boolean
}

export function StreakBadge({ enabled = true }: StreakBadgeProps) {
  const { data } = useQuery({
    queryKey: ['myStreak'],
    queryFn: getMyStreak,
    enabled,
    staleTime: 60 * 1000,
  })

  if (!data) return null

  const currentMilestone = MILESTONES.filter((m) => data.current_streak >= m.days).pop()
  const nextMilestone = MILESTONES.find((m) => data.current_streak < m.days)

  return (
    <div className="rounded-2xl border border-border/60 p-3 space-y-2">
      {/* 메인 스트릭 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentMilestone?.emoji ?? '✨'}</span>
          <div>
            <p className="text-sm font-bold">
              {data.current_streak > 0
                ? `${data.current_streak}일 연속 기록`
                : data.completed_today
                  ? '오늘 기록 완료'
                  : '오늘 하루를 나눠보세요'}
            </p>
            <p className="text-xs text-muted-foreground">총 {data.total_days}일 기록</p>
          </div>
        </div>
        {data.completed_today && (
          <span className="text-xs text-happy-600 font-medium">✓ 완료</span>
        )}
      </div>

      {/* 다음 마일스톤 진행률 */}
      {nextMilestone && data.current_streak > 0 && (
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">
              다음: {nextMilestone.emoji} {nextMilestone.label} ({nextMilestone.days}일)
            </span>
            <span className="text-[10px] text-muted-foreground">
              {data.current_streak}/{nextMilestone.days}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-happy-400 transition-all duration-500"
              style={{ width: `${Math.min((data.current_streak / nextMilestone.days) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* 마일스톤 달성 */}
      {data.new_milestone > 0 && (
        <div className="pt-2 border-t text-center">
          <span className="text-xs font-medium text-happy-700 dark:text-happy-300">
            🎉 {data.new_milestone}일 연속 달성!
          </span>
        </div>
      )}
    </div>
  )
}
