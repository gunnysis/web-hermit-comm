import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { makeQueryClient } from '@/lib/query-client'
import { Header } from '@/components/layout/Header'
import { PublicFeed } from '@/features/posts/components/PublicFeed'
import { getBoardPostsServer, getEmotionTrendServer } from '@/features/posts/api/postsApi.server'
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
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <PublicFeed />
      </main>
    </HydrationBoundary>
  )
}
