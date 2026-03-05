'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EMOTION_EMOJI } from '@/lib/constants'
import { PostCard } from './PostCard'
import { PostCardSkeleton } from './PostCardSkeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { searchPosts, getPostsByEmotion } from '../api/postsApi'
import type { PostWithCounts } from '@/types/database'

export function SearchView() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams.get('q') ?? ''
  const emotion = searchParams.get('emotion') ?? ''
  const [input, setInput] = useState(initialQ)
  const [query, setQuery] = useState(initialQ)

  // 500ms 디바운스
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = input.trim()
      setQuery(trimmed)
      const params = new URLSearchParams()
      if (trimmed) params.set('q', trimmed)
      if (emotion) params.set('emotion', emotion)
      const qs = params.toString()
      router.replace(`/search${qs ? `?${qs}` : ''}`, { scroll: false })
    }, 500)
    return () => clearTimeout(timer)
  }, [input, emotion, router])

  const { data, isLoading } = useQuery<PostWithCounts[]>({
    queryKey: ['search', query, emotion],
    queryFn: async () => {
      if (query) {
        const results = await searchPosts(query)
        return results as unknown as PostWithCounts[]
      }
      if (emotion) return getPostsByEmotion(emotion)
      return []
    },
    enabled: query.length > 0 || !!emotion,
    staleTime: 30 * 1000,
  })

  return (
    <div className="space-y-4">
      <div className="relative" role="search">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="게시글 검색..."
          className="pl-9"
          aria-label="게시글 검색"
          autoFocus
        />
      </div>

      {emotion && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs gap-1">
            <span>{EMOTION_EMOJI[emotion] ?? '💬'}</span>
            {emotion}
            <button onClick={() => router.replace('/search', { scroll: false })} className="ml-1 hover:text-foreground" aria-label={`${emotion} 감정 필터 제거`}>
              <X size={12} />
            </button>
          </Badge>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && query && data?.length === 0 && (
        <EmptyState icon={Search} title={`'${query}'에 대한 검색 결과가 없습니다`} description="다른 검색어로 시도해보세요." />
      )}

      {!query && !emotion && (
        <EmptyState icon={Search} title="검색어를 입력하세요" />
      )}

      {data && data.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{data.length}개의 결과</p>
          {data.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  )
}
