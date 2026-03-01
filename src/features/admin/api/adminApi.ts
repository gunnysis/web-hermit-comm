import { createClient } from '@/utils/supabase/client'
import type { Group } from '@/types/database'

export async function checkAppAdmin(userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('app_admin')
    .select('user_id')
    .eq('user_id', userId)
    .single()
  return !!data
}

export async function getMyManagedGroups(userId: string): Promise<Group[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Group[]
}

export async function createGroupWithBoard(
  name: string,
  description: string,
  ownerId: string,
): Promise<Group> {
  const supabase = createClient()
  const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase()

  const { data: group, error } = await supabase
    .from('groups')
    .insert({ name, description: description || null, owner_id: ownerId, join_mode: 'invite_only', invite_code: inviteCode })
    .select()
    .single()
  if (error) throw error

  // 기본 게시판 생성
  await supabase.from('boards').insert({
    name: '일반',
    group_id: group.id,
    visibility: 'private',
    anon_mode: 'allow_choice',
  })

  // 관리자를 owner로 그룹 멤버 추가
  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: ownerId,
    role: 'owner',
    status: 'approved',
  })

  return group as Group
}

export async function deleteGroup(groupId: number): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('groups').delete().eq('id', groupId)
  if (error) throw error
}

export async function regenerateInviteCode(groupId: number): Promise<string> {
  const supabase = createClient()
  const newCode = Math.random().toString(36).slice(2, 8).toUpperCase()
  const { error } = await supabase
    .from('groups')
    .update({ invite_code: newCode })
    .eq('id', groupId)
  if (error) throw error
  return newCode
}
