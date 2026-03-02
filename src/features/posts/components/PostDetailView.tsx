'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ArrowLeft, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
import { useAuthContext } from '@/features/auth/AuthProvider'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

interface PostDetailViewProps {
  postId: number
}

export function PostDetailView({ postId }: PostDetailViewProps) {
  const router = useRouter()
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const { data: post, isLoading, isError } = usePostDetail(postId)
  const { data: analysis } = usePostAnalysis(postId)

  const canEdit = user?.id === post?.author_id

  const handleDelete = async () => {
    if (!confirm('게시글을 삭제할까요?')) return
    try {
      await deletePost(postId)
      toast.success('게시글이 삭제됐습니다.')
      const groupId = post?.group_id
      router.push(groupId ? `/groups/${groupId}` : '/')
      queryClient.removeQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['boardPosts'] })
      queryClient.invalidateQueries({ queryKey: ['groupPosts'] })
    } catch (err) {
      console.error('deletePost error:', err)
      toast.error('삭제에 실패했습니다.')
    }
  }

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

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ko,
  })

  const emotions = analysis?.emotions ?? post.emotions
  const hasEmotions = (emotions?.length ?? 0) > 0

  return (
    <article className="space-y-6 animate-fade-in">
      {/* 상단 내비게이션 */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
          <ArrowLeft size={16} className="mr-1" /> 뒤로
        </Button>
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/post/${postId}/edit`)}>
                <Pencil size={14} className="mr-2" /> 수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 size={14} className="mr-2" /> 삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* 제목 및 메타 */}
      <header className="space-y-2">
        <h1 className="text-2xl font-bold leading-tight tracking-tight">{post.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">{post.display_name}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.created_at}>{timeAgo}</time>
        </div>
        <EmotionTags emotions={emotions} />
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
      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <Separator />

      {/* 반응 */}
      <ReactionBar postId={postId} userId={user?.id ?? null} />

      {/* 추천 게시글 */}
      {hasEmotions && (
        <>
          <Separator />
          <RecommendedPosts postId={postId} hasEmotions={hasEmotions} />
        </>
      )}

      <Separator />

      {/* 댓글 */}
      <CommentSection
        postId={postId}
        userId={user?.id ?? null}
        boardId={post.board_id ?? undefined}
        groupId={post.group_id ?? undefined}
      />
    </article>
  )
}
