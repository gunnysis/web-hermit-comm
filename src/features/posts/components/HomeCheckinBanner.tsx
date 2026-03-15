'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTodayDaily } from '@/features/my/hooks/useTodayDaily'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { EMOTION_EMOJI, SHARED_PALETTE } from '@/lib/constants'

export function HomeCheckinBanner() {
  const { user } = useAuthContext()
  const { data: todayDaily } = useTodayDaily(!!user)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const key = 'daily_banner_dismissed'
    const stored = localStorage.getItem(key)
    if (stored === new Date().toISOString().slice(0, 10)) setDismissed(true)
  }, [])

  if (!user || dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('daily_banner_dismissed', new Date().toISOString().slice(0, 10))
  }

  if (todayDaily) {
    const emotions = todayDaily.emotions ?? (todayDaily as any).initial_emotions ?? []
    const likeCount = (todayDaily as any).like_count ?? 0
    return (
      <div
        className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between transition-colors hover:opacity-90"
        style={{
          backgroundColor: `var(--daily-bg, ${SHARED_PALETTE.cream[50]})`,
          border: `1px solid var(--daily-border, ${SHARED_PALETTE.cream[200]})`,
        }}
      >
        <Link href={`/post/${todayDaily.id}`} className="flex-1 min-w-0">
          <span className="text-xs text-muted-foreground">
            오늘의 하루: {emotions.map((e: string) => `${EMOTION_EMOJI[e] ?? ''} ${e}`).join(' ')}
          </span>
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          {likeCount > 0 && (
            <span className="text-xs text-muted-foreground">{likeCount}명이 공감</span>
          )}
          <Link
            href={`/create?type=daily&edit=${todayDaily.id}`}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            수정
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between"
      style={{
        backgroundColor: `var(--daily-bg, ${SHARED_PALETTE.cream[50]})`,
        border: `1px solid var(--daily-border, ${SHARED_PALETTE.cream[200]})`,
      }}
    >
      <span className="text-xs text-muted-foreground">오늘은 어떤 하루예요?</span>
      <div className="flex items-center gap-2">
        <Link
          href="/create?type=daily"
          className="rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ backgroundColor: SHARED_PALETTE.happy[500], color: '#1c1917' }}
        >
          나눠볼까요?
        </Link>
        <button
          onClick={handleDismiss}
          className="text-xs text-muted-foreground hover:text-foreground"
          aria-label="오늘의 하루 배너 닫기"
        >
          괜찮아요
        </button>
      </div>
    </div>
  )
}
