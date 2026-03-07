'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { useIsAdmin } from '@/features/admin/hooks/useIsAdmin'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading } = useAuthContext()
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin(user?.id ?? null)

  // /admin/login은 보호 대상에서 제외 (무한 리다이렉트 방지)
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) return
    if (authLoading || adminLoading) return
    if (!user) { router.replace('/admin/login'); return }
    if (isAdmin === false) { router.replace('/'); return }
  }, [isLoginPage, authLoading, adminLoading, user, isAdmin, router])

  if (isLoginPage) return <>{children}</>

  if (authLoading || adminLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">확인 중...</div>
  }
  if (!user || !isAdmin) return null

  return <>{children}</>
}
