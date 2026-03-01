import { Header } from '@/components/layout/Header'
import { CreateGroupPostForm } from '@/features/community/components/CreateGroupPostForm'

interface PageProps {
  params: Promise<{ groupId: string }>
}

export default async function GroupCreatePage({ params }: PageProps) {
  const { groupId } = await params
  const groupIdNum = parseInt(groupId, 10)

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6 space-y-4">
        <h1 className="text-xl font-bold">그룹 글쓰기</h1>
        <CreateGroupPostForm groupId={groupIdNum} />
      </main>
    </>
  )
}
