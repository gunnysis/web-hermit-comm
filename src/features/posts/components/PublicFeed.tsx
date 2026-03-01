'use client'

import { useState } from 'react'
import { useBoardPosts } from '../hooks/useBoardPosts'
import { useRealtimePosts } from '@/hooks/useRealtimePosts'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { PostCard } from './PostCard'
import { PostCardSkeleton } from './PostCardSkeleton'
import { EmotionTrend } from './EmotionTrend'
import { DEFAULT_PUBLIC_BOARD_ID } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

type SortOrder = 'latest' | 'popular'

export function PublicFeed() {
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest')
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useBoardPosts(DEFAULT_PUBLIC_BOARD_ID, sortOrder)
  useRealtimePosts(DEFAULT_PUBLIC_BOARD_ID)

  const loadMoreRef = useIntersectionObserver(
    () => { if (hasNextPage && !isFetchingNextPage) fetchNextPage() },
    { enabled: hasNextPage && !isFetchingNextPage },
  )

  const posts = data?.pages.flat() ?? []

  return (
    <div className="space-y-4 animate-fade-in">
      <EmotionTrend />
      <Separator />

      <div className="flex gap-2">
        <Button
          variant={sortOrder === 'latest' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSortOrder('latest')}
        >
          최신순
        </Button>
        <Button
          variant={sortOrder === 'popular' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSortOrder('popular')}
        >
          인기순
        </Button>
      </div>

      {isError && (
        <p className="text-center text-muted-foreground py-10">
          게시글을 불러오지 못했습니다.
        </p>
      )}

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <PostCardSkeleton key={i} />)
          : posts.map((post) => <PostCard key={post.id} post={post} />)}

        {!isLoading && posts.length === 0 && (
          <p className="text-center text-muted-foreground py-16">아직 게시글이 없습니다.</p>
        )}
      </div>

      <div ref={loadMoreRef} className="h-4" />
      {isFetchingNextPage && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      )}
    </div>
  )
}
