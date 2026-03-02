import { createClient } from '@/utils/supabase/client'
import type { Comment, CreateCommentRequest } from '@/types/database'

export async function getComments(postId: number): Promise<Comment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Comment[]
}

export async function createComment(
  postId: number,
  request: CreateCommentRequest & { author_id: string },
): Promise<Comment> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, ...request })
    .select()
    .single()
  if (error) throw error
  return data as Comment
}

export async function updateComment(commentId: number, content: string): Promise<Comment> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .select()
    .single()
  if (error) throw error
  return data as Comment
}

export async function deleteComment(commentId: number): Promise<void> {
  const supabase = createClient()
  const { error, count } = await supabase
    .from('comments')
    .delete({ count: 'exact' })
    .eq('id', commentId)
  if (error) throw error
  if (count === 0) throw new Error('댓글을 삭제할 수 없습니다.')
}
