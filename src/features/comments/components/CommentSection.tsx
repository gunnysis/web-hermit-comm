'use client'

import { useMemo, useState, useCallback } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useComments } from '../hooks/useComments'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'

interface CommentSectionProps {
  postId: number
  userId: string | null
  boardId?: number
}

export function CommentSection({ postId, userId, boardId }: CommentSectionProps) {
  const { query, createMutation, updateMutation, deleteMutation } = useComments(postId)
  const [replyTo, setReplyTo] = useState<{ commentId: number; displayName: string } | null>(null)

  const handleReply = useCallback((commentId: number, displayName: string) => {
    setReplyTo({ commentId, displayName })
  }, [])

  const handleCancelReply = useCallback(() => {
    setReplyTo(null)
  }, [])

  const { topLevel, repliesMap } = useMemo(() => {
    const comments = query.data ?? []
    const top = comments.filter(c => !c.parent_id)
    const replies: Record<number, typeof comments> = {}
    for (const c of comments) {
      if (c.parent_id) {
        if (!replies[c.parent_id]) replies[c.parent_id] = []
        replies[c.parent_id].push(c)
      }
    }
    return { topLevel: top, repliesMap: replies }
  }, [query.data])

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">
        댓글 {query.data ? `${query.data.length}개` : ''}
      </h3>

      <CommentForm
        userId={userId}
        boardId={boardId}
        createMutation={createMutation}
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
      />

      <Separator />

      {query.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      )}

      {query.data?.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          아직 댓글이 없습니다.
        </p>
      )}

      {topLevel.map((comment) => (
        <div key={comment.id}>
          <CommentItem
            comment={comment}
            currentUserId={userId}
            updateMutation={updateMutation}
            deleteMutation={deleteMutation}
            onReply={handleReply}
          />
          {repliesMap[comment.id]?.map((reply) => (
            <div key={reply.id} className="pl-8">
              <CommentItem
                comment={reply}
                currentUserId={userId}
                updateMutation={updateMutation}
                deleteMutation={deleteMutation}
                isReply
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
