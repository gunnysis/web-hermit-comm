'use client'

import { memo } from 'react'
import Link from 'next/link'
import { EMOTION_COLOR_MAP, EMOTION_EMOJI, ACTIVITY_PRESETS, SHARED_PALETTE } from '@/lib/constants'
import type { PostWithCounts } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface DailyPostCardProps {
  post: PostWithCounts
}

function DailyPostCardInner({ post }: DailyPostCardProps) {
  const emotions = post.emotions ?? post.initial_emotions ?? []
  const activities = (post as any).activities ?? []
  const content = post.content || ''

  const getActivityLabel = (id: string) => {
    const preset = ACTIVITY_PRESETS.find((p) => p.id === id)
    return preset ? `${preset.icon} ${preset.name}` : id
  }

  return (
    <Link href={`/post/${post.id}`}>
      <div
        className="rounded-2xl px-4 py-3 mb-3 transition-colors hover:opacity-90"
        style={{
          backgroundColor: `var(--daily-bg, ${SHARED_PALETTE.cream[50]})`,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: `var(--daily-border, ${SHARED_PALETTE.cream[200]})`,
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">오늘의 하루</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}
          </span>
        </div>

        {/* 감정 칩 */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {emotions.map((emotion) => {
            const colors = EMOTION_COLOR_MAP[emotion]
            return (
              <span
                key={emotion}
                className="rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{ backgroundColor: colors?.gradient[0] ?? '#E7D7FF' }}
              >
                {EMOTION_EMOJI[emotion]} {emotion}
              </span>
            )
          })}
        </div>

        {/* 활동 태그 */}
        {activities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {activities.map((act: string) => (
              <span key={act} className="rounded-full px-2.5 py-1 text-xs border border-border text-muted-foreground">
                {getActivityLabel(act)}
              </span>
            ))}
          </div>
        )}

        {/* 한마디 */}
        {content.length > 0 && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">&ldquo;{content}&rdquo;</p>
        )}

        {/* 리액션 */}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground">{post.like_count}</span>
          <span className="text-xs text-muted-foreground">{post.comment_count}</span>
        </div>
      </div>
    </Link>
  )
}

export const DailyPostCard = memo(DailyPostCardInner, (prev, next) =>
  prev.post.id === next.post.id &&
  prev.post.like_count === next.post.like_count &&
  prev.post.comment_count === next.post.comment_count
)
