'use client'

import { Header } from '@/components/layout/Header'
import { GroupCard } from '@/features/community/components/GroupCard'
import { JoinGroupForm } from '@/features/community/components/JoinGroupForm'
import { useMyGroups } from '@/features/community/hooks/useMyGroups'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export default function GroupsPage() {
  const { user } = useAuthContext()
  const { data: groups, isLoading } = useMyGroups(user?.id ?? null)

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-bold">내 그룹</h1>
          <JoinGroupForm userId={user?.id ?? null} />
        </div>

        <Separator />

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        )}

        {!isLoading && groups?.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            아직 참여한 그룹이 없습니다.<br />
            <span className="text-sm">초대 코드로 그룹에 참여해보세요.</span>
          </p>
        )}

        <div className="space-y-3">
          {groups?.map((group) => <GroupCard key={group.id} group={group} />)}
        </div>
      </main>
    </>
  )
}
