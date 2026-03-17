'use client'

import { useRouter } from 'next/navigation'
import { useMyAlias } from '../hooks/useMyAlias'
import { signOut } from '@/features/auth/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfileSection({ enabled = true }: { enabled?: boolean }) {
  const router = useRouter()
  const { data: alias, isLoading } = useMyAlias(enabled)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <Card>
      <CardContent className="pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
            {isLoading ? <Skeleton className="w-10 h-10 rounded-full" /> : '🙂'}
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <p className="text-sm font-semibold">{alias ?? '익명'}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">나의 별칭</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          로그아웃
        </Button>
      </CardContent>
    </Card>
  )
}
