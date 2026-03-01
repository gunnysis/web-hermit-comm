import { createClient } from '@/utils/supabase/client'
import type { PostWithCounts } from '@/types/database'

export async function searchPosts(query: string, boardId?: number): Promise<PostWithCounts[]> {
  if (!query.trim()) return []
  const supabase = createClient()

  let req = supabase
    .from('posts_with_like_count')
    .select('*')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(30)

  if (boardId) req = req.eq('board_id', boardId)

  const { data, error } = await req
  if (error) throw error
  return (data ?? []) as PostWithCounts[]
}
