'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMyAlias } from '../hooks/useMyAlias'
import { useActivitySummary } from '../hooks/useActivitySummary'
import { useTodayDaily } from '../hooks/useTodayDaily'
import { signOut } from '@/features/auth/auth'
import { EMOTION_EMOJI, EMOTION_COLOR_MAP } from '@/lib/constants'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'

function getDaysSince(dateStr: string): number {
  const created = new Date(dateStr)
  const now = new Date()
  return Math.max(1, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
}

export function ProfileSection({ user }: { user: User }) {
  const router = useRouter()
  const { data: alias, isLoading: aliasLoading } = useMyAlias(true)
  const { data: summary, isLoading: summaryLoading } = useActivitySummary(true)
  const { data: todayDaily } = useTodayDaily(true)

  const daysSince = useMemo(() => getDaysSince(user.created_at), [user.created_at])
  const streak = summary?.streak ?? 0

  const todayEmotions: string[] = useMemo(() => {
    if (!todayDaily) return []
    return Array.isArray(todayDaily.emotions) ? todayDaily.emotions : []
  }, [todayDaily])

  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    const confirmed = window.confirm(
      '⚠️ 로그아웃 확인\n\n익명 사용자가 로그아웃하면 새로운 계정이 생성되어 기존 글을 수정/삭제할 수 없게 됩니다.\n\n정말 로그아웃하시겠습니까?'
    )
    if (!confirmed) return
    setSigningOut(true)
    try {
      await signOut()
      router.push('/')
    } catch {
      toast.error('로그아웃에 실패했어요')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-cream-50 to-happy-50 dark:from-card dark:to-card border p-5 space-y-4">
      {/* Alias + Member Since */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-muted flex items-center justify-center text-xl shadow-sm">
            {aliasLoading ? <Skeleton className="w-12 h-12 rounded-full" /> : '🙂'}
          </div>
          <div>
            {aliasLoading ? (
              <Skeleton className="h-5 w-28" />
            ) : (
              <p className="text-base font-bold">{alias ?? '익명'}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              함께한 지 {daysSince}일째
            </p>
          </div>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 disabled:opacity-50"
          >
            {signingOut ? '로그아웃 중...' : '🔧 로그아웃 (개발용)'}
          </button>
        )}
      </div>

      {/* Streak + Today's Emotion */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Streak Badge */}
        {summaryLoading ? (
          <Skeleton className="h-7 w-28 rounded-full" />
        ) : streak > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 dark:bg-muted px-3 py-1 text-xs font-medium shadow-sm">
            🔥 연속 {streak}일 기록 중
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 dark:bg-muted px-3 py-1 text-xs text-muted-foreground">
            오늘 하루를 나눠보세요
          </span>
        )}

        {/* Today's Emotions */}
        {todayEmotions.length > 0 && (
          <div className="flex items-center gap-1">
            {todayEmotions.map((emotion) => {
              const color = EMOTION_COLOR_MAP[emotion]
              return (
                <span
                  key={emotion}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{ backgroundColor: color?.gradient[0] ?? '#f5f5f4' }}
                  title={emotion}
                >
                  {EMOTION_EMOJI[emotion]} {emotion}
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
