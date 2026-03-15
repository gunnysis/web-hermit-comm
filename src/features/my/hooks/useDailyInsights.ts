import { useQuery } from '@tanstack/react-query'
import { getDailyInsights } from '@/features/posts/api/postsApi'

export function useDailyInsights(days = 30, enabled = true) {
  return useQuery({
    queryKey: ['dailyInsights', days],
    queryFn: () => getDailyInsights(days),
    enabled,
    staleTime: 60 * 60 * 1000,
  })
}
