'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Trash2, Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { useAdminGroups } from '@/features/admin/hooks/useAdminGroups'
import { createGroupWithBoard, regenerateInviteCode } from '@/features/admin/api/adminApi'
import { signOut } from '@/features/auth/auth'
import { useQueryClient } from '@tanstack/react-query'

export default function AdminPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const { query: groupsQuery, deleteMutation } = useAdminGroups(user?.id ?? null)

  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [newInviteCode, setNewInviteCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim() || !user) return
    setIsCreating(true)
    try {
      await createGroupWithBoard(newGroupName.trim(), newGroupDesc.trim(), user.id, newInviteCode.trim() || undefined)
      queryClient.invalidateQueries({ queryKey: ['admin', 'myManagedGroups'] })
      toast.success('그룹이 생성됐습니다.')
      setNewGroupName('')
      setNewGroupDesc('')
      setNewInviteCode('')
      setShowCreateForm(false)
    } catch {
      toast.error('그룹 생성에 실패했습니다.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('그룹이 삭제됐습니다.')
        setDeleteTarget(null)
      },
      onError: () => toast.error('삭제에 실패했습니다.'),
    })
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('초대 코드가 복사됐습니다.')
  }

  const handleRegenerateCode = async (groupId: number) => {
    try {
      const newCode = await regenerateInviteCode(groupId, user!.id)
      queryClient.invalidateQueries({ queryKey: ['admin', 'myManagedGroups'] })
      navigator.clipboard.writeText(newCode)
      toast.success(`새 코드: ${newCode} (클립보드에 복사됨)`)
    } catch {
      toast.error('코드 재생성에 실패했습니다.')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.replace('/')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">관리자</h1>
        <Button variant="outline" size="sm" onClick={handleSignOut}>로그아웃</Button>
      </div>

      <Separator />

      {/* 그룹 생성 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">그룹 관리</h2>
          <Button size="sm" onClick={() => setShowCreateForm((v) => !v)}>
            <Plus size={14} className="mr-1" />
            {showCreateForm ? '취소' : '그룹 생성'}
          </Button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateGroup} className="space-y-2 p-4 border rounded-lg">
            <Input
              placeholder="그룹 이름 *"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">초대 코드 (선택)</label>
              <Input
                placeholder="비워두면 자동 생성됩니다"
                value={newInviteCode}
                onChange={(e) => setNewInviteCode(e.target.value)}
                maxLength={50}
              />
            </div>
            <Textarea
              placeholder="설명 (선택)"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              rows={2}
              className="resize-none"
            />
            <Button type="submit" size="sm" disabled={isCreating || !newGroupName.trim()}>
              {isCreating ? '생성 중...' : '생성'}
            </Button>
          </form>
        )}
      </div>

      {/* 그룹 목록 */}
      {groupsQuery.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      )}

      {groupsQuery.data?.length === 0 && !groupsQuery.isLoading && (
        <p className="text-center text-muted-foreground py-8">생성한 그룹이 없습니다.</p>
      )}

      <div className="space-y-3">
        {groupsQuery.data?.map((group) => (
          <Card key={group.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{group.name}</CardTitle>
              {group.description && (
                <p className="text-sm text-muted-foreground">{group.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {group.invite_code && (
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                    {group.invite_code}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleCopyCode(group.invite_code!)}
                    aria-label="초대 코드 복사"
                  >
                    <Copy size={13} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleRegenerateCode(group.id)}
                    aria-label="초대 코드 재생성"
                  >
                    <RefreshCw size={13} />
                  </Button>
                </div>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteTarget({ id: group.id, name: group.name })}
                disabled={deleteMutation.isPending}
              >
                <Trash2 size={13} className="mr-1" /> 그룹 삭제
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title={`'${deleteTarget?.name}' 그룹을 삭제할까요?`}
        description="그룹의 모든 게시글과 댓글이 함께 삭제됩니다."
        confirmLabel="삭제"
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
