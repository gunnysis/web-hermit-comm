import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyManagedGroups, deleteGroup } from '../api/adminApi'

export function useAdminGroups(userId: string | null) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['admin', 'myManagedGroups', userId],
    queryFn: () => getMyManagedGroups(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: (groupId: number) => deleteGroup(groupId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'myManagedGroups', userId] }),
  })

  return { query, deleteMutation }
}
