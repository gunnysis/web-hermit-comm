import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createDailyPost, updateDailyPost } from '@/features/posts/api/postsApi'

export function useCreateDaily() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDailyPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayDaily'] })
      queryClient.invalidateQueries({ queryKey: ['boardPosts'] })
    },
  })
}

export function useUpdateDaily() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateDailyPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayDaily'] })
      queryClient.invalidateQueries({ queryKey: ['boardPosts'] })
    },
  })
}
