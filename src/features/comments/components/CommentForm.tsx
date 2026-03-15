'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { useComments } from '../hooks/useComments'
import { resolveDisplayName } from '@/lib/anonymous'
import { DEFAULT_PUBLIC_BOARD_ID } from '@/lib/constants'

interface CommentFormProps {
  userId: string | null
  boardId?: number
  createMutation: ReturnType<typeof useComments>['createMutation']
  replyTo?: { commentId: number; displayName: string } | null
  onCancelReply?: () => void
}

export function CommentForm({ userId, boardId = DEFAULT_PUBLIC_BOARD_ID, createMutation, replyTo, onCancelReply }: CommentFormProps) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (replyTo) {
      textareaRef.current?.focus()
    }
  }, [replyTo])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || content.length > 2000 || !userId) return

    const display_name = resolveDisplayName(userId, `${boardId}-comment`, true)

    createMutation.mutate(
      {
        request: {
          content: content.trim(),
          author_id: userId,
          board_id: boardId,
          is_anonymous: true,
          display_name,
        },
        parentId: replyTo?.commentId ?? null,
      },
      {
        onSuccess: () => {
          setContent('')
          onCancelReply?.()
        },
      },
    )
  }

  if (!userId) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        댓글을 작성하려면{' '}
        <Link href="/login" className="text-primary underline underline-offset-2">로그인</Link>
        이 필요합니다.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {replyTo && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-1.5">
          <span>{replyTo.displayName}에게 답글 작성 중</span>
          <button type="button" onClick={onCancelReply} className="ml-auto" aria-label="답글 취소">
            <X size={12} />
          </button>
        </div>
      )}
      <Textarea
        ref={textareaRef}
        placeholder={replyTo ? '답글을 입력하세요...' : '댓글을 입력하세요...'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        maxLength={2000}
        className="text-sm resize-none"
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs ${content.length > 1800 ? 'text-destructive' : 'text-muted-foreground'}`}>
          {content.length > 0 ? `${content.length}/2000` : ''}
        </span>
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || createMutation.isPending}
        >
          {replyTo ? '답글 등록' : '댓글 등록'}
        </Button>
      </div>
    </form>
  )
}
