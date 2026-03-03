'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'
import type { Comment } from '@/types/database'
import type { useComments } from '../hooks/useComments'

interface CommentItemProps {
  comment: Comment
  currentUserId: string | null
  updateMutation: ReturnType<typeof useComments>['updateMutation']
  deleteMutation: ReturnType<typeof useComments>['deleteMutation']
}

export function CommentItem({ comment, currentUserId, updateMutation, deleteMutation }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const canEdit = currentUserId === comment.author_id

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: ko,
  })

  const handleUpdate = () => {
    if (!editContent.trim()) return
    updateMutation.mutate(
      { commentId: comment.id, content: editContent.trim() },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  const handleDelete = () => {
    deleteMutation.mutate(comment.id, {
      onError: () => toast.error('댓글 삭제에 실패했습니다.'),
      onSettled: () => setDeleteDialogOpen(false),
    })
  }

  return (
    <div className="py-3 border-b last:border-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.display_name}</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        {canEdit && !isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="댓글 더보기">
                <MoreHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil size={14} className="mr-2" /> 수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 size={14} className="mr-2" /> 삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={2}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              저장
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              취소
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
      )}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="댓글을 삭제할까요?"
        confirmLabel="삭제"
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
