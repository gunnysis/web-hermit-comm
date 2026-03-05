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
import { MoodSelector } from '@/features/posts/components/MoodSelector'
import { createGroupPost } from '../api/communityApi'
import { uploadPostImage } from '@/features/posts/api/uploadImage'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { resolveDisplayName } from '@/lib/anonymous'
import { useGroupBoards } from '../hooks/useGroupBoards'
import { useQueryClient } from '@tanstack/react-query'

const RichEditor = dynamic(() => import('@/features/posts/components/RichEditor').then(m => m.RichEditor), {
  ssr: false,
  loading: () => <div className="h-40 rounded-md border border-input bg-muted animate-pulse" />,
})

interface CreateGroupPostFormProps {
  groupId: number
}

export function CreateGroupPostForm({ groupId }: CreateGroupPostFormProps) {
  const router = useRouter()
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const { data: boards } = useGroupBoards(groupId)
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialEmotions, setInitialEmotions] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeBoardId = selectedBoardId ?? boards?.[0]?.id ?? null

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<PostFormValues>({
      resolver: zodResolver(postSchema),
      defaultValues: { is_anonymous: true },
    })

  const content = watch('content') ?? ''

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const onSubmit = async (values: PostFormValues) => {
    if (!user || !activeBoardId) { toast.error('게시판을 선택해주세요.'); return }
    setIsSubmitting(true)
    try {
      let image_url: string | undefined
      if (imageFile) image_url = await uploadPostImage(imageFile, user.id)

      const display_name = resolveDisplayName(user.id, `${groupId}-${activeBoardId}`, true)
      const post = await createGroupPost({
        title: values.title,
        content: values.content,
        author_id: user.id,
        board_id: activeBoardId,
        group_id: groupId,
        is_anonymous: true,
        display_name,
        image_url,
        initial_emotions: initialEmotions.length > 0 ? initialEmotions : undefined,
      })

      queryClient.invalidateQueries({ queryKey: ['groupPosts', groupId] })
      toast.success('게시글이 등록됐습니다.')
      router.push(`/post/${post.id}`)
    } catch {
      toast.error('게시글 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 게시판 선택 */}
      {boards && boards.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {boards.map((board) => (
            <button
              key={board.id}
              type="button"
              onClick={() => setSelectedBoardId(board.id)}
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                activeBoardId === board.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input hover:bg-accent'
              }`}
            >
              {board.name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1">
        <Input {...register('title')} placeholder="제목" className="text-base font-medium" />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1">
        <RichEditor value={content} onChange={(html) => setValue('content', html, { shouldValidate: true })} placeholder="내용을 입력하세요..." />
        {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-muted-foreground">지금 어떤 마음인가요? (선택)</label>
        <MoodSelector value={initialEmotions} onChange={setInitialEmotions} />
      </div>

      <div>
        {imagePreview ? (
          <div className="relative w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="첨부 이미지" className="max-h-48 rounded-md object-contain border" />
            <Button type="button" size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}>
              <X size={12} />
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <ImagePlus size={15} className="mr-1" /> 이미지 첨부
          </Button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()}>취소</Button>
        <Button type="submit" disabled={isSubmitting || !user}>
          {isSubmitting ? '등록 중...' : '등록'}
        </Button>
      </div>
    </form>
  )
}
