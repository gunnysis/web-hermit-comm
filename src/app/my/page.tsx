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
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold">나의 공간</h1>

      {/* 프로필 */}
      <ProfileSection enabled={!!user} />

      {/* 활동 요약 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '작성한 글', value: summary?.post_count ?? 0, emoji: '📝' },
          { label: '작성한 댓글', value: summary?.comment_count ?? 0, emoji: '💬' },
          { label: '보낸 반응', value: summary?.reaction_count ?? 0, emoji: '💛' },
          { label: '연속 기록', value: `${summary?.streak ?? 0}일`, emoji: '🔥' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3 text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{stat.emoji} {stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 나의 패턴 */}
      <DailyInsights enabled={!!user} />

      <Separator />

      {/* 감정 캘린더 */}
      <EmotionCalendar userId={user.id} />

      <Separator />

      {/* 커뮤니티 감정 타임라인 */}
      <EmotionWave />

      <Separator />

      {/* 차단 관리 */}
      <BlockedUsersSection enabled={!!user} />
    </div>
  )
}
