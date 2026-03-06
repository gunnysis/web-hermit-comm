'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useComments } from '../hooks/useComments'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'

interface CommentSectionProps {
  postId: number
  userId: string | null
  boardId?: number
  groupId?: number
}

export function CommentSection({ postId, userId, boardId, groupId }: CommentSectionProps) {
  const { query, createMutation, updateMutation, deleteMutation } = useComments(postId)

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">
        댓글 {query.data ? `${query.data.length}개` : ''}
      </h3>

      <CommentForm userId={userId} boardId={boardId} groupId={groupId} createMutation={createMutation} />

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

      {query.data?.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={userId}
          updateMutation={updateMutation}
          deleteMutation={deleteMutation}
        />
      ))}
    </div>
  )
}
