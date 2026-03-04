'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useBoardPosts } from '../hooks/useBoardPosts'
import { useRealtimePosts } from '@/hooks/useRealtimePosts'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { PostCard } from './PostCard'
import { PostCardSkeleton } from './PostCardSkeleton'
import { EmotionTrend } from './EmotionTrend'
import { DEFAULT_PUBLIC_BOARD_ID } from '@/lib/constants'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'

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
  const latestRef = useRef<HTMLButtonElement>(null)
  const popularRef = useRef<HTMLButtonElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 3, width: 0 })

  const updateIndicator = useCallback(() => {
    const el = sortOrder === 'latest' ? latestRef.current : popularRef.current
    if (el) setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth })
  }, [sortOrder])

  useEffect(() => { updateIndicator() }, [updateIndicator])

  return (
    <div className="space-y-4 animate-fade-in">
      <EmotionTrend />
      <Separator />

      <div className="sort-tabs-container">
        <div
          className="sort-tab-indicator"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width || 'auto' }}
        />
        <button
          ref={latestRef}
          className={`sort-tab ${sortOrder === 'latest' ? 'sort-tab-active' : ''}`}
          onClick={() => setSortOrder('latest')}
        >
          최신순
        </button>
        <button
          ref={popularRef}
          className={`sort-tab ${sortOrder === 'popular' ? 'sort-tab-active' : ''}`}
          onClick={() => setSortOrder('popular')}
        >
          인기순
        </button>
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
          <EmptyState icon={FileText} title="아직 게시글이 없습니다" description="첫 번째 게시글을 작성해보세요." />
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
