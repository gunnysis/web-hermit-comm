'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { getYesterdayDailyReactions } from '../api/postsApi'
import { SHARED_PALETTE } from '@/lib/constants'

export function YesterdayReactionBanner() {
  const { user } = useAuthContext()
  const [seen, setSeen] = useState(true)

  const { data } = useQuery({
    queryKey: ['yesterdayDailyReactions'],
    queryFn: getYesterdayDailyReactions,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    const stored = localStorage.getItem('yesterday_reaction_seen')
    setSeen(stored === new Date().toISOString().slice(0, 10))
  }, [])

  if (!user || seen || !data) return null

  const handleDismiss = () => {
    setSeen(true)
    localStorage.setItem('yesterday_reaction_seen', new Date().toISOString().slice(0, 10))
  }

  return (
    <Link
      href={`/post/${data.post_id}`}
      onClick={handleDismiss}
      className="block rounded-xl px-4 py-3 mb-4 transition-colors hover:opacity-90"
      style={{
        backgroundColor: `var(--daily-bg, ${SHARED_PALETTE.cream[50]})`,
        border: `1px solid var(--daily-border, ${SHARED_PALETTE.cream[200]})`,
      }}
    >
      <span className="text-xs text-muted-foreground">
        어제 나눈 하루에 {data.like_count}명이 공감했어요
        {data.comment_count > 0 ? ` · 💬 ${data.comment_count}개` : ''}
      </span>
    </Link>
  )
}
