'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { useAuth } from './hooks/useAuth'
import { addBreadcrumb } from '@/lib/logger'

interface AuthContextValue {
  user: User | null
  loading: boolean
  authError: string | null
  retry: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  authError: null,
  retry: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  const prevUser = useRef<string | null>(null)

  useEffect(() => {
    const uid = auth.user?.id ?? null
    if (uid !== prevUser.current) {
      if (uid) {
        addBreadcrumb('auth', 'login', { userId: uid })
      } else if (prevUser.current) {
        addBreadcrumb('auth', 'logout')
      }
      prevUser.current = uid
    }
  }, [auth.user])

  if (auth.authError) {
    return (
      <AuthContext.Provider value={auth}>
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="text-center space-y-4 max-w-sm">
            <p className="text-4xl">😢</p>
            <p className="text-base text-destructive">{auth.authError}</p>
            <p className="text-sm text-muted-foreground">
              서버 점검 중이거나 네트워크가<br />불안정할 수 있습니다.
            </p>
            <button
              onClick={auth.retry}
              className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              다시 시도
            </button>
          </div>
        </div>
      </AuthContext.Provider>
    )
  }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  return useContext(AuthContext)
}
