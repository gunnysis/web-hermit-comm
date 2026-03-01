import { useQuery } from '@tanstack/react-query'
import { getMyGroups } from '../api/communityApi'

export function useMyGroups(userId: string | null) {
  return useQuery({
    queryKey: ['myGroups', userId],
    queryFn: () => getMyGroups(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  })
}
