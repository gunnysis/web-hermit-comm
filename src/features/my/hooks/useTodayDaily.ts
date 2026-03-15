import { useQuery } from '@tanstack/react-query'
import { getTodayDaily } from '@/features/posts/api/postsApi'

export function useTodayDaily(enabled = true) {
  return useQuery({
    queryKey: ['todayDaily'],
    queryFn: getTodayDaily,
    enabled,
    staleTime: 0,
  })
}
