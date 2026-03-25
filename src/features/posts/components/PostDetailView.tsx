'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { usePostDetail } from '../hooks/usePostDetail'
import { usePostAnalysis } from '../hooks/usePostAnalysis'
import { deletePost, getSimilarFeelingCount } from '../api/postsApi'
import { PostDetailHeader } from './PostDetailHeader'
import { RegularDetailView } from './RegularDetailView'
import { RecommendedPosts } from './RecommendedPosts'
import { ReactionBar } from '@/features/reactions/components/ReactionBar'
import { CommentSection } from '@/features/comments/components/CommentSection'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { toast } from 'sonner'
import { useQueryClient, useQuery } from '@tanstack/react-query'
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

  const isOwnPost = user?.id === post?.author_id
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
      spinnerTimeoutRef.current = setTimeout(() => setIsRetryingAnalysis(false), 5000)
    } catch {
      toast.error('분석 요청에 실패했습니다.')
      setIsRetryingAnalysis(false)
    }
  }, [post, retryAnalysis])

  const emotions = analysis?.emotions ?? post?.emotions
  const hasEmotions = (emotions?.length ?? 0) > 0

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
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-8 w-4/5" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? 'w-3/4' : 'w-full'}`} />
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

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })

  return (
    <article className="space-y-4 animate-fade-in" style={{ viewTransitionName: 'page-content' }}>
      <PostDetailHeader
        postId={postId}
        post={post}
        user={user}
        isOwnPost={isOwnPost}
        onDelete={() => setDeleteDialogOpen(true)}
      />

      <RegularDetailView
        post={post}
        analysis={analysis}
        timeAgo={timeAgo}
        emotions={emotions}
        hasEmotions={hasEmotions}
        similarCount={similarCount}
        isRetryingAnalysis={isRetryingAnalysis}
        onRetryAnalysis={handleRetryAnalysis}
      />

      <Separator />
      <ReactionBar postId={postId} userId={user?.id ?? null} />
      <Separator />
      <RecommendedPosts postId={postId} hasEmotions={hasEmotions} />
      <Separator />
      <CommentSection postId={postId} userId={user?.id ?? null} boardId={post.board_id ?? undefined} />

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
