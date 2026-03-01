'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useComments } from '../hooks/useComments'
import { resolveDisplayName } from '@/lib/anonymous'
import { DEFAULT_PUBLIC_BOARD_ID } from '@/lib/constants'

interface CommentFormProps {
  postId: number
  userId: string | null
  boardId?: number
}

export function CommentForm({ postId, userId, boardId = DEFAULT_PUBLIC_BOARD_ID }: CommentFormProps) {
  const [content, setContent] = useState('')
  const { createMutation } = useComments(postId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !userId) return

    const display_name = resolveDisplayName(userId, `${boardId}-comment`, true)

    createMutation.mutate(
      {
        request: {
          content: content.trim(),
          author: display_name,
          author_id: userId,
          board_id: boardId,
          is_anonymous: true,
          display_name,
        },
      },
      { onSuccess: () => setContent('') },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder={userId ? '댓글을 입력하세요...' : '로그인이 필요합니다'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        disabled={!userId}
        className="text-sm resize-none"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || !userId || createMutation.isPending}
        >
          댓글 등록
        </Button>
      </div>
    </form>
  )
}
