import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blockUser, getBlockedAliases } from '../api/blocksApi'

export function useBlockedAliases() {
  return useQuery({
    queryKey: ['blockedAliases'],
    queryFn: getBlockedAliases,
    staleTime: 5 * 60 * 1000,
  })
}

export function useBlockUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: blockUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blockedAliases'] }),
  })
}
