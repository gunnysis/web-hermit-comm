import { useQuery } from '@tanstack/react-query'
import { getActivitySummary } from '../api/myApi'

export function useActivitySummary(enabled = true) {
  return useQuery({
    queryKey: ['activitySummary'],
    queryFn: getActivitySummary,
    enabled,
    staleTime: 60 * 1000,
  })
}
