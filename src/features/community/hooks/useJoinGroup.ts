import { useMutation, useQueryClient } from '@tanstack/react-query'
import { joinGroupByInviteCode } from '../api/communityApi'

export function useJoinGroup(userId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (inviteCode: string) => {
      if (!userId) throw new Error('로그인이 필요합니다.')
      return joinGroupByInviteCode(inviteCode, userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGroups', userId] })
    },
  })
}
