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

const BASE_URL = 'https://www.eundunmaeul.store'

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
  const description = (post.content ?? '').replace(/<[^>]*>/g, '').slice(0, 160)
  const url = `${BASE_URL}/post/${id}`

  return {
    title: `${title} | 은둔마을`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | 은둔마을`,
      description,
      type: 'article',
      url,
      publishedTime: post.created_at,
      siteName: '은둔마을',
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary',
      title: `${title} | 은둔마을`,
      description,
    },
  }
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  const postId = parseInt(id, 10)
  const queryClient = makeQueryClient()

  const [post] = await Promise.all([
    getPostServer(postId),
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

  const jsonLd = post ? {
    '@context': 'https://schema.org',
    '@type': post.post_type === 'daily' ? 'BlogPosting' : 'Article',
    headline: post.title?.replace(/<[^>]*>/g, '') || '은둔마을 게시글',
    description: (post.content ?? '').replace(/<[^>]*>/g, '').slice(0, 200),
    datePublished: post.created_at,
    author: { '@type': 'Person', name: post.display_name || '익명' },
    publisher: { '@type': 'Organization', name: '은둔마을' },
    url: `${BASE_URL}/post/${postId}`,
    ...(post.emotions?.length ? { keywords: post.emotions.join(', ') } : {}),
  } : null

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-4 pb-24 md:pb-6">
        <PostDetailView postId={postId} />
      </main>
    </HydrationBoundary>
  )
}
