import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { makeQueryClient } from '@/lib/query-client'
import { Header } from '@/components/layout/Header'
import { PostDetailView } from '@/features/posts/components/PostDetailView'
import {
  getPostServer,
  getCommentsServer,
  getReactionsServer,
} from '@/features/posts/api/postsApi.server'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const post = await getPostServer(parseInt(id, 10))

  if (!post) {
    return {
      title: '게시글 | 은둔마을',
      description: '은둔마을에서 마음을 나눠보세요.',
    }
  }

  const title = post.title.replace(/<[^>]*>/g, '')
  const description = post.content.replace(/<[^>]*>/g, '').slice(0, 160)

  return {
    title: `${title} | 은둔마을`,
    description,
    openGraph: {
      title: `${title} | 은둔마을`,
      description,
      type: 'article',
    },
  }
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  const postId = parseInt(id, 10)
  const queryClient = makeQueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['post', postId],
      queryFn: () => getPostServer(postId),
    }),
    queryClient.prefetchQuery({
      queryKey: ['comments', postId],
      queryFn: () => getCommentsServer(postId),
    }),
    queryClient.prefetchQuery({
      queryKey: ['postReactions', postId],
      queryFn: () => getReactionsServer(postId),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <PostDetailView postId={postId} />
      </main>
    </HydrationBoundary>
  )
}
