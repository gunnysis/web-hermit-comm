'use client'

import { EMOTION_COLOR_MAP, EMOTION_EMOJI, ACTIVITY_PRESETS } from '@/lib/constants'
import { SameMoodDailies } from './SameMoodDailies'
import type { Post } from '@/types/database'

interface DailyDetailViewProps {
  post: Post
  analysis: { emotions: string[]; error_reason?: string | null } | null | undefined
  timeAgo: string
  similarCount: number | undefined
  postId: number
}

export function DailyDetailView({ post, analysis, timeAgo, similarCount, postId }: DailyDetailViewProps) {
  const emotions = analysis?.emotions ?? post.initial_emotions ?? []

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">🌤️ 오늘의 하루</span>
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {emotions.map((emotion: string) => {
          const colors = EMOTION_COLOR_MAP[emotion]
          return (
            <span key={emotion} className="rounded-full px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: colors?.gradient[0] ?? '#E7D7FF' }}>
              {EMOTION_EMOJI[emotion]} {emotion}
            </span>
          )
        })}
      </div>

      {(post.activities ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(post.activities ?? []).map((act: string) => {
            const preset = ACTIVITY_PRESETS.find((p) => p.id === act)
            return (
              <span key={act} className="rounded-full px-3 py-1.5 text-xs border border-border text-muted-foreground">
                {preset ? `${preset.icon} ${preset.name}` : act}
              </span>
            )
          })}
        </div>
      )}

      {post.content && post.content.length > 0 && (
        <p className="text-base text-foreground">&ldquo;{post.content}&rdquo;</p>
      )}

      {(similarCount ?? 0) > 0 && (
        <p className="text-sm text-muted-foreground">
          지난 30일간 {similarCount}명이 비슷한 마음이었어요
        </p>
      )}

      <SameMoodDailies
        postId={postId}
        emotions={emotions}
        postType={post.post_type}
      />
    </div>
  )
}
