'use client'

import { useDailyInsights } from '../hooks/useDailyInsights'
import { Skeleton } from '@/components/ui/skeleton'
import { ACTIVITY_PRESETS, EMOTION_EMOJI, EMOTION_COLOR_MAP, DAILY_INSIGHTS_CONFIG } from '@/lib/constants'
import { getActivityLabel } from '@/lib/utils.generated'

export function DailyInsights({ enabled = true }: { enabled?: boolean }) {
  const { data, isLoading } = useDailyInsights(30, enabled)

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">나의 패턴</h3>
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    )
  }

  if (!data) return null

  const { total_dailies, activity_emotion_map } = data

  if (total_dailies < DAILY_INSIGHTS_CONFIG.MIN_DAILIES_FOR_INSIGHTS) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">나의 패턴</h3>
        <div className="rounded-xl px-4 py-4 bg-muted">
          <p className="text-sm text-muted-foreground">
            💡 {total_dailies > 0 ? `${total_dailies}일째 기록하고 있어요!` : '패턴을 발견하려면 기록이 필요해요'}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {DAILY_INSIGHTS_CONFIG.MIN_DAILIES_FOR_INSIGHTS - total_dailies}일만 더 나누면 나만의 패턴이 보여요
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-muted-foreground/10" role="progressbar" aria-valuenow={total_dailies} aria-valuemax={DAILY_INSIGHTS_CONFIG.MIN_DAILIES_FOR_INSIGHTS} aria-label={`패턴 수집 진행률 ${total_dailies}/${DAILY_INSIGHTS_CONFIG.MIN_DAILIES_FOR_INSIGHTS}일`}>
            <div
              className="h-1.5 rounded-full bg-happy-400"
              style={{ width: `${Math.min((total_dailies / DAILY_INSIGHTS_CONFIG.MIN_DAILIES_FOR_INSIGHTS) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (!activity_emotion_map || activity_emotion_map.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">나의 패턴 (최근 30일)</h3>
        <div className="rounded-xl px-4 py-4 bg-muted">
          <p className="text-xs text-muted-foreground">
            활동 데이터를 모으는 중이에요. 오늘의 하루를 기록할 때 활동 태그를 선택하면 패턴이 보여요.
          </p>
        </div>
      </div>
    )
  }

  const topActivity = activity_emotion_map[0]
  const topEmotion = topActivity?.emotions?.[0]

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">나의 패턴 (최근 30일)</h3>

      {activity_emotion_map.map((item) => (
        <div key={item.activity} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">
              {getActivityLabel(item.activity, ACTIVITY_PRESETS)} ({item.count}회)
            </span>
          </div>
          <div className="h-5 rounded-full overflow-hidden flex bg-muted">
            {item.emotions.map((em) => {
              const colors = EMOTION_COLOR_MAP[em.emotion]
              return (
                <div
                  key={em.emotion}
                  className="h-full flex items-center justify-center"
                  style={{
                    width: `${em.pct}%`,
                    backgroundColor: colors?.gradient[0] ?? '#E7D7FF',
                  }}
                >
                  {em.pct >= 25 && (
                    <span className="text-[9px]">
                      {EMOTION_EMOJI[em.emotion]} {em.pct}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {topActivity && topEmotion && (
        <div className="rounded-xl px-3 py-2 bg-muted">
          <p className="text-xs text-muted-foreground">
            💡 {getActivityLabel(topActivity.activity, ACTIVITY_PRESETS).replace(/^[^\s]+ /, '')}한 날에{' '}
            {topEmotion.emotion}을 자주 느끼는 경향이 있어요.
          </p>
        </div>
      )}
    </div>
  )
}
