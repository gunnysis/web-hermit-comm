import { createClient } from '@/utils/supabase/client'
import type { PostWithCounts, CreatePostRequest, Post } from '@/types/database'
import { PAGE_SIZE } from '@/lib/constants'

export async function getBoardPosts(
  boardId: number,
  page: number,
  sortOrder: 'latest' | 'popular' = 'latest',
): Promise<PostWithCounts[]> {
  const supabase = createClient()
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('posts_with_like_count')
    .select('*')
    .eq('board_id', boardId)

  if (sortOrder === 'popular') {
    query = query.order('like_count', { ascending: false }).order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query.range(from, to)
  if (error) throw error
  return (data ?? []) as PostWithCounts[]
}

export async function getPost(postId: number): Promise<PostWithCounts | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('posts_with_like_count')
    .select('*')
    .eq('id', postId)
    .single()
  if (error) throw error
  return data as PostWithCounts | null
}

export async function createPost(
  request: CreatePostRequest & { author_id: string },
): Promise<Post> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('posts')
    .insert(request)
    .select()
    .single()
  if (error) throw error
  return data as Post
}

export async function updatePost(
  postId: number,
  update: Partial<Pick<Post, 'title' | 'content' | 'image_url'>>,
): Promise<Post> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('posts')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', postId)
    .select()
    .single()
  if (error) throw error
  return data as Post
}

export async function deletePost(postId: number): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
  if (error) throw error
}

export async function getPostAnalysis(postId: number) {
  const supabase = createClient()
  const { data } = await supabase
    .from('post_analysis')
    .select('*')
    .eq('post_id', postId)
    .single()
  return data
}

export async function invokeAnalyzeOnDemand(postId: number) {
  const supabase = createClient()
  await supabase.functions.invoke('analyze-post-on-demand', {
    body: { postId },
  })
}

export async function getEmotionTrend(days = 7) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_emotion_trend', { days })
  if (error) throw error
  return data ?? []
}

export async function getRecommendedPosts(postId: number, limit = 10) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_recommended_posts_by_emotion', {
    p_post_id: postId,
    p_limit: limit,
  })
  if (error) throw error
  return data ?? []
}
