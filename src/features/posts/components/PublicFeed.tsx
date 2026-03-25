'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useBoardPosts } from '../hooks/useBoardPosts'
import { useRealtimePosts } from '@/hooks/useRealtimePosts'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { PostCard } from './PostCard'
import { PostCardSkeleton } from './PostCardSkeleton'
import { CommunityPulse } from './CommunityPulse'
import { EmotionFilterBar } from './EmotionFilterBar'
import { TrendingPosts } from './TrendingPosts'
import { GreetingBanner } from './GreetingBanner'
import { DEFAULT_PUBLIC_BOARD_ID, EMPTY_STATE_MESSAGES, PUBLIC_BOARDS } from '@/lib/constants'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'
import { getPostsByEmotion } from '../api/postsApi'

type SortOrder = 'latest' | 'popular'

export function PublicFeed() {
  const [selectedBoardId, setSelectedBoardId] = useState(DEFAULT_PUBLIC_BOARD_ID)
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest')
  const [emotionFilter, setEmotionFilter] = useState<string | null>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useBoardPosts(selectedBoardId, sortOrder)
  useRealtimePosts(selectedBoardId)

  const { data: filteredPosts, isLoading: isFilterLoading } = useQuery({
    queryKey: ['postsByEmotion', emotionFilter],
    queryFn: () => getPostsByEmotion(emotionFilter!, 20, 0),
    enabled: !!emotionFilter,
  })

  const loadMoreRef = useIntersectionObserver(
    () => { if (hasNextPage && !isFetchingNextPage) fetchNextPage() },
    { enabled: hasNextPage && !isFetchingNextPage && !emotionFilter },
  )

  const posts = emotionFilter ? (filteredPosts ?? []) : (data?.pages.flat() ?? [])
  const loading = emotionFilter ? isFilterLoading : isLoading

  const latestRef = useRef<HTMLButtonElement>(null)
  const popularRef = useRef<HTMLButtonElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 3, width: 0 })

  const updateIndicator = useCallback(() => {
    const el = sortOrder === 'latest' ? latestRef.current : popularRef.current
    if (el) setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth })
  }, [sortOrder])

  useEffect(() => { updateIndicator() }, [updateIndicator])

  const handleEmotionSelect = (emotion: string | null) => {
    setEmotionFilter(emotion)
  }

  const handleBoardChange = (boardId: number) => {
    setSelectedBoardId(boardId)
    setEmotionFilter(null)
    setSortOrder('latest')
  }

  const selectedBoard = PUBLIC_BOARDS.find(b => b.id === selectedBoardId)

  return (
    <div className="space-y-3 animate-fade-in" style={{ viewTransitionName: 'page-content' }}>
      <GreetingBanner />

      {/* 게시판 탭 */}
      <div className="flex gap-2">
        {PUBLIC_BOARDS.map((board) => (
          <button
            key={board.id}
            onClick={() => handleBoardChange(board.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedBoardId === board.id
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {board.icon} {board.name}
          </button>
        ))}
      </div>

      <CommunityPulse onEmotionSelect={handleEmotionSelect} selectedEmotion={emotionFilter} />
      <EmotionFilterBar selected={emotionFilter} onSelect={handleEmotionSelect} />
      <TrendingPosts />
      <Separator />

      {!emotionFilter && (
        <div className="sort-tabs-container">
          <div
            className="sort-tab-indicator"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width || 'auto' }}
          />
          <button
            ref={latestRef}
            className={`sort-tab ${sortOrder === 'latest' ? 'sort-tab-active' : ''}`}
            onClick={() => setSortOrder('latest')}
            aria-label="최신순 정렬"
            aria-pressed={sortOrder === 'latest'}
          >
            최신순
          </button>
          <button
            ref={popularRef}
            className={`sort-tab ${sortOrder === 'popular' ? 'sort-tab-active' : ''}`}
            onClick={() => setSortOrder('popular')}
            aria-label="인기순 정렬"
            aria-pressed={sortOrder === 'popular'}
          >
            인기순
          </button>
        </div>
      )}

      {emotionFilter && (
        <p className="text-sm text-muted-foreground">
          &apos;{emotionFilter}&apos; 감정의 이야기들
        </p>
      )}

      {isError && (
        <p className="text-center text-muted-foreground py-10">
          게시글을 불러오지 못했습니다.
        </p>
      )}

      <div className="space-y-2.5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <PostCardSkeleton key={i} />)
          : posts.map((post) => <PostCard key={post.id} post={post} />)}

        {!loading && posts.length === 0 && (
          <EmptyState
            icon={FileText}
            title={emotionFilter
              ? EMPTY_STATE_MESSAGES.emotion_filter.title
              : (selectedBoard?.name === '시 게시판'
                ? '아직 시가 없어요'
                : EMPTY_STATE_MESSAGES.feed.title)}
            description={emotionFilter
              ? EMPTY_STATE_MESSAGES.emotion_filter.description
              : (selectedBoard?.name === '시 게시판'
                ? '첫 번째 시를 작성해보세요.\n마음을 시로 표현해보는 건 어떨까요?'
                : EMPTY_STATE_MESSAGES.feed.description)}
          />
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
