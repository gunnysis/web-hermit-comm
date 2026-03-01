'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getComments, createComment, updateComment, deleteComment } from '../api/commentsApi'
import type { Comment, CreateCommentRequest } from '@/types/database'

export function useComments(postId: number) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getComments(postId),
    staleTime: 30 * 1000,
  })

  // Realtime 구독
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [postId, queryClient])

  const createMutation = useMutation({
    mutationFn: (args: { request: CreateCommentRequest & { author_id: string } }) =>
      createComment(postId, args.request),
    onMutate: async ({ request }) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] })
      const prev = queryClient.getQueryData<Comment[]>(['comments', postId])

      // 낙관적으로 댓글 즉시 추가
      const optimisticComment: Comment = {
        id: -Date.now(),
        post_id: postId,
        content: request.content,
        author: request.author,
        author_id: request.author_id,
        board_id: request.board_id ?? null,
        group_id: request.group_id ?? null,
        is_anonymous: request.is_anonymous ?? true,
        display_name: request.display_name ?? request.author,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      }

      queryClient.setQueryData<Comment[]>(['comments', postId], old =>
        [...(old ?? []), optimisticComment],
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev !== undefined)
        queryClient.setQueryData(['comments', postId], context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateComment(commentId, content),
    onMutate: async ({ commentId, content }) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] })
      const prev = queryClient.getQueryData<Comment[]>(['comments', postId])
      queryClient.setQueryData<Comment[]>(['comments', postId], old =>
        (old ?? []).map(c => c.id === commentId ? { ...c, content } : c),
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev !== undefined)
        queryClient.setQueryData(['comments', postId], context.prev)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] })
      const prev = queryClient.getQueryData<Comment[]>(['comments', postId])
      queryClient.setQueryData<Comment[]>(['comments', postId], old =>
        (old ?? []).filter(c => c.id !== commentId),
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      if (context?.prev !== undefined)
        queryClient.setQueryData(['comments', postId], context.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
  })

  return { query, createMutation, updateMutation, deleteMutation }
}
