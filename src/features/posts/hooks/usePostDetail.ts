import { useQuery } from '@tanstack/react-query'
import { getPost } from '../api/postsApi'

export function usePostDetail(postId: number) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost(postId),
    staleTime: 30 * 1000,
  })
}
