'use client'

import Image from 'next/image'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { EMOTION_COLOR_MAP } from '@/lib/constants'
import { EmotionTags } from './EmotionTags'
import { PostContent } from './PostContent'
import type { Post } from '@/types/database'

interface RegularDetailViewProps {
  post: Post
  analysis: { emotions: string[]; error_reason?: string | null } | null | undefined
  timeAgo: string
  emotions: string[] | null | undefined
  hasEmotions: boolean
  similarCount: number | undefined
  isRetryingAnalysis: boolean
  onRetryAnalysis: () => Promise<void>
}

export function RegularDetailView({
  post,
  analysis,
  timeAgo,
  emotions,
  hasEmotions,
  similarCount,
  isRetryingAnalysis,
  onRetryAnalysis,
}: RegularDetailViewProps) {
  const primaryEmotion = emotions?.[0]
  const emotionColors = primaryEmotion ? EMOTION_COLOR_MAP[primaryEmotion] : null

  return (
    <>
      {emotionColors && (
        <div
          className="rounded-xl px-4 py-3 -mx-1"
          style={{ background: `linear-gradient(135deg, ${emotionColors.gradient[0]}, ${emotionColors.gradient[1]})` }}
        >
          <h1 className="text-2xl font-bold leading-tight tracking-tight">{post.title}</h1>
          {(similarCount ?? 0) > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              지난 30일간 {similarCount}명이 비슷한 마음이었어요
            </p>
          )}
        </div>
      )}

      <header className="space-y-2">
        {!emotionColors && (
          <h1 className="text-2xl font-bold leading-tight tracking-tight">{post.title}</h1>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <span className="font-medium">{post.display_name}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.created_at}>{timeAgo}</time>
          {((post.like_count ?? 0) > 0 || (post.comment_count ?? 0) > 0) && (
            <>
              <span aria-hidden>·</span>
              {(post.like_count ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-happy-50 text-happy-700 dark:bg-happy-900/40 dark:text-happy-300">
                  👍 {post.like_count}
                </span>
              )}
              {(post.comment_count ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-lavender-50 text-lavender-700 dark:bg-lavender-900/40 dark:text-lavender-300">
                  💬 {post.comment_count}
                </span>
              )}
            </>
          )}
        </div>
        <EmotionTags emotions={emotions} clickable />
        {!hasEmotions && analysis?.error_reason === 'content_too_short' && (
          <p className="text-xs text-muted-foreground">글이 짧아 감정을 분석하지 못했어요</p>
        )}
        {!hasEmotions && analysis?.error_reason !== 'content_too_short' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetryAnalysis}
            disabled={isRetryingAnalysis}
            className="gap-1 text-xs text-muted-foreground"
          >
            <RefreshCw size={12} className={isRetryingAnalysis ? 'animate-spin' : ''} />
            {isRetryingAnalysis ? '분석 중...' : '감정 분석 재시도'}
          </Button>
        )}
      </header>

      <Separator />

      <PostContent html={post.content} />
    </>
  )
}
