'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, PenSquare, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useGroupBoards } from '@/features/community/hooks/useGroupBoards'
import { GroupPostFeed } from '@/features/community/components/GroupPostFeed'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { getGroup, getGroupMember, leaveGroup } from '@/features/community/api/communityApi'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface PageProps {
  params: Promise<{ groupId: string }>
}

export default function GroupPage({ params }: PageProps) {
  const { groupId: groupIdStr } = use(params)
  const groupId = parseInt(groupIdStr, 10)
  const router = useRouter()
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const { data: boards, isLoading: boardsLoading } = useGroupBoards(groupId)

  const { data: group } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroup(groupId),
  })

  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['groupMember', groupId, user?.id],
    queryFn: () => getGroupMember(groupId, user!.id),
    enabled: !!user,
  })

  const activeBoardId = selectedBoardId ?? boards?.[0]?.id ?? null

  const handleLeave = async () => {
    if (!user) return
    setIsLeaving(true)
    try {
      await leaveGroup(groupId, user.id)
      queryClient.invalidateQueries({ queryKey: ['myGroups'] })
      toast.success('그룹에서 탈퇴했습니다.')
      router.push('/groups')
    } catch {
      toast.error('탈퇴에 실패했습니다.')
    } finally {
      setIsLeaving(false)
      setLeaveDialogOpen(false)
    }
  }

  // 멤버 로딩 중
  if (memberLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  // 미로그인
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-muted-foreground">로그인이 필요합니다.</p>
        <Button variant="outline" onClick={() => router.push('/groups')}>
          <ArrowLeft size={14} className="mr-1" /> 그룹 목록으로
        </Button>
      </div>
    )
  }

  // 권한 없음
  if (!member) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-muted-foreground">이 그룹에 접근할 권한이 없습니다.</p>
        <Button variant="outline" onClick={() => router.push('/groups')}>
          <ArrowLeft size={14} className="mr-1" /> 그룹 목록으로
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* 그룹 헤더 */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push('/groups')} aria-label="그룹 목록으로 돌아가기">
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-base font-semibold truncate">{group?.name ?? ''}</h1>
          </div>
          <div className="flex items-center gap-1">
            {member && (
              <>
                <Button asChild size="icon" variant="ghost" aria-label="글쓰기">
                  <Link href={`/groups/${groupId}/create`}>
                    <PenSquare size={18} />
                  </Link>
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setLeaveDialogOpen(true)} aria-label="그룹 탈퇴">
                  <LogOut size={18} />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 게시판 탭 */}
        {boardsLoading ? (
          <div className="max-w-2xl mx-auto px-4 pb-2 flex gap-2">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-8 w-20" />)}
          </div>
        ) : boards && boards.length > 0 ? (
          <div className="max-w-2xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto" role="tablist" aria-label="게시판 탭">
            {boards.map((board) => (
              <button
                key={board.id}
                role="tab"
                aria-selected={activeBoardId === board.id}
                onClick={() => setSelectedBoardId(board.id)}
                className={`shrink-0 px-3 py-1 text-sm rounded-md transition-colors ${
                  activeBoardId === board.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent text-muted-foreground'
                }`}
              >
                {board.name}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6" role="tabpanel">
        <GroupPostFeed groupId={groupId} boardId={activeBoardId} />
      </main>

      <ConfirmDialog
        open={leaveDialogOpen}
        onOpenChange={setLeaveDialogOpen}
        title="그룹에서 탈퇴할까요?"
        description="탈퇴 후에도 다시 초대코드로 참여할 수 있습니다."
        confirmLabel="탈퇴"
        onConfirm={handleLeave}
        isPending={isLeaving}
      />
    </div>
  )
}
