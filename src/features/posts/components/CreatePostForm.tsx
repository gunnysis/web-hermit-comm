'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import dynamic from 'next/dynamic'
import { postSchema, type PostFormValues } from '@/lib/schemas'
import { createPost } from '../api/postsApi'
import { uploadPostImage, validateImageFile, ImageValidationError } from '../api/uploadImage'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { resolveDisplayName } from '@/lib/anonymous'
import { DEFAULT_PUBLIC_BOARD_ID } from '@/lib/constants'
import { useQueryClient } from '@tanstack/react-query'

const RichEditor = dynamic(() => import('./RichEditor').then(m => m.RichEditor), {
  ssr: false,
  loading: () => <div className="h-40 rounded-md border border-input bg-muted animate-pulse" />,
})

export function CreatePostForm() {
  const router = useRouter()
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<PostFormValues>({
      resolver: zodResolver(postSchema),
      defaultValues: { is_anonymous: true },
    })

  const content = watch('content') ?? ''

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      validateImageFile(file)
    } catch (err) {
      if (err instanceof ImageValidationError) {
        toast.error(err.message)
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit = async (values: PostFormValues) => {
    if (!user) { toast.error('로그인이 필요합니다.'); return }
    setIsSubmitting(true)
    try {
      let image_url: string | undefined
      if (imageFile) {
        image_url = await uploadPostImage(imageFile, user.id)
      }

      const display_name = resolveDisplayName(user.id, DEFAULT_PUBLIC_BOARD_ID, true)
      const post = await createPost({
        title: values.title,
        content: values.content,
        author: display_name,
        author_id: user.id,
        board_id: DEFAULT_PUBLIC_BOARD_ID,
        is_anonymous: true,
        display_name,
        image_url,
      })

      queryClient.invalidateQueries({ queryKey: ['boardPosts', DEFAULT_PUBLIC_BOARD_ID] })
      toast.success('게시글이 등록됐습니다.')
      router.push(`/post/${post.id}`)
    } catch {
      toast.error('게시글 등록에 실패했습니다.')
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
          placeholder="제목"
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
          placeholder="내용을 입력하세요..."
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
      </div>

      {/* 이미지 첨부 */}
      <div>
        {imagePreview ? (
          <div className="relative w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="첨부 이미지 미리보기"
              className="max-h-48 rounded-md object-contain border"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={handleRemoveImage}
            >
              <X size={12} />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus size={15} className="mr-1" /> 이미지 첨부
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
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
