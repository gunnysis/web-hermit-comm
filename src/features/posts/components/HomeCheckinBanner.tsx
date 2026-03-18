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

  // 사용자별 dismiss 키 (공유 기기 대응)
  const dismissKey = user ? `daily_banner_dismissed_${user.id}` : 'daily_banner_dismissed'

  useEffect(() => {
    if (!user) return
    const stored = localStorage.getItem(dismissKey)
    if (stored === new Date().toISOString().slice(0, 10)) setDismissed(true)
  }, [user, dismissKey])

  // 배너 dismiss 후 직접 daily 작성한 경우 → dismiss 해제하여 "완료" 상태 표시
  useEffect(() => {
    if (todayDaily && dismissed) {
      localStorage.removeItem(dismissKey)
      setDismissed(false)
    }
  }, [todayDaily, dismissed, dismissKey])

  if (!user || dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem(dismissKey, new Date().toISOString().slice(0, 10))
  }

  if (todayDaily) {
    const emotions = todayDaily.emotions ?? todayDaily.initial_emotions ?? []
    const likeCount = todayDaily.like_count ?? 0
    const commentCount = (todayDaily as unknown as { comment_count?: number }).comment_count ?? 0
    const hasReactions = likeCount > 0 || commentCount > 0
    return (
      <div
        className="rounded-xl px-4 py-3 mb-4 space-y-1.5 transition-colors hover:opacity-90"
        style={{
          backgroundColor: `var(--daily-bg, ${SHARED_PALETTE.cream[50]})`,
          border: `1px solid var(--daily-border, ${SHARED_PALETTE.cream[200]})`,
        }}
        aria-label={`오늘의 하루 - 좋아요 ${likeCount}개, 댓글 ${commentCount}개`}
      >
        <div className="flex items-center justify-between">
          <Link href={`/post/${todayDaily.id}`} className="flex-1 min-w-0">
            <span className="text-xs text-muted-foreground truncate">
              오늘의 하루: {emotions.map((e: string) => `${EMOTION_EMOJI[e] ?? ''} ${e}`).join(' ')}
            </span>
          </Link>
          <Link
            href={`/create?type=daily&edit=${todayDaily.id}`}
            className="text-xs text-muted-foreground hover:text-foreground shrink-0 ml-2"
          >
            수정
          </Link>
        </div>
        {hasReactions && (
          <div className="flex items-center gap-3">
            {likeCount > 0 && (
              <span className="text-xs text-muted-foreground">❤️ {likeCount}명이 공감</span>
            )}
            {commentCount > 0 && (
              <span className="text-xs text-muted-foreground">💬 {commentCount}개 댓글</span>
            )}
          </div>
        )}
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
