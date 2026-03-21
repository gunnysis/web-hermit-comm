import { useQuery } from '@tanstack/react-query'
import { getTodayDaily } from '../api/myApi'

export function useTodayDaily(enabled = true) {
  return useQuery({
    queryKey: ['todayDaily'],
    queryFn: getTodayDaily,
    enabled,
    staleTime: 60_000,
  })
}
