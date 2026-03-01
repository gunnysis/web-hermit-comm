import { Header } from '@/components/layout/Header'
import { EditPostForm } from '@/features/posts/components/EditPostForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params
  const postId = parseInt(id, 10)

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6 space-y-4">
        <h1 className="text-xl font-bold">게시글 수정</h1>
        <EditPostForm postId={postId} />
      </main>
    </>
  )
}
