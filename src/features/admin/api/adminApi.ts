import { createClient } from '@/utils/supabase/client'
import type { Group } from '@/types/database'

export async function checkAppAdmin(userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('app_admin')
    .select('user_id')
    .eq('user_id', userId)
    .limit(1)
  return (data?.length ?? 0) > 0
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

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function createGroupWithBoard(
  name: string,
  description: string,
  ownerId: string,
  inviteCode?: string,
): Promise<Group> {
  const supabase = createClient()
  const trimmedName = name.trim()
  if (!trimmedName) throw new Error('그룹 이름을 입력해주세요.')
  if (trimmedName.length > 100) throw new Error('그룹 이름은 100자 이내로 입력해주세요.')
  if (inviteCode?.trim()) {
    const code = inviteCode.trim()
    if (code.length < 4) throw new Error('초대 코드는 4자 이상이어야 합니다.')
    if (code.length > 50) throw new Error('초대 코드는 50자 이내로 입력해주세요.')
  }
  if (description && description.length > 500) throw new Error('설명은 500자 이내로 입력해주세요.')
  const finalCode = inviteCode?.trim() || generateInviteCode()

  const { data: group, error } = await supabase
    .from('groups')
    .insert({ name: trimmedName, description: description?.trim() || null, owner_id: ownerId, join_mode: 'invite_only', invite_code: finalCode })
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

export async function deleteGroup(groupId: number, ownerId: string): Promise<void> {
  const supabase = createClient()
  const { error, count } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)
    .eq('owner_id', ownerId)
  if (error) throw error
  if (count === 0) throw new Error('권한이 없거나 그룹이 존재하지 않습니다.')
}

export async function regenerateInviteCode(groupId: number, ownerId: string): Promise<string> {
  const supabase = createClient()
  const newCode = generateInviteCode()
  const { error, count } = await supabase
    .from('groups')
    .update({ invite_code: newCode })
    .eq('id', groupId)
    .eq('owner_id', ownerId)
  if (error) throw error
  if (count === 0) throw new Error('권한이 없거나 그룹이 존재하지 않습니다.')
  return newCode
}
