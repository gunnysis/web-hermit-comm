import { useQuery } from '@tanstack/react-query'
import { getEmotionTrend } from '../api/postsApi'

export function useEmotionTrend(days = 7) {
  return useQuery({
    queryKey: ['emotionTrend', days],
    queryFn: () => getEmotionTrend(days),
    staleTime: 5 * 60 * 1000,
  })
}
