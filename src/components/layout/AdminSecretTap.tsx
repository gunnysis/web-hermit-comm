'use client'

import { useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { useIsAdmin } from '@/features/admin/hooks/useIsAdmin'

const TAP_COUNT = 5
const TAP_WINDOW_MS = 3000

export function AdminSecretTap({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useAuthContext()
  const { data: isAdmin } = useIsAdmin(user?.id ?? null)
  const tapsRef = useRef<number[]>([])

  const handleClick = useCallback(() => {
    const now = Date.now()
    tapsRef.current = tapsRef.current.filter(t => now - t < TAP_WINDOW_MS)
    tapsRef.current.push(now)

    if (tapsRef.current.length >= TAP_COUNT) {
      tapsRef.current = []
      if (isAdmin) {
        router.push('/admin')
      }
    }
  }, [isAdmin, router])

  return (
    <span onClick={handleClick} className="cursor-pointer select-none">
      {children}
    </span>
  )
}
