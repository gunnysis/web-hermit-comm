import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blockUser, unblockUser, getBlockedAliases } from '../api/blocksApi'
import { logger } from '@/lib/logger'

export function useBlockedAliases(enabled = true) {
  return useQuery({
    queryKey: ['blockedAliases'],
    queryFn: getBlockedAliases,
    staleTime: 5 * 60 * 1000,
    enabled,
    meta: { silent: true },
  })
}

export function useBlockUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blockedAliases'] })
      qc.invalidateQueries({ queryKey: ['boardPosts'] })
    },
    onError: (error) => {
      logger.error('[useBlockUser]', error)
    },
  })
}

export function useUnblockUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blockedAliases'] })
      qc.invalidateQueries({ queryKey: ['boardPosts'] })
    },
    onError: (error) => {
      logger.error('[useUnblockUser]', error)
    },
  })
}
