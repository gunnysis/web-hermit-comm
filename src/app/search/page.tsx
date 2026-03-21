import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { SearchView } from '@/features/posts/components/SearchView'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: '검색',
  description: '은둔마을에서 감정으로 이야기를 찾아보세요.',
  alternates: { canonical: 'https://www.eundunmaeul.store/search' },
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <SearchView />
        </Suspense>
      </main>
    </>
  )
}
