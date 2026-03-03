'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { postSchema, type PostFormValues } from '@/lib/schemas'
import { updatePost } from '../api/postsApi'
import { usePostDetail } from '../hooks/usePostDetail'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { useQueryClient } from '@tanstack/react-query'

const RichEditor = dynamic(() => import('./RichEditor').then(m => m.RichEditor), {
  ssr: false,
  loading: () => <div className="h-40 rounded-md border border-input bg-muted animate-pulse" />,
})

interface EditPostFormProps {
  postId: number
}

export function EditPostForm({ postId }: EditPostFormProps) {
  const router = useRouter()
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const { data: post, isLoading } = usePostDetail(postId)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
    useForm<PostFormValues>({
      resolver: zodResolver(postSchema),
    })

  const content = watch('content') ?? ''

  useEffect(() => {
    if (post) {
      reset({ title: post.title, content: post.content })
    }
  }, [post, reset])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!post || user?.id !== post.author_id) {
    return <p className="text-muted-foreground">수정 권한이 없습니다.</p>
  }

  const onSubmit = async (values: PostFormValues) => {
    setIsSubmitting(true)
    try {
      await updatePost(postId, { title: values.title, content: values.content })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      if (post.board_id) queryClient.invalidateQueries({ queryKey: ['boardPosts', post.board_id] })
      if (post.group_id) queryClient.invalidateQueries({ queryKey: ['groupPosts', post.group_id] })
      toast.success('게시글이 수정됐습니다.')
      router.push(`/post/${postId}`)
    } catch {
      toast.error('수정에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Input
          {...register('title')}
          placeholder="제목"
          className="text-base font-medium"
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1">
        <RichEditor
          value={content}
          onChange={(html) => setValue('content', html, { shouldValidate: true })}
        />
        {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()}>취소</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  )
}
