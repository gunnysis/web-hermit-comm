'use client'

import { useEffect, useRef, useState } from 'react'
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
import { DEFAULT_PUBLIC_BOARD_ID } from '@/lib/constants'
import { useQueryClient } from '@tanstack/react-query'
import { useDraft } from '../hooks/useDraft'

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
  const { saveDraft, loadDraft, clearDraft, status: draftStatus } = useDraft(boardId)
  const draftCheckedRef = useRef(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<PostFormValues>({
      resolver: zodResolver(postSchema),
      defaultValues: { is_anonymous: true },
    })

  const title = watch('title') ?? ''
  const content = watch('content') ?? ''

  // 임시저장 자동 저장
  useEffect(() => {
    saveDraft({ title, content })
  }, [title, content, saveDraft])

  // 작성 중 이탈 경고 (브라우저 뒤로가기/새로고침/탭 닫기)
  useEffect(() => {
    const hasContent = title.trim() || content.replace(/<[^>]*>/g, '').trim()
    if (!hasContent) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [title, content])

  // 임시저장 복원
  useEffect(() => {
    if (draftCheckedRef.current) return
    draftCheckedRef.current = true
    const draft = loadDraft()
    if (!draft) return
    if (!draft.title?.trim() && !draft.content?.trim()) return
    toast('임시저장된 글이 있습니다.', {
      action: {
        label: '복원',
        onClick: () => {
          if (draft.title) setValue('title', draft.title)
          if (draft.content) setValue('content', draft.content)
        },
      },
    })
  }, [loadDraft, setValue])

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

      clearDraft()
      queryClient.invalidateQueries({ queryKey: ['boardPosts', boardId] })
      toast.success('게시글이 등록됐습니다.')
      router.push(`/post/${post.id}`)
    } catch (err) {
      const isNetwork = err instanceof TypeError && err.message === 'Failed to fetch'
      toast.error(isNetwork ? '네트워크 연결을 확인해주세요.' : '게시글 등록에 실패했습니다.')
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

  const draftLabel =
    draftStatus === 'saved' ? '☁️ 저장됨' : draftStatus === 'saving' ? '✏️ 저장 중...' : ''

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* 헤더 + 저장 상태 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">✍️ 게시글 작성</h1>
          <p className="text-sm text-muted-foreground mt-1">따뜻한 이야기를 나눠주세요</p>
        </div>
        {draftLabel && (
          <span className="text-xs text-muted-foreground/60">{draftLabel}</span>
        )}
      </div>

      {/* 제목 */}
      <div className="space-y-1">
        <Input
          {...register('title')}
          placeholder="멋진 제목을 입력하세요 ✨"
          className="text-base font-medium"
          maxLength={100}
        />
        <div className="flex justify-between">
          {errors.title ? (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          ) : <span />}
          <span className={`text-[11px] tabular-nums ${title.length > 90 ? 'text-amber-500' : 'text-muted-foreground/50'}`}>
            {title.length}/100
          </span>
        </div>
      </div>

      {/* 본문 에디터 */}
      <div className="space-y-1">
        <RichEditor
          value={content}
          onChange={(html) => setValue('content', html, { shouldValidate: true })}
          placeholder="이야기를 들려주세요 💭"
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
      </div>

      {/* 안내 */}
      <p className="text-xs text-muted-foreground/60">
        모든 게시글은 익명으로 작성됩니다. 게시판별 고유 별칭이 자동 부여돼요.
      </p>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting || !user}>
          {isSubmitting ? '등록 중...' : '작성하기 🎨'}
        </Button>
      </div>
    </form>
  )
}
