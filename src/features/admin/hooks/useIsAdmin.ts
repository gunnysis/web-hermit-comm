import { useQuery } from '@tanstack/react-query'
import { checkAppAdmin } from '../api/adminApi'

export function useIsAdmin(userId: string | null) {
  return useQuery({
    queryKey: ['isAdmin', userId],
    queryFn: () => checkAppAdmin(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,
  })
}
