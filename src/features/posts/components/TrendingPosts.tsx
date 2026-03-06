'use client'

import Link from 'next/link'
import { useTrendingPosts } from '../hooks/useTrendingPosts'
import { Heart, MessageCircle } from 'lucide-react'
import { EMOTION_EMOJI } from '@/lib/constants'
import { Skeleton } from '@/components/ui/skeleton'
import type { TrendingPost } from '@/types/database'

export function TrendingPosts() {
  const { data, isLoading } = useTrendingPosts()

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <div className="flex gap-3 overflow-x-auto pb-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="shrink-0 h-24 w-40 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const posts = (data ?? []) as TrendingPost[]
  if (!posts.length) return null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">지금 뜨는 글</p>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="shrink-0 snap-start w-40 rounded-lg border bg-card p-2.5 hover:bg-accent/50 transition-colors space-y-1"
          >
            <p className="text-xs font-medium line-clamp-2 leading-snug">{post.title}</p>
            <p className="text-xs text-muted-foreground truncate">{post.display_name}</p>
            {post.emotions && post.emotions.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {post.emotions?.slice(0, 2).map(e => (
                  <span key={e} className="text-xs">{EMOTION_EMOJI[e] ?? '💬'} {e}</span>
                ))}
              </div>
            )}
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
