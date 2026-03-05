import { useQuery } from '@tanstack/react-query'
import { getTrendingPosts } from '../api/postsApi'

export function useTrendingPosts() {
  return useQuery({
    queryKey: ['trendingPosts'],
    queryFn: async () => {
      const posts = await getTrendingPosts(72, 10)
      if (posts.length < 3) {
        return getTrendingPosts(720, 10)
      }
      return posts
    },
    staleTime: 5 * 60 * 1000,
  })
}
