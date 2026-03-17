import { useQuery } from '@tanstack/react-query'
import { getEmotionTimeline } from '../api/myApi'

export function useEmotionTimeline(days = 7, enabled = true) {
  return useQuery({
    queryKey: ['emotionTimeline', days],
    queryFn: () => getEmotionTimeline(days),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
