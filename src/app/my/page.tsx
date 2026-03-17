'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { useActivitySummary } from '@/features/my/hooks/useActivitySummary'
import { ProfileSection } from '@/features/my/components/ProfileSection'
import { DailyInsights } from '@/features/my/components/DailyInsights'
import { BlockedUsersSection } from '@/features/my/components/BlockedUsersSection'
import { EmotionCalendar } from '@/features/posts/components/EmotionCalendar'
import { EmotionWave } from '@/features/posts/components/EmotionWave'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export default function MySpacePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthContext()

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [authLoading, user, router])

  const { data: summary, isLoading } = useActivitySummary(!!user)

  if (authLoading || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* 프로필 히어로 */}
      <section className="animate-fade-in">
        <ProfileSection user={user} />
      </section>

      {/* 활동 요약 — 3 cards (streak moved to hero) */}
      <section className="animate-slide-up" style={{ animationDelay: '50ms', animationFillMode: 'backwards' }}>
        <h2 className="text-sm font-semibold mb-2 text-muted-foreground">활동</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '작성한 글', value: summary?.post_count ?? 0, emoji: '📝' },
            { label: '작성한 댓글', value: summary?.comment_count ?? 0, emoji: '💬' },
            { label: '보낸 반응', value: summary?.reaction_count ?? 0, emoji: '💛' },
          ].map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="pt-3 pb-2 text-center">
                {isLoading ? (
                  <Skeleton className="h-7 w-10 mx-auto" />
                ) : (
                  <>
                    <p className="text-lg font-bold">{stat.emoji} {stat.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 나의 패턴 */}
      <section className="animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}>
        <DailyInsights enabled={!!user} />
      </section>

      <Separator />

      {/* 감정 캘린더 */}
      <section className="animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'backwards' }}>
        <EmotionCalendar userId={user.id} />
      </section>

      <Separator />

      {/* 커뮤니티 감정 타임라인 */}
      <section className="animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
        <EmotionWave />
      </section>

      <Separator />

      {/* 설정 */}
      <section className="animate-slide-up" style={{ animationDelay: '250ms', animationFillMode: 'backwards' }}>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground">설정</h2>
        <BlockedUsersSection enabled={!!user} />
      </section>
    </div>
  )
}
