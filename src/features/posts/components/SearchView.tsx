'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PostCard } from './PostCard'
import { PostCardSkeleton } from './PostCardSkeleton'
import { searchPosts } from '../api/searchApi'

export function SearchView() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams.get('q') ?? ''
  const [input, setInput] = useState(initialQ)
  const [query, setQuery] = useState(initialQ)

  // 500ms 디바운스
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(input.trim())
      if (input.trim()) {
        router.replace(`/search?q=${encodeURIComponent(input.trim())}`, { scroll: false })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [input, router])

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchPosts(query),
    enabled: query.length > 0,
    staleTime: 30 * 1000,
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="게시글 검색..."
          className="pl-9"
          autoFocus
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && query && data?.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          &apos;{query}&apos;에 대한 검색 결과가 없습니다.
        </p>
      )}

      {!query && (
        <p className="text-center text-muted-foreground py-12">검색어를 입력하세요.</p>
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
