'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { useAuth } from './hooks/useAuth'
import { addBreadcrumb } from '@/lib/logger'

interface AuthContextValue {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true })

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

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  return useContext(AuthContext)
}
