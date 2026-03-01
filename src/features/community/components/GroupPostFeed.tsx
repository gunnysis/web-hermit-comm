'use client'

import { useState } from 'react'
import { useGroupPosts } from '../hooks/useGroupPosts'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { PostCard } from '@/features/posts/components/PostCard'
import { PostCardSkeleton } from '@/features/posts/components/PostCardSkeleton'
import { Button } from '@/components/ui/button'

interface GroupPostFeedProps {
  groupId: number
  boardId: number | null
}

export function GroupPostFeed({ groupId, boardId }: GroupPostFeedProps) {
  const [sortOrder, setSortOrder] = useState<'latest' | 'popular'>('latest')
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useGroupPosts(groupId, boardId, sortOrder)

  const loadMoreRef = useIntersectionObserver(
    () => { if (hasNextPage && !isFetchingNextPage) fetchNextPage() },
    { enabled: hasNextPage && !isFetchingNextPage },
  )

  const posts = data?.pages.flat() ?? []

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={sortOrder === 'latest' ? 'default' : 'ghost'} size="sm" onClick={() => setSortOrder('latest')}>최신순</Button>
        <Button variant={sortOrder === 'popular' ? 'default' : 'ghost'} size="sm" onClick={() => setSortOrder('popular')}>인기순</Button>
      </div>

      {isError && <p className="text-center text-muted-foreground py-10">게시글을 불러오지 못했습니다.</p>}

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <PostCardSkeleton key={i} />)
          : posts.map((post) => <PostCard key={post.id} post={post} />)}
        {!isLoading && posts.length === 0 && (
          <p className="text-center text-muted-foreground py-12">아직 게시글이 없습니다.</p>
        )}
      </div>

      <div ref={loadMoreRef} className="h-4" />
      {isFetchingNextPage && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      )}
    </div>
  )
}
