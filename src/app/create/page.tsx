'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { CreatePostForm } from '@/features/posts/components/CreatePostForm'
import { DailyPostForm } from '@/features/posts/components/DailyPostForm'
import { usePostDetail } from '@/features/posts/hooks/usePostDetail'
import { Skeleton } from '@/components/ui/skeleton'

function DailyEditWrapper({ editId }: { editId: number }) {
  const { data: post, isLoading } = usePostDetail(editId)

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (!post) {
    return <p className="text-center text-muted-foreground py-8">게시글을 찾을 수 없습니다.</p>
  }

  return (
    <DailyPostForm
      mode="edit"
      initialData={{
        id: editId,
        emotions: (post as any).initial_emotions ?? [],
        activities: (post as any).activities ?? [],
        content: post.content ?? '',
      }}
    />
  )
}

function CreateContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('type')
  const editId = searchParams.get('edit')

  const isDaily = type === 'daily'

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* 포맷 선택 탭 */}
      {!editId && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => router.push('/create')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              !isDaily
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            📝 글쓰기
          </button>
          <button
            onClick={() => router.push('/create?type=daily')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isDaily
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            🌤️ 오늘의 하루
          </button>
        </div>
      )}

      {isDaily ? (
        editId ? (
          <DailyEditWrapper editId={Number(editId)} />
        ) : (
          <DailyPostForm />
        )
      ) : (
        <CreatePostForm />
      )}
    </main>
  )
}

export default function CreatePage() {
  return (
    <>
      <Header />
      <Suspense>
        <CreateContent />
      </Suspense>
    </>
  )
}
