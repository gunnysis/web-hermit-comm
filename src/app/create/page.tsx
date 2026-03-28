'use client'

import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { CreatePostForm } from '@/features/posts/components/CreatePostForm'

function CreateContent() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <CreatePostForm />
    </main>
  )
}

export default function CreatePage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-8"><div className="h-40 rounded-md bg-muted animate-pulse" /></div>}>
        <CreateContent />
      </Suspense>
    </>
  )
}
