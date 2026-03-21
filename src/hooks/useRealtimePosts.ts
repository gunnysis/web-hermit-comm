'use client'

import { useRealtimeTable } from './useRealtimeTable'

export function useRealtimePosts(boardId: number) {
  useRealtimeTable({
    channelName: `board-posts-${boardId}`,
    table: 'posts',
    filter: `board_id=eq.${boardId}`,
    queryKeys: [['boardPosts', boardId]],
  })
}
