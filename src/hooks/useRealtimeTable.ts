'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { logger } from '@/lib/logger'

/**
 * Supabase Realtime 구독 공통 훅.
 * 지정 테이블의 변경 시 관련 쿼리를 자동 무효화합니다.
 */
export function useRealtimeTable({
  channelName,
  table,
  filter,
  queryKeys,
  enabled = true,
}: {
  channelName: string
  table: string
  filter?: string
  queryKeys: unknown[][]
  enabled?: boolean
}) {
  const queryClient = useQueryClient()
  const queryKeysRef = useRef(queryKeys)
  queryKeysRef.current = queryKeys

  useEffect(() => {
    if (!enabled) return

    const supabase = createClient()
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        () => {
          for (const key of queryKeysRef.current) {
            queryClient.invalidateQueries({ queryKey: key })
          }
        },
      )
      .subscribe((status, err) => {
        if (err) logger.error(`Realtime ${channelName} error:`, err)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName, table, filter, enabled, queryClient])
}
