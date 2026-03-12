'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ArrowLeft, MoreHorizontal, Pencil, Trash2, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePostDetail } from '../hooks/usePostDetail'
import { usePostAnalysis } from '../hooks/usePostAnalysis'
import { deletePost } from '../api/postsApi'
import { EmotionTags } from './EmotionTags'
import { RecommendedPosts } from './RecommendedPosts'
import { ReactionBar } from '@/features/reactions/components/ReactionBar'
import { CommentSection } from '@/features/comments/components/CommentSection'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { toast } from 'sonner'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { EMOTION_COLOR_MAP } from '@/lib/constants'
import { getSimilarFeelingCount } from '../api/postsApi'
import { startViewTransition } from '@/lib/view-transition'
import { PostContent } from './PostContent'
import { logger } from '@/lib/logger'

interface PostDetailViewProps {
  postId: number
}

export function PostDetailView({ postId }: PostDetailViewProps) {
  const router = useRouter()
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const { data: post, isLoading, isError } = usePostDetail(postId)
  const { data: analysis, retryAnalysis } = usePostAnalysis(postId)

  const canEdit = user?.id === post?.author_id
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRetryingAnalysis, setIsRetryingAnalysis] = useState(false)
  const spinnerTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deletePost(postId)
      toast.success('게시글이 삭제됐습니다.')
      router.push('/')
      queryClient.removeQueries({ queryKey: ['post', postId] })
      if (post?.board_id) queryClient.invalidateQueries({ queryKey: ['boardPosts', post.board_id] })
    } catch (err: unknown) {
      logger.error('deletePost error:', err)
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message
      toast.error(msg || '삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleRetryAnalysis = useCallback(async () => {
    if (!post) return
    setIsRetryingAnalysis(true)
    try {
      await retryAnalysis()
      // 스피너는 데이터 도착(useEffect) 또는 타임아웃(5초)까지 유지
      spinnerTimeoutRef.current = setTimeout(() => {
        setIsRetryingAnalysis(false)
      }, 5000)
    } catch {
      toast.error('분석 요청에 실패했습니다.')
      setIsRetryingAnalysis(false)
    }
  }, [post, retryAnalysis])

  // 분석 데이터 도착 시 스피너 해제
  const emotions = analysis?.emotions ?? post?.emotions
  const hasEmotions = (emotions?.length ?? 0) > 0
  const primaryEmotion = emotions?.[0]
  const emotionColors = primaryEmotion ? EMOTION_COLOR_MAP[primaryEmotion] : null

  const { data: similarCount } = useQuery({
    queryKey: ['similarFeeling', postId],
    queryFn: () => getSimilarFeelingCount(postId),
    enabled: hasEmotions,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (hasEmotions && isRetryingAnalysis) {
      setIsRetryingAnalysis(false)
      clearTimeout(spinnerTimeoutRef.current)
    }
  }, [hasEmotions, isRetryingAnalysis])

  useEffect(() => {
    return () => clearTimeout(spinnerTimeoutRef.current)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8 rounded-full shimmer-delay-1" />
        </div>
        <Skeleton className="h-8 w-4/5 shimmer-delay-1" />
        <Skeleton className="h-4 w-32 shimmer-delay-2" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? 'w-3/4' : 'w-full'} shimmer-delay-${Math.min(i + 1, 4)}`} />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="text-center py-16 space-y-2">
        <p className="text-muted-foreground">게시글을 찾을 수 없습니다.</p>
        <Button variant="ghost" size="sm" onClick={() => router.push('/')}>홈으로</Button>
      </div>
    )
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ko,
  })

  return (
    <article className="space-y-4 animate-fade-in" style={{ viewTransitionName: 'page-content' }}>
      {/* 상단 내비게이션 */}
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
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="더보기">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/post/${postId}/edit`)}>
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
      </div>

      {/* 감정 그라데이션 밴드 */}
      {emotionColors && (
        <div
          className="rounded-xl px-4 py-3 -mx-1"
          style={{ background: `linear-gradient(135deg, ${emotionColors.gradient[0]}, ${emotionColors.gradient[1]})` }}
        >
          <h1 className="text-2xl font-bold leading-tight tracking-tight">{post.title}</h1>
          {(similarCount ?? 0) > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              지난 30일간 {similarCount}명이 비슷한 마음이었어요
            </p>
          )}
        </div>
      )}

      {/* 제목 및 메타 */}
      <header className="space-y-2">
        {!emotionColors && (
          <h1 className="text-2xl font-bold leading-tight tracking-tight">{post.title}</h1>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <span className="font-medium">{post.display_name}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.created_at}>{timeAgo}</time>
          {((post.like_count ?? 0) > 0 || (post.comment_count ?? 0) > 0) && (
            <>
              <span aria-hidden>·</span>
              {(post.like_count ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-happy-50 text-happy-700 dark:bg-happy-900/40 dark:text-happy-300">
                  👍 {post.like_count}
                </span>
              )}
              {(post.comment_count ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-lavender-50 text-lavender-700 dark:bg-lavender-900/40 dark:text-lavender-300">
                  💬 {post.comment_count}
                </span>
              )}
            </>
          )}
        </div>
        <EmotionTags emotions={emotions} clickable />
        {!hasEmotions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetryAnalysis}
            disabled={isRetryingAnalysis}
            className="gap-1 text-xs text-muted-foreground"
          >
            <RefreshCw size={12} className={isRetryingAnalysis ? 'animate-spin' : ''} />
            {isRetryingAnalysis ? '분석 중...' : '감정 분석 재시도'}
          </Button>
        )}
      </header>

      <Separator />

      {/* 이미지 */}
      {post.image_url && (
        <div className="relative w-full overflow-hidden rounded-xl">
          <Image
            src={post.image_url}
            alt="게시글 이미지"
            width={672}
            height={448}
            className="w-full object-contain max-h-[60vh] rounded-xl"
            priority
          />
        </div>
      )}

      {/* 본문 — prose 스타일 */}
      <PostContent html={post.content} />

      <Separator />

      {/* 반응 */}
      <ReactionBar postId={postId} userId={user?.id ?? null} />

      {/* 추천 게시글 */}
      <Separator />
      <RecommendedPosts postId={postId} hasEmotions={hasEmotions} />

      <Separator />

      {/* 댓글 */}
      <CommentSection
        postId={postId}
        userId={user?.id ?? null}
        boardId={post.board_id ?? undefined}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="게시글을 삭제할까요?"
        description="삭제한 게시글은 복구할 수 없습니다."
        confirmLabel="삭제"
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </article>
  )
}
