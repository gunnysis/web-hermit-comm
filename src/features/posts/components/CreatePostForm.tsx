'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import dynamic from 'next/dynamic'
import { postSchema, type PostFormValues } from '@/lib/schemas'
import { createPost } from '../api/postsApi'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { resolveDisplayName } from '@/lib/anonymous'
import { DEFAULT_PUBLIC_BOARD_ID, POETRY_BOARD_ID } from '@/lib/constants'
import { useQueryClient } from '@tanstack/react-query'

const RichEditor = dynamic(() => import('./RichEditor').then(m => m.RichEditor), {
  ssr: false,
  loading: () => <div className="h-40 rounded-md border border-input bg-muted animate-pulse" />,
})

interface CreatePostFormProps {
  boardId?: number
}

export function CreatePostForm({ boardId = DEFAULT_PUBLIC_BOARD_ID }: CreatePostFormProps) {
  const router = useRouter()
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isPoetry = boardId === POETRY_BOARD_ID

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<PostFormValues>({
      resolver: zodResolver(postSchema),
      defaultValues: { is_anonymous: true },
    })

  const content = watch('content') ?? ''

  const onSubmit = async (values: PostFormValues) => {
    if (!user) { toast.error('로그인이 필요합니다.'); return }
    setIsSubmitting(true)
    try {
      const display_name = resolveDisplayName(user.id, boardId, true)
      const post = await createPost({
        title: values.title,
        content: values.content,
        author_id: user.id,
        board_id: boardId,
        is_anonymous: true,
        display_name,
      })

      queryClient.invalidateQueries({ queryKey: ['boardPosts', boardId] })
      toast.success(isPoetry ? '시가 등록됐습니다.' : '게시글이 등록됐습니다.')
      router.push(`/post/${post.id}`)
    } catch {
      toast.error(isPoetry ? '시 등록에 실패했습니다.' : '게시글 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-muted-foreground">글을 작성하려면 로그인이 필요합니다.</p>
        <Button variant="outline" onClick={() => router.push('/login')}>로그인</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 제목 */}
      <div className="space-y-1">
        <Input
          {...register('title')}
          placeholder={isPoetry ? '시의 제목' : '제목'}
          className="text-base font-medium"
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* 본문 에디터 */}
      <div className="space-y-1">
        <RichEditor
          value={content}
          onChange={(html) => setValue('content', html, { shouldValidate: true })}
          placeholder={isPoetry ? '시를 작성해보세요...' : '내용을 입력하세요...'}
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting || !user}>
          {isSubmitting ? '등록 중...' : '등록'}
        </Button>
      </div>
    </form>
  )
}
