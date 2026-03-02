'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getPostAnalysis, invokeAnalyzeOnDemand } from '../api/postsApi'

export function usePostAnalysis(postId: number) {
  const queryClient = useQueryClient()
  const onDemandCalledRef = useRef(false)

  const query = useQuery({
    queryKey: ['postAnalysis', postId],
    queryFn: () => getPostAnalysis(postId),
    staleTime: 5 * 60 * 1000,
  })

  // Realtime subscription: post_analysis INSERT 감지
  useEffect(() => {
    if (query.data) return // 이미 분석 결과 있으면 구독 불필요

    const supabase = createClient()
    const channel = supabase
      .channel(`post-analysis-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_analysis',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['postAnalysis', postId] })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, query.data, queryClient])

  // On-demand 폴백: 15초 후에도 결과 없으면 수동 분석 요청
  useEffect(() => {
    if (query.data) {
      onDemandCalledRef.current = false
      return
    }
    if (onDemandCalledRef.current) return

    const timer = setTimeout(async () => {
      if (onDemandCalledRef.current) return
      onDemandCalledRef.current = true
      await invokeAnalyzeOnDemand(postId)
      // Realtime이 INSERT를 감지하여 자동으로 invalidate됨
      // 만약 Realtime이 놓칠 경우를 대비해 5초 후 수동 refetch
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['postAnalysis', postId] })
      }, 5000)
    }, 15000)

    return () => clearTimeout(timer)
  }, [postId, query.data, queryClient])

  return query
}
