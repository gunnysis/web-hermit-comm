import { createClient } from '@/utils/supabase/client'
import type { PostWithCounts, CreatePostRequest, Post } from '@/types/database'
import { PAGE_SIZE } from '@/lib/constants'
import { addBreadcrumb } from '@/lib/logger'

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
  addBreadcrumb('posts', 'getBoardPosts', { boardId, page, sortOrder, count: data?.length ?? 0 })
  return (data ?? []) as PostWithCounts[]
}

export async function getPost(postId: number): Promise<PostWithCounts | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('posts_with_like_count')
    .select('*')
    .eq('id', postId)
    .limit(1)
  if (error) throw error
  return (data?.[0] as PostWithCounts) ?? null
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
  addBreadcrumb('posts', 'createPost', { postId: data.id })
  return data as Post
}

export async function updatePost(
  postId: number,
  update: Partial<Pick<Post, 'title' | 'content' | 'image_url' | 'initial_emotions'>>,
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

  // 세션 유효성 확인 (만료된 토큰으로 RPC 호출 방지)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인 세션이 만료됐습니다. 페이지를 새로고침해 주세요.')

  const { error } = await supabase.rpc('soft_delete_post', {
    p_post_id: postId,
  })
  if (error) throw new Error('게시글을 삭제할 수 없습니다. 권한이 없거나 이미 삭제된 게시글입니다.')
  addBreadcrumb('posts', 'deletePost', { postId })
}

export async function getPostAnalysis(postId: number) {
  const supabase = createClient()
  const { data } = await supabase
    .from('post_analysis')
    .select('*')
    .eq('post_id', postId)
    .limit(1)
  return data?.[0] ?? null
}

export async function invokeAnalyzeOnDemand(postId: number, content?: string, title?: string) {
  const supabase = createClient()
  const { error } = await supabase.functions.invoke('analyze-post-on-demand', {
    body: { postId, content, title },
  })
  if (error) throw error
}

export async function getPostsByEmotion(emotion: string, limit = 20, offset = 0): Promise<PostWithCounts[]> {
  const supabase = createClient()
  // RPC는 마이그레이션 push 후 gen-types로 타입 갱신 필요
  const { data, error } = await supabase.rpc('get_posts_by_emotion', {
    p_emotion: emotion,
    p_limit: limit,
    p_offset: offset,
  })
  if (error) throw error
  return (data ?? []) as PostWithCounts[]
}

export async function getSimilarFeelingCount(postId: number, days = 30): Promise<number> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_similar_feeling_count', {
    p_post_id: postId,
    p_days: days,
  })
  if (error) throw error
  return (data as number) ?? 0
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

export async function getTrendingPosts(hours = 72, limit = 10) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_trending_posts', {
    p_hours: hours,
    p_limit: limit,
  })
  if (error) throw error
  return data ?? []
}

export async function searchPosts(query: string, limit = 20, offset = 0) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('search_posts', {
    p_query: query,
    p_limit: limit,
    p_offset: offset,
  })
  if (error) throw error
  return data ?? []
}
