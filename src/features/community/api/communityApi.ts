import { createClient } from '@/utils/supabase/client'
import type { Group, Board, GroupMember, PostWithCounts, CreatePostRequest } from '@/types/database'
import { PAGE_SIZE } from '@/lib/constants'

export async function getGroup(groupId: number): Promise<Group | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .limit(1)
  return (data?.[0] as Group) ?? null
}

export async function getMyGroups(userId: string): Promise<Group[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, groups(*)')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .is('left_at', null)
  if (error) throw error
  return ((data ?? []).map((r: { group_id: number; groups: unknown }) => r.groups).filter(Boolean)) as Group[]
}

export async function getGroupBoards(groupId: number): Promise<Board[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('group_id', groupId)
    .order('id', { ascending: true })
  if (error) throw error
  return (data ?? []) as Board[]
}

export async function getGroupMember(groupId: number, userId: string): Promise<GroupMember | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .eq('status', 'approved')
    .is('left_at', null)
    .limit(1)
  return (data?.[0] as GroupMember) ?? null
}

export async function getGroupPosts(
  groupId: number,
  boardId: number | null,
  page: number,
  sortOrder: 'latest' | 'popular' = 'latest',
): Promise<PostWithCounts[]> {
  const supabase = createClient()
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('posts_with_like_count')
    .select('*')
    .eq('group_id', groupId)

  if (boardId) query = query.eq('board_id', boardId)

  if (sortOrder === 'popular') {
    query = query.order('like_count', { ascending: false }).order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query.range(from, to)
  if (error) throw error
  return (data ?? []) as PostWithCounts[]
}

export async function joinGroupByInviteCode(
  inviteCode: string,
  userId: string,
): Promise<{ group_id: number }> {
  const supabase = createClient()
  const { data: groupRows } = await supabase
    .from('groups')
    .select('id')
    .eq('invite_code', inviteCode)
    .limit(1)
  const group = groupRows?.[0] ?? null
  if (!group) throw new Error('유효하지 않은 초대 코드입니다.')

  const { data: existingRows } = await supabase
    .from('group_members')
    .select('id, status')
    .eq('group_id', group.id)
    .eq('user_id', userId)
    .limit(1)
  const existing = existingRows?.[0] ?? null

  if (existing) {
    if (existing.status === 'approved') throw new Error('이미 가입된 그룹입니다.')
    // 재가입: status 업데이트
    await supabase
      .from('group_members')
      .update({ status: 'approved', left_at: null })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: userId, role: 'member', status: 'approved' })
  }

  return { group_id: group.id }
}

export async function leaveGroup(groupId: number, userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('group_members')
    .update({ status: 'left', left_at: new Date().toISOString() })
    .eq('group_id', groupId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function createGroupPost(
  request: CreatePostRequest & { author_id: string },
): Promise<{ id: number }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('posts')
    .insert(request)
    .select('id')
    .single()
  if (error) throw error
  return data as { id: number }
}
