import { createClient } from '@/utils/supabase/client'
import type { PostWithCounts, CreatePostRequest, Post, SearchResult, SearchSort } from '@/types/database'
import { PAGE_SIZE } from '@/lib/constants'
import { addBreadcrumb, logger } from '@/lib/logger'

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
  if (error) {
    logger.error('[API] getBoardPosts 에러:', error.message, { code: error.code })
    throw error
  }
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
  if (error) {
    logger.error('[API] getPost 에러:', error.message, { code: error.code })
    throw error
  }
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
  if (error) {
    logger.error('[API] createPost 에러:', error.message, { code: error.code })
    throw error
  }
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
  if (error) {
    logger.error('[API] updatePost 에러:', error.message, { code: error.code })
    throw error
  }
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
  if (error) {
    logger.error('[API] deletePost 에러:', error.message, { code: error.code })
    throw new Error('게시글을 삭제할 수 없습니다. 권한이 없거나 이미 삭제된 게시글입니다.')
  }
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
  if (error) {
    logger.error('[API] invokeAnalyzeOnDemand 에러:', error.message)
    throw error
  }
}

export async function getPostsByEmotion(emotion: string, limit = 20, offset = 0): Promise<PostWithCounts[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_posts_by_emotion', {
    p_emotion: emotion,
    p_limit: limit,
    p_offset: offset,
  })
  if (error) {
    logger.error('[API] getPostsByEmotion 에러:', error.message, { code: error.code })
    throw error
  }
  return (data ?? []) as PostWithCounts[]
}

export async function getSimilarFeelingCount(postId: number, days = 30): Promise<number> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_similar_feeling_count', {
    p_post_id: postId,
    p_days: days,
  })
  if (error) {
    logger.error('[API] getSimilarFeelingCount 에러:', error.message, { code: error.code })
    throw error
  }
  return (data as number) ?? 0
}

export async function getEmotionTrend(days = 7) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_emotion_trend', { days })
  if (error) {
    logger.error('[API] getEmotionTrend 에러:', error.message, { code: error.code })
    throw error
  }
  return data ?? []
}

export async function getRecommendedPosts(postId: number, limit = 10) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_recommended_posts_by_emotion', {
    p_post_id: postId,
    p_limit: limit,
  })
  if (error) {
    logger.error('[API] getRecommendedPosts 에러:', error.message, { code: error.code })
    throw error
  }
  return data ?? []
}

export async function getTrendingPosts(hours = 72, limit = 10) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_trending_posts', {
    p_hours: hours,
    p_limit: limit,
  })
  if (error) {
    logger.error('[API] getTrendingPosts 에러:', error.message, { code: error.code })
    throw error
  }
  return data ?? []
}

export async function searchPosts(params: {
  query: string
  emotion?: string | null
  sort?: SearchSort
  limit?: number
  offset?: number
}): Promise<SearchResult[]> {
  const { query, emotion, sort = 'relevance', limit = 20, offset = 0 } = params
  const q = query.trim()
  if (q.length < 2) return []

  const supabase = createClient()
  const { data, error } = await supabase.rpc('search_posts_v2', {
    p_query: q,
    p_emotion: emotion || undefined,
    p_sort: sort,
    p_limit: limit,
    p_offset: offset,
  })
  if (error) {
    logger.error('[API] searchPosts 에러:', error.message, { code: error.code })
    throw error
  }
  return (data ?? []) as SearchResult[]
}

export async function createDailyPost(data: {
  emotions: string[]
  activities?: string[]
  content?: string
}): Promise<Post> {
  const supabase = createClient()
  const { data: result, error } = await supabase.rpc('create_daily_post', {
    p_emotions: data.emotions,
    p_activities: data.activities ?? [],
    p_content: data.content ?? '',
  })
  if (error) {
    logger.error('[API] createDailyPost 에러:', error.message, { code: error.code })
    throw error
  }
  return result as unknown as Post
}

export async function updateDailyPost(data: {
  postId: number
  emotions: string[]
  activities?: string[]
  content?: string
}): Promise<Post> {
  const supabase = createClient()
  const { data: result, error } = await supabase.rpc('update_daily_post', {
    p_post_id: data.postId,
    p_emotions: data.emotions,
    p_activities: data.activities ?? [],
    p_content: data.content ?? '',
  })
  if (error) {
    logger.error('[API] updateDailyPost 에러:', error.message, { code: error.code })
    throw error
  }
  return result as unknown as Post
}

export async function getTodayDaily(): Promise<Post | null> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_today_daily')
  if (error) {
    logger.error('[API] getTodayDaily 에러:', error.message, { code: error.code })
    throw error
  }
  return data as Post | null
}

export interface DailyInsightsResult {
  total_dailies: number
  activity_emotion_map: {
    activity: string
    count: number
    emotions: { emotion: string; pct: number }[]
  }[]
}

export async function getDailyInsights(days = 30): Promise<DailyInsightsResult> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_daily_activity_insights', { p_days: days })
  if (error) {
    logger.error('[API] getDailyInsights 에러:', error.message, { code: error.code })
    throw error
  }
  return data as unknown as DailyInsightsResult
}

export interface YesterdayDailyReactions {
  post_id: number
  like_count: number
  comment_count: number
}

export async function getYesterdayDailyReactions(): Promise<YesterdayDailyReactions | null> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_yesterday_daily_reactions')
  if (error || !data) return null
  const result = data as unknown as YesterdayDailyReactions
  if (!result?.post_id) return null
  return result
}

export interface SameMoodDaily {
  id: number
  content: string
  emotions: string[]
  activities: string[]
}

export async function getSameMoodDailies(postId: number, emotions: string[]): Promise<SameMoodDaily[]> {
  if (!emotions.length) return []
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_same_mood_dailies', {
    p_post_id: postId,
    p_emotions: emotions,
  })
  if (error || !data) return []
  return (Array.isArray(data) ? data : []) as unknown as SameMoodDaily[]
}

export interface WeeklyEmotionSummary {
  week_start: string
  week_end: string
  days_logged: number
  top_emotions: { emotion: string; count: number }[] | null
  top_activity: string | null
}

export async function getWeeklyEmotionSummary(weekOffset = 0): Promise<WeeklyEmotionSummary | null> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_weekly_emotion_summary', {
    p_week_offset: weekOffset,
  })
  if (error) {
    logger.error('[API] getWeeklyEmotionSummary 에러:', error.message)
    return null
  }
  return data as unknown as WeeklyEmotionSummary | null
}
