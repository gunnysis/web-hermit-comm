'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { logger } from '@/lib/logger'

export function useRealtimePosts(boardId: number) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`board-posts-${boardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `board_id=eq.${boardId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['boardPosts', boardId] })
        },
      )
      .subscribe((status, err) => {
        if (err) logger.error(`Realtime board-posts-${boardId} error:`, err)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [boardId, queryClient])
}
