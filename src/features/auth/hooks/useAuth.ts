'use client'

import { useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { signInAnonymously } from '../auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const retry = useCallback(() => {
    setAuthError(null)
    setLoading(true)
    setRetryKey((k) => k + 1)
  }, [])

  const ensureAnonymousSession = useCallback(async (maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const data = await signInAnonymously()
        return data.user
      } catch {
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, attempt * 1000))
        }
      }
    }
    return null
  }, [])

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session?.user) {
        setUser(session.user)
        setAuthError(null)
        setLoading(false)
      } else {
        ensureAnonymousSession().then(u => {
          if (!cancelled) {
            if (u) {
              setUser(u)
              setAuthError(null)
            } else {
              setAuthError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
            }
            setLoading(false)
          }
        })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return

      if (event === 'SIGNED_OUT') {
        // 캐시 전체 초기화
        const { getQueryClient } = await import('@/lib/query-client')
        getQueryClient().clear()

        // 새 익명 세션 생성
        const newUser = await ensureAnonymousSession()
        if (!cancelled && newUser) {
          setUser(newUser)
        }
        return
      }

      setUser(session?.user ?? null)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [ensureAnonymousSession, retryKey])

  return { user, loading, authError, retry }
}
