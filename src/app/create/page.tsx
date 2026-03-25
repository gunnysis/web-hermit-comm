'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { CreatePostForm } from '@/features/posts/components/CreatePostForm'
import { POETRY_BOARD_ID } from '@/lib/constants'

type CreateType = 'post' | 'poem'

function CreateContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = (searchParams.get('type') ?? 'post') as CreateType

  const tabs: { type: CreateType; label: string; href: string }[] = [
    { type: 'post', label: '📝 글쓰기', href: '/create' },
    { type: 'poem', label: '🪶 시 쓰기', href: '/create?type=poem' },
  ]

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* 포맷 선택 탭 */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => router.push(tab.href)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              type === tab.type
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {type === 'poem' ? (
        <CreatePostForm boardId={POETRY_BOARD_ID} />
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
