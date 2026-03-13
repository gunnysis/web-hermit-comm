'use client'

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Search, X, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ALLOWED_EMOTIONS, EMOTION_EMOJI, EMOTION_COLOR_MAP, EMPTY_STATE_MESSAGES, SEARCH_CONFIG, SEARCH_SORT_OPTIONS } from '@/lib/constants'
import { HighlightText } from '@/lib/highlight'
import { getRecentSearches, addRecentSearch, removeRecentSearch, clearAllRecentSearches } from '@/lib/recent-searches'
import { PostCard } from './PostCard'
import { PostCardSkeleton } from './PostCardSkeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { searchPosts, getPostsByEmotion } from '../api/postsApi'
import type { SearchResult, SearchSort } from '@/types/database'

const { PAGE_SIZE, DEBOUNCE_MS, STALE_TIME_MS, MIN_QUERY_LENGTH } = SEARCH_CONFIG

// 정렬 옵션: 중앙 상수 SEARCH_SORT_OPTIONS 사용

export function SearchView() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialQ = searchParams.get('q') ?? ''
  const initialEmotion = searchParams.get('emotion') ?? ''
  const initialSort = (searchParams.get('sort') as SearchSort) || 'relevance'

  const [input, setInput] = useState(initialQ)
  const [query, setQuery] = useState(initialQ)
  const [selectedEmotion, setSelectedEmotion] = useState(initialEmotion)
  const [sort, setSort] = useState<SearchSort>(initialSort)
  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches())

  // 디바운스 + URL 동기화
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = input.trim()
      setQuery(trimmed)
      const params = new URLSearchParams()
      if (trimmed) params.set('q', trimmed)
      if (selectedEmotion) params.set('emotion', selectedEmotion)
      if (sort !== 'relevance') params.set('sort', sort)
      const qs = params.toString()
      router.replace(`/search${qs ? `?${qs}` : ''}`, { scroll: false })
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [input, selectedEmotion, sort, router])

  const hasTextQuery = query.length >= MIN_QUERY_LENGTH

  // v2 검색 (텍스트 있을 때)
  const searchQuery = useInfiniteQuery({
    queryKey: ['search', query, selectedEmotion, sort],
    queryFn: ({ pageParam = 0 }) =>
      searchPosts({
        query,
        emotion: selectedEmotion || null,
        sort,
        limit: PAGE_SIZE,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.flat().length : undefined,
    initialPageParam: 0,
    enabled: hasTextQuery,
    staleTime: STALE_TIME_MS,
    retry: 1,
  })
  const { data: searchPages, isLoading: searchLoading, error: searchError,
          fetchNextPage, hasNextPage, isFetchingNextPage } = searchQuery

  // 감정 전용 (텍스트 없을 때)
  const emotionQuery = useQuery({
    queryKey: ['postsByEmotion', selectedEmotion],
    queryFn: () => getPostsByEmotion(selectedEmotion, SEARCH_CONFIG.EMOTION_ONLY_LIMIT, 0),
    enabled: selectedEmotion.length > 0 && !hasTextQuery,
  })
  const { data: emotionPosts, isLoading: emotionLoading, error: emotionError } = emotionQuery

  // 검색 성공 시 최근 검색어 localStorage 저장 (state 갱신은 초기화면 복귀 시)
  const searchPagesList = searchPages?.pages
  useEffect(() => {
    if (hasTextQuery && searchPagesList?.[0] !== undefined) {
      addRecentSearch(query)
    }
  }, [hasTextQuery, query, searchPagesList])

  const searchResults = useMemo(() => searchPages?.pages.flat() ?? [], [searchPages])

  const isSearchMode = hasTextQuery
  const isEmotionOnlyMode = selectedEmotion.length > 0 && !hasTextQuery
  const hasActiveFilter = hasTextQuery || selectedEmotion.length > 0
  const showInitial = !hasActiveFilter

  const error = isSearchMode ? searchError : isEmotionOnlyMode ? emotionError : null
  const refetch = isSearchMode ? searchQuery.refetch : emotionQuery.refetch

  const isLoading = isSearchMode ? searchLoading : isEmotionOnlyMode ? emotionLoading : false
  const displayCount = isSearchMode ? searchResults.length : isEmotionOnlyMode ? (emotionPosts?.length ?? 0) : 0
  const isEmpty = !isLoading && displayCount === 0 && hasActiveFilter

  // 핸들러
  const handleEmotionPress = useCallback((emotion: string) => {
    setSelectedEmotion((prev) => (prev === emotion ? '' : emotion))
  }, [])

  const handleClearQuery = useCallback(() => {
    setInput('')
    setQuery('')
    setRecentSearches(getRecentSearches())
  }, [])

  const handleRecentPress = useCallback((q: string) => {
    setInput(q)
    setQuery(q)
  }, [])

  const handleRemoveRecent = useCallback((q: string) => {
    setRecentSearches(removeRecentSearch(q))
  }, [])

  const handleClearAllRecent = useCallback(() => {
    clearAllRecentSearches()
    setRecentSearches([])
  }, [])

  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isFetchingNextPage) {
        fetchNextPage()
      }
    }, { threshold: 0.1 })
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="space-y-4">
      {/* 검색 입력 */}
      <div className="relative" role="search">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="제목, 내용 검색"
          className="pl-9 pr-9"
          aria-label="게시글 검색"
          autoFocus
        />
        {input.length > 0 && (
          <button
            onClick={handleClearQuery}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="검색어 지우기"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 감정 필터 칩 */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {ALLOWED_EMOTIONS.map((emotion) => {
          const isActive = selectedEmotion === emotion
          const emoji = EMOTION_EMOJI[emotion] ?? ''
          const colors = EMOTION_COLOR_MAP[emotion]

          return (
            <button
              key={emotion}
              onClick={() => handleEmotionPress(emotion)}
              style={isActive && colors ? { backgroundColor: colors.gradient[0] } : undefined}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition-all ${
                isActive
                  ? 'font-semibold border border-border'
                  : 'bg-muted hover:bg-muted/80'
              }`}
              aria-label={`${emotion} 필터${isActive ? ' (선택됨)' : ''}`}
            >
              {emoji} {emotion}
            </button>
          )
        })}
      </div>

      {/* 정렬 + 필터 상태 바 */}
      {hasActiveFilter && (
        <div className="space-y-2">
          {isSearchMode && (
            <div className="flex gap-1.5">
              {SEARCH_SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    sort === opt.value
                      ? 'bg-happy-500 text-white dark:bg-happy-600'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  aria-label={`${opt.label} 정렬`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>
                {selectedEmotion
                  ? query
                    ? `'${query}' + ${selectedEmotion}`
                    : `${selectedEmotion} 감정의 이야기`
                  : `'${query}' 검색`}
              </span>
              {!isLoading && (
                <span className="font-medium text-primary">{displayCount}건</span>
              )}
            </div>
            {selectedEmotion && (
              <button
                onClick={() => setSelectedEmotion('')}
                className="p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="감정 필터 해제"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 초기 화면: 최근 검색어 + 감정으로 찾기 */}
      {showInitial && (
        <div className="space-y-6">
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">최근 검색어</h3>
                <button
                  onClick={handleClearAllRecent}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="최근 검색어 전체 삭제"
                >
                  전체 삭제
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((q) => (
                  <div key={q} className="flex items-center justify-between py-2 border-b border-border/50">
                    <button
                      onClick={() => handleRecentPress(q)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={`검색어: ${q}`}
                    >
                      <Clock size={14} />
                      {q}
                    </button>
                    <button
                      onClick={() => handleRemoveRecent(q)}
                      className="p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      aria-label={`'${q}' 삭제`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold mb-3">감정으로 찾기</h3>
            <div className="flex flex-wrap gap-2">
              {ALLOWED_EMOTIONS.map((emotion) => {
                const emoji = EMOTION_EMOJI[emotion] ?? ''
                return (
                  <button
                    key={emotion}
                    onClick={() => handleEmotionPress(emotion)}
                    className="rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/80 border border-border/50 transition-colors"
                    aria-label={`${emotion} 감정 검색`}
                  >
                    {emoji} {emotion}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 로딩 */}
      {!showInitial && isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      )}

      {/* 에러 상태 */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-base font-semibold mb-1">검색 중 문제가 발생했어요</p>
          <p className="text-sm text-muted-foreground mb-4">잠시 후 다시 시도해주세요</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 빈 상태 */}
      {isEmpty && (
        <EmptyState
          icon={Search}
          title={
            selectedEmotion && !hasTextQuery
              ? EMPTY_STATE_MESSAGES.search_emotion.title
              : selectedEmotion && hasTextQuery
                ? `'${query}' + ${selectedEmotion} 결과가 없어요`
                : EMPTY_STATE_MESSAGES.search.title
          }
          description={
            selectedEmotion && !hasTextQuery
              ? EMPTY_STATE_MESSAGES.search_emotion.description
              : selectedEmotion
                ? '다른 감정이나 검색어를 시도해보세요.'
                : EMPTY_STATE_MESSAGES.search.description
          }
        />
      )}

      {/* 검색 결과 (텍스트 — 하이라이트) */}
      {isSearchMode && !searchLoading && searchResults.length > 0 && (
        <div className="space-y-3">
          {searchResults.map((result) => (
            <SearchResultCard key={result.id} result={result} />
          ))}
          {hasNextPage && <div ref={loadMoreRef} className="h-10" />}
          {isFetchingNextPage && <PostCardSkeleton />}
        </div>
      )}

      {/* 감정 전용 결과 */}
      {isEmotionOnlyMode && !emotionLoading && (emotionPosts ?? []).length > 0 && (
        <div className="space-y-3">
          {(emotionPosts ?? []).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

// --- 검색 결과 카드 (하이라이트 포함) ---

const SearchResultCard = memo(function SearchResultCard({ result }: { result: SearchResult }) {
  const router = useRouter()
  const emotions = result.emotions ?? []

  return (
    <button
      onClick={() => router.push(`/post/${result.id}`)}
      className="w-full text-left rounded-xl border bg-card p-4 hover:bg-accent/50 transition-colors relative overflow-hidden"
    >
      {emotions[0] && EMOTION_COLOR_MAP[emotions[0]] && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
          style={{ backgroundColor: EMOTION_COLOR_MAP[emotions[0]].gradient[1] }}
        />
      )}

      <div className="pl-2">
        <HighlightText
          text={result.title_highlight}
          className="font-bold text-base leading-relaxed line-clamp-2"
        />

        <HighlightText
          text={result.content_highlight}
          className="text-sm text-muted-foreground mt-1.5 line-clamp-3 leading-relaxed"
        />

        {emotions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {emotions.slice(0, 2).map((emotion) => (
              <span key={emotion} className="text-xs bg-muted rounded-full px-2.5 py-0.5">
                {EMOTION_EMOJI[emotion] ?? '💬'} {emotion}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary/80">{result.display_name}</span>
            <span>👍 {result.like_count ?? 0}</span>
            <span>💬 {result.comment_count ?? 0}</span>
          </div>
          <span>{new Date(result.created_at).toLocaleDateString('ko-KR')}</span>
        </div>
      </div>
    </button>
  )
})
