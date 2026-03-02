import { createClient } from '@/utils/supabase/client'
import type { Reaction } from '@/types/database'

export async function getReactions(postId: number): Promise<Reaction[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reactions')
    .select('*')
    .eq('post_id', postId)
  if (error) throw error
  return (data ?? []) as Reaction[]
}

export async function getUserReactions(postId: number, userId: string): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_reactions')
    .select('reaction_type')
    .eq('post_id', postId)
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []).map((r) => r.reaction_type)
}

export async function toggleReaction(
  postId: number,
  userId: string,
  reactionType: string,
): Promise<void> {
  const supabase = createClient()

  // user_reactions에 존재 여부 확인
  const { data: existingRows } = await supabase
    .from('user_reactions')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .eq('reaction_type', reactionType)
    .limit(1)
  const existing = existingRows?.[0] ?? null

  if (existing) {
    // 취소: user_reactions 삭제 + reactions count 감소
    await supabase.from('user_reactions').delete().eq('id', existing.id)
    const { data: reactionRows } = await supabase
      .from('reactions')
      .select('id, count')
      .eq('post_id', postId)
      .eq('reaction_type', reactionType)
      .limit(1)
    const reaction = reactionRows?.[0] ?? null
    if (reaction) {
      if (reaction.count <= 1) {
        await supabase.from('reactions').delete().eq('id', reaction.id)
      } else {
        await supabase.from('reactions').update({ count: reaction.count - 1 }).eq('id', reaction.id)
      }
    }
  } else {
    // 추가: user_reactions insert + reactions upsert
    await supabase.from('user_reactions').insert({ post_id: postId, user_id: userId, reaction_type: reactionType })
    const { data: reactionRows } = await supabase
      .from('reactions')
      .select('id, count')
      .eq('post_id', postId)
      .eq('reaction_type', reactionType)
      .limit(1)
    const reaction = reactionRows?.[0] ?? null
    if (reaction) {
      await supabase.from('reactions').update({ count: reaction.count + 1 }).eq('id', reaction.id)
    } else {
      await supabase.from('reactions').insert({ post_id: postId, reaction_type: reactionType, count: 1 })
    }
  }
}
