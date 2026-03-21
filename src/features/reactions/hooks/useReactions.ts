'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { getPostReactions, toggleReaction } from '../api/reactionsApi'
import type { ReactionData } from '../api/reactionsApi'

export function useReactions(postId: number, userId: string | null) {
  const queryClient = useQueryClient()

  const reactionsQuery = useQuery({
    queryKey: ['postReactions', postId],
    queryFn: () => getPostReactions(postId),
    staleTime: 10 * 1000,
  })

  useRealtimeTable({
    channelName: `reactions-${postId}`,
    table: 'reactions',
    filter: `post_id=eq.${postId}`,
    queryKeys: [['postReactions', postId]],
  })

  const toggleMutation = useMutation({
    mutationFn: ({ reactionType }: { reactionType: string }) => {
      if (!userId) throw new Error('로그인이 필요합니다')
      return toggleReaction(postId, reactionType)
    },
    // 낙관적 업데이트
    onMutate: async ({ reactionType }) => {
      await queryClient.cancelQueries({ queryKey: ['postReactions', postId] })

      const prevReactions = queryClient.getQueryData<ReactionData[]>(['postReactions', postId])

      const existing = (prevReactions ?? []).find(r => r.reaction_type === reactionType)
      const isActive = existing?.user_reacted ?? false
      const delta = isActive ? -1 : 1

      queryClient.setQueryData<ReactionData[]>(['postReactions', postId], (old = []) => {
        const found = old.find(r => r.reaction_type === reactionType)
        if (found) {
          return old.map(r =>
            r.reaction_type === reactionType
              ? { ...r, count: Math.max(0, r.count + delta), user_reacted: !isActive }
              : r,
          )
        }
        return [...old, { reaction_type: reactionType, count: 1, user_reacted: true }]
      })

      return { prevReactions }
    },
    onError: (_err, _vars, context) => {
      if (context?.prevReactions !== undefined)
        queryClient.setQueryData(['postReactions', postId], context.prevReactions)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['postReactions', postId] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
  })

  return {
    reactions: reactionsQuery.data ?? [],
    toggle: (reactionType: string) => toggleMutation.mutate({ reactionType }),
    isPending: toggleMutation.isPending,
  }
}
