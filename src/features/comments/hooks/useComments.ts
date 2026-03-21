'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { getComments, createComment, updateComment, deleteComment } from '../api/commentsApi'
import type { Comment, CreateCommentRequest } from '@/types/database'

export function useComments(postId: number) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getComments(postId),
    staleTime: 30 * 1000,
  })

  useRealtimeTable({
    channelName: `comments-${postId}`,
    table: 'comments',
    filter: `post_id=eq.${postId}`,
    queryKeys: [['comments', postId]],
  })

  const createMutation = useMutation({
    mutationFn: (args: { request: CreateCommentRequest & { author_id: string }; parentId?: number | null }) =>
      createComment(postId, args.request, args.parentId),
    onMutate: async ({ request, parentId }) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] })
      const prev = queryClient.getQueryData<Comment[]>(['comments', postId])

      // 낙관적으로 댓글 즉시 추가
      const optimisticComment: Comment = {
        id: -Date.now(),
        post_id: postId,
        content: request.content,
        author_id: request.author_id,
        board_id: request.board_id ?? null,
        is_anonymous: request.is_anonymous ?? true,
        display_name: request.display_name ?? '익명',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        parent_id: parentId ?? null,
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
