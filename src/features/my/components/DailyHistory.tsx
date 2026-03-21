'use client'

import Link from 'next/link'
import { useDailyHistory } from '../hooks/useDailyHistory'
import { EMOTION_EMOJI } from '@/lib/constants.generated'
import { Skeleton } from '@/components/ui/skeleton'

export function DailyHistory({ enabled = true }: { enabled?: boolean }) {
  const { data: items = [], isLoading } = useDailyHistory(10, enabled)

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-muted/30 p-4 mt-4">
        <Skeleton className="w-28 h-5 mb-3" />
        <Skeleton className="w-full h-12 mb-2 rounded-xl" />
        <Skeleton className="w-full h-12 rounded-xl" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-muted/30 p-4 mt-4">
        <p className="text-sm font-semibold mb-2">📖 나의 기록</p>
        <p className="text-xs text-muted-foreground">오늘의 하루를 나누면 여기에 기록이 쌓여요</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4 mt-4">
      <p className="text-sm font-semibold mb-3">📖 나의 기록</p>

      <div className="space-y-1.5">
        {items.slice(0, 7).map((item) => (
          <Link key={item.id} href={`/post/${item.id}`}>
            <div className="rounded-xl px-3 py-2.5 bg-background hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{item.created_date_kst}</span>
                <div className="flex items-center gap-2">
                  {item.like_count > 0 && (
                    <span className="text-xs text-muted-foreground">❤️ {item.like_count}</span>
                  )}
                  {item.comment_count > 0 && (
                    <span className="text-xs text-muted-foreground">💬 {item.comment_count}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {(item.emotions ?? []).map((e) => (
                  <span key={e} className="text-xs">{EMOTION_EMOJI[e]} {e}</span>
                ))}
              </div>
              {item.content && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{item.content}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {items.length > 7 && (
        <p className="text-xs text-center text-muted-foreground mt-1">+{items.length - 7}개 더</p>
      )}
    </div>
  )
}
