import { useQuery } from '@tanstack/react-query'
import { getRecommendedPosts } from '../api/postsApi'

export function useRecommendedPosts(postId: number, enabled = true) {
  return useQuery({
    queryKey: ['recommendedPosts', postId],
    queryFn: () => getRecommendedPosts(postId, 6),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
