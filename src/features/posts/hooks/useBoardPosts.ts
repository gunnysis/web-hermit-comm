import { useInfiniteQuery } from '@tanstack/react-query'
import { getBoardPosts } from '../api/postsApi'
import { PAGE_SIZE } from '@/lib/constants'

export function useBoardPosts(
  boardId: number,
  sortOrder: 'latest' | 'popular' = 'latest',
) {
  return useInfiniteQuery({
    queryKey: ['boardPosts', boardId, sortOrder],
    queryFn: ({ pageParam }) => getBoardPosts(boardId, pageParam as number, sortOrder),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length,
    staleTime: 30 * 1000,
  })
}
