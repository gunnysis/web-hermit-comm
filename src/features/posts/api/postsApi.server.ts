import 'server-only'
import { createClient } from '@/utils/supabase/server'
import type { PostWithCounts } from '@/types/database'
import { PAGE_SIZE } from '@/lib/constants'

export async function getBoardPostsServer(
  boardId: number,
  sortOrder: 'latest' | 'popular' = 'latest',
): Promise<PostWithCounts[]> {
  const supabase = await createClient()

  let query = supabase
    .from('posts_with_like_count')
    .select('*')
    .eq('board_id', boardId)

  if (sortOrder === 'popular') {
    query = query.order('like_count', { ascending: false }).order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query.range(0, PAGE_SIZE - 1)
  if (error) throw error
  return (data ?? []) as PostWithCounts[]
}

export async function getPostServer(postId: number): Promise<PostWithCounts | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts_with_like_count')
    .select('*')
    .eq('id', postId)
    .limit(1)
  if (error) throw error
  return (data?.[0] as PostWithCounts) ?? null
}

export async function getEmotionTrendServer(days = 7) {
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_emotion_trend', { days })
  return data ?? []
}

export async function getCommentsServer(postId: number) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function getReactionsServer(postId: number) {
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_post_reactions', { p_post_id: postId })
  return data ?? []
}

export async function getTrendingPostsServer(hours = 72, limit = 10) {
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_trending_posts', {
    p_hours: hours,
    p_limit: limit,
  })
  return data ?? []
}
