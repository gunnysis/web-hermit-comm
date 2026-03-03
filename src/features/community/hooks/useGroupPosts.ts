import { useInfiniteQuery } from '@tanstack/react-query'
import { getGroupPosts } from '../api/communityApi'
import { PAGE_SIZE } from '@/lib/constants'

export function useGroupPosts(
  groupId: number,
  boardId: number | null,
  sortOrder: 'latest' | 'popular' = 'latest',
) {
  return useInfiniteQuery({
    queryKey: ['groupPosts', groupId, boardId, sortOrder],
    queryFn: ({ pageParam }) => getGroupPosts(groupId, boardId, pageParam as number, sortOrder),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length,
    staleTime: 30 * 1000,
  })
}
