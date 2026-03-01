import { useInfiniteQuery } from '@tanstack/react-query'
import { getGroupPosts } from '../api/communityApi'

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
      lastPage.length < 20 ? undefined : allPages.length,
    staleTime: 30 * 1000,
  })
}
