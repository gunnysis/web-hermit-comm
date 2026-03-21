'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, MoreHorizontal, Pencil, Trash2, Share2, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { startViewTransition } from '@/lib/view-transition'
import type { Post } from '@/types/database'
import type { User } from '@supabase/supabase-js'

interface PostDetailHeaderProps {
  postId: number
  post: Post
  user: User | null
  isOwnPost: boolean
  onDelete: () => void
  onBlock: (alias: string) => void
}

export function PostDetailHeader({ postId, post, user, isOwnPost, onDelete, onBlock }: PostDetailHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          startViewTransition(() => {
            if (window.history.length > 1) {
              router.back()
            } else {
              router.push('/')
            }
          }, 'back')
        }}
        className="-ml-2"
      >
        <ArrowLeft size={16} className="mr-1" /> 뒤로
      </Button>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="공유"
          onClick={async () => {
            const url = `${window.location.origin}/post/${postId}`
            if (navigator.share) {
              try { await navigator.share({ title: post.title, url }) } catch { /* cancelled */ }
            } else {
              await navigator.clipboard.writeText(url)
              toast.success('링크가 복사됐습니다.')
            }
          }}
        >
          <Share2 size={16} />
        </Button>
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="더보기">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwnPost && (
              <>
                <DropdownMenuItem onClick={() => {
                  if (post.post_type === 'daily') {
                    router.push(`/create?type=daily&edit=${postId}`)
                  } else {
                    router.push(`/post/${postId}/edit`)
                  }
                }}>
                  <Pencil size={14} className="mr-2" /> 수정
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 size={14} className="mr-2" /> 삭제
                </DropdownMenuItem>
              </>
            )}
            {!isOwnPost && post.display_name && post.display_name !== '익명' && (
              <DropdownMenuItem
                onClick={() => onBlock(post.display_name)}
                className="text-destructive focus:text-destructive"
              >
                <Ban size={14} className="mr-2" /> 차단
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      </div>
    </div>
  )
}
