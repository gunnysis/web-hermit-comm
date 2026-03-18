import { useQuery } from '@tanstack/react-query'
import { getMyAlias } from '../api/myApi'

export function useMyAlias(enabled = true) {
  return useQuery({
    queryKey: ['myAlias'],
    queryFn: getMyAlias,
    enabled,
    staleTime: 60 * 60 * 1000,
    meta: { silent: true },
  })
}
