'use client'

import Link from 'next/link'
import { useRecommendedPosts } from '../hooks/useRecommendedPosts'
import { Heart, MessageCircle } from 'lucide-react'
import { EMOTION_EMOJI } from '@/lib/constants'
import { Skeleton } from '@/components/ui/skeleton'
import type { RecommendedPost } from '@/types/database'

interface RecommendedPostsProps {
  postId: number
  hasEmotions: boolean
}

export function RecommendedPosts({ postId, hasEmotions }: RecommendedPostsProps) {
  const { data, isLoading } = useRecommendedPosts(postId, hasEmotions)

  if (!hasEmotions) return null

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-3 overflow-x-auto pb-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="shrink-0 h-20 w-44 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!data?.length) return null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">비슷한 감정의 글</p>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
        {(data as RecommendedPost[]).map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="shrink-0 snap-start w-44 rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors space-y-1"
          >
            <div className="flex gap-1 flex-wrap">
              {post.emotions.slice(0, 2).map(e => (
                <span key={e} className="text-xs">{EMOTION_EMOJI[e] ?? '💬'} {e}</span>
              ))}
            </div>
            <p className="text-xs font-medium line-clamp-2 leading-snug">{post.title}</p>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5"><Heart size={10} />{post.like_count}</span>
              <span className="flex items-center gap-0.5"><MessageCircle size={10} />{post.comment_count}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
