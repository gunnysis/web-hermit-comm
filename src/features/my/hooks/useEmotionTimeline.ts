import { useQuery } from '@tanstack/react-query'
import { getEmotionTimeline } from '../api/myApi'

export function useEmotionTimeline(days = 7) {
  return useQuery({
    queryKey: ['emotionTimeline', days],
    queryFn: () => getEmotionTimeline(days),
    staleTime: 5 * 60 * 1000,
  })
}
