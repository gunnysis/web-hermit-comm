import { createClient } from '@/utils/supabase/client'
import type { PostWithCounts } from '@/types/database'
import { ALLOWED_EMOTIONS } from '@/lib/constants'

export async function searchPosts(query: string, options?: { boardId?: number; emotion?: string }): Promise<PostWithCounts[]> {
  if (!query.trim() && !options?.emotion) return []
  if (options?.emotion && !(ALLOWED_EMOTIONS as readonly string[]).includes(options.emotion)) return []
  const supabase = createClient()

  let req = supabase
    .from('posts_with_like_count')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)

  if (query.trim()) {
    req = req.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
  }

  if (options?.boardId) req = req.eq('board_id', options.boardId)
  if (options?.emotion) req = req.contains('emotions', [options.emotion])

  const { data, error } = await req
  if (error) throw error
  return (data ?? []) as PostWithCounts[]
}
