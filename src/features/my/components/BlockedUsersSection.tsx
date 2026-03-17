'use client'

import { useBlockedAliases, useUnblockUser } from '@/features/blocks/hooks/useBlocks'
import { Skeleton } from '@/components/ui/skeleton'

export function BlockedUsersSection({ enabled = true }: { enabled?: boolean }) {
  const { data: blockedAliases = [], isLoading } = useBlockedAliases(enabled)
  const { mutate: unblock, isPending } = useUnblockUser()

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">🚫</span>
          <span className="text-sm font-medium">차단 관리</span>
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm">🚫</span>
        <span className="text-sm font-medium">차단 관리</span>
        {blockedAliases.length > 0 && (
          <span className="text-[10px] text-muted-foreground">{blockedAliases.length}명</span>
        )}
      </div>
      {blockedAliases.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2 pl-6">차단한 사용자가 없어요</p>
      ) : (
        <div className="space-y-1 pl-6">
          {blockedAliases.map((alias) => (
            <div key={alias} className="flex items-center justify-between rounded-lg px-3 py-2 bg-muted/50">
              <span className="text-sm">{alias}</span>
              <button
                className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                disabled={isPending}
                onClick={() => unblock(alias)}
              >
                해제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
