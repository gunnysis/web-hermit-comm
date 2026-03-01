import { useQuery } from '@tanstack/react-query'
import { getGroupBoards } from '../api/communityApi'

export function useGroupBoards(groupId: number) {
  return useQuery({
    queryKey: ['groupBoards', groupId],
    queryFn: () => getGroupBoards(groupId),
    staleTime: 5 * 60 * 1000,
  })
}
