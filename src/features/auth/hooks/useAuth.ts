'use client'

import { useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { signInAnonymously } from '../auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const ensureAnonymousSession = useCallback(async (maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const data = await signInAnonymously()
        setUser(data.user)
        return
      } catch {
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, attempt * 1000))
        }
      }
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
      } else {
        ensureAnonymousSession().finally(() => setLoading(false))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [ensureAnonymousSession])

  return { user, loading }
}
