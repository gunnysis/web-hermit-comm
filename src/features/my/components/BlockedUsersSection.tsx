'use client'

import { useBlockedAliases, useUnblockUser } from '@/features/blocks/hooks/useBlocks'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export function BlockedUsersSection({ enabled = true }: { enabled?: boolean }) {
  const { data: blockedAliases = [], isLoading } = useBlockedAliases(enabled)
  const { mutate: unblock, isPending } = useUnblockUser()

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">차단 관리</h3>
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">차단 관리</h3>
      {blockedAliases.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">차단한 사용자가 없어요</p>
      ) : (
        <div className="space-y-1">
          {blockedAliases.map((alias) => (
            <div key={alias} className="flex items-center justify-between rounded-lg px-3 py-2 bg-muted">
              <span className="text-sm">{alias}</span>
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => unblock(alias)}
              >
                해제
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
