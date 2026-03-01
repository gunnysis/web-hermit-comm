'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getReactions, getUserReactions, toggleReaction } from '../api/reactionsApi'
import type { Reaction } from '@/types/database'

export function useReactions(postId: number, userId: string | null) {
  const queryClient = useQueryClient()

  const reactionsQuery = useQuery({
    queryKey: ['reactions', postId],
    queryFn: () => getReactions(postId),
    staleTime: 10 * 1000,
  })

  const userReactionsQuery = useQuery({
    queryKey: ['userReactions', postId, userId],
    queryFn: () => getUserReactions(postId, userId!),
    enabled: !!userId,
    staleTime: 10 * 1000,
  })

  // Realtime 구독
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`reactions-${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions', filter: `post_id=eq.${postId}` },
        () => queryClient.invalidateQueries({ queryKey: ['reactions', postId] }),
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [postId, queryClient])

  const toggleMutation = useMutation({
    mutationFn: ({ reactionType }: { reactionType: string }) => {
      if (!userId) throw new Error('로그인이 필요합니다')
      return toggleReaction(postId, userId, reactionType)
    },
    // 낙관적 업데이트
    onMutate: async ({ reactionType }) => {
      await queryClient.cancelQueries({ queryKey: ['reactions', postId] })
      await queryClient.cancelQueries({ queryKey: ['userReactions', postId, userId] })

      const prevReactions = queryClient.getQueryData<Reaction[]>(['reactions', postId])
      const prevUserReactions = queryClient.getQueryData<string[]>(['userReactions', postId, userId])

      const isActive = (prevUserReactions ?? []).includes(reactionType)
      const delta = isActive ? -1 : 1

      // reactions 카운트 즉시 반영
      queryClient.setQueryData<Reaction[]>(['reactions', postId], (old = []) => {
        const existing = old.find(r => r.reaction_type === reactionType)
        if (existing) {
          return old.map(r =>
            r.reaction_type === reactionType
              ? { ...r, count: Math.max(0, r.count + delta) }
              : r,
          )
        }
        return [...old, { id: -1, post_id: postId, reaction_type: reactionType, count: 1 }]
      })

      // 내 반응 즉시 반영
      queryClient.setQueryData<string[]>(['userReactions', postId, userId], (old = []) =>
        isActive ? old.filter(t => t !== reactionType) : [...old, reactionType],
      )

      return { prevReactions, prevUserReactions }
    },
    onError: (_err, _vars, context) => {
      if (context?.prevReactions !== undefined)
        queryClient.setQueryData(['reactions', postId], context.prevReactions)
      if (context?.prevUserReactions !== undefined)
        queryClient.setQueryData(['userReactions', postId, userId], context.prevUserReactions)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', postId] })
      queryClient.invalidateQueries({ queryKey: ['userReactions', postId, userId] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
  })

  return {
    reactions: reactionsQuery.data ?? [],
    userReactions: userReactionsQuery.data ?? [],
    toggle: (reactionType: string) => toggleMutation.mutate({ reactionType }),
    isPending: toggleMutation.isPending,
  }
}
