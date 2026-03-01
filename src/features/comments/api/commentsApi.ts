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
  const { error } = await supabase
    .from('comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', commentId)
  if (error) throw error
}
