import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { SearchView } from '@/features/posts/components/SearchView'
import { Skeleton } from '@/components/ui/skeleton'

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
