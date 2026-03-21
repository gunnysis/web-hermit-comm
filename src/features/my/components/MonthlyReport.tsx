'use client'

import { useState } from 'react'
import { useMonthlyReport } from '../hooks/useMonthlyReport'
import { EMOTION_EMOJI, ACTIVITY_PRESETS } from '@/lib/constants.generated'
import { getActivityLabel } from '@/lib/utils.generated'
import { Skeleton } from '@/components/ui/skeleton'

const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

function getCurrentKST() {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return { year: kst.getUTCFullYear(), month: kst.getUTCMonth() + 1 }
}

export function MonthlyReport({ enabled = true }: { enabled?: boolean }) {
  const current = getCurrentKST()
  const [year, setYear] = useState(current.year)
  const [month, setMonth] = useState(current.month)
  const { data, isLoading } = useMonthlyReport(year, month, enabled)

  const goToPrev = () => {
    if (month === 1) { setYear(year - 1); setMonth(12) }
    else setMonth(month - 1)
  }
  const goToNext = () => {
    if (year === current.year && month === current.month) return
    if (month === 12) { setYear(year + 1); setMonth(1) }
    else setMonth(month + 1)
  }
  const isCurrentMonth = year === current.year && month === current.month

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-muted/30 p-4 mt-4">
        <Skeleton className="w-32 h-5 mb-3" />
        <Skeleton className="w-full h-16 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">📊 {year}년 {MONTH_NAMES[month - 1]} 회고</p>
        <div className="flex gap-2">
          <button onClick={goToPrev} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground" aria-label="이전 달">◀</button>
          {!isCurrentMonth && (
            <button onClick={goToNext} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground" aria-label="다음 달">▶</button>
          )}
        </div>
      </div>

      {!data || data.days_logged === 0 ? (
        <p className="text-xs text-muted-foreground">이 달에는 기록이 없어요</p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-3">
            {data.days_in_month}일 중 {data.days_logged}일 기록
            {data.total_reactions > 0 ? ` · ❤️ ${data.total_reactions}` : ''}
            {data.total_comments > 0 ? ` · 💬 ${data.total_comments}` : ''}
          </p>

          {data.top_emotions.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground mb-1.5">많이 느낀 감정</p>
              <div className="flex flex-wrap gap-1.5">
                {data.top_emotions.map((item) => (
                  <span key={item.emotion} className="rounded-full px-2.5 py-1 bg-muted text-xs">
                    {EMOTION_EMOJI[item.emotion] ?? '💭'} {item.emotion}{' '}
                    <span className="text-muted-foreground">{item.count}회</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.top_activities.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">많이 한 활동</p>
              <div className="flex flex-wrap gap-1.5">
                {data.top_activities.map((item) => (
                  <span key={item.activity} className="rounded-full px-2.5 py-1 bg-muted text-xs">
                    {getActivityLabel(item.activity, ACTIVITY_PRESETS)}{' '}
                    <span className="text-muted-foreground">{item.count}회</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
