'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { signOut } from '@/features/auth/auth'

export default function AdminPage() {
  const router = useRouter()
  const { user } = useAuthContext()

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

      <p className="text-sm text-muted-foreground">
        관리자: {user?.email ?? user?.id}
      </p>
    </div>
  )
}
