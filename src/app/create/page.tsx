import { Header } from '@/components/layout/Header'
import { CreatePostForm } from '@/features/posts/components/CreatePostForm'

export default function CreatePage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6 space-y-4">
        <h1 className="text-xl font-bold">글쓰기</h1>
        <CreatePostForm />
      </main>
    </>
  )
}
