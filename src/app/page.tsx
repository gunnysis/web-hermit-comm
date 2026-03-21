import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { makeQueryClient } from '@/lib/query-client'
import { Header } from '@/components/layout/Header'
import { PublicFeed } from '@/features/posts/components/PublicFeed'
import { getBoardPostsServer, getEmotionTrendServer, getTrendingPostsServer } from '@/features/posts/api/postsApi.server'
import { DEFAULT_PUBLIC_BOARD_ID, PAGE_SIZE } from '@/lib/constants'
import type { PostWithCounts } from '@/types/database'

export default async function HomePage() {
  const queryClient = makeQueryClient()

  await Promise.all([
    queryClient.prefetchInfiniteQuery({
      queryKey: ['boardPosts', DEFAULT_PUBLIC_BOARD_ID, 'latest'],
      queryFn: () => getBoardPostsServer(DEFAULT_PUBLIC_BOARD_ID, 'latest'),
      initialPageParam: 0,
      getNextPageParam: (lastPage: PostWithCounts[]) =>
        lastPage.length < PAGE_SIZE ? undefined : 1,
      pages: 1,
    }),
    queryClient.prefetchQuery({
      queryKey: ['emotionTrend', 7],
      queryFn: () => getEmotionTrendServer(),
    }),
    queryClient.prefetchQuery({
      queryKey: ['trendingPosts'],
      queryFn: () => getTrendingPostsServer(),
    }),
  ])

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '은둔마을',
    url: 'https://www.eundunmaeul.store',
    description: '마음이 쉬어갈 수 있는 익명 커뮤니티',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.eundunmaeul.store/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-4 pb-24 md:pb-6">
        <PublicFeed />
      </main>
    </HydrationBoundary>
  )
}
