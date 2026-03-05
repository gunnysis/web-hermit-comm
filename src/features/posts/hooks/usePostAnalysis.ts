'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { logger } from '@/lib/logger'
import { getPostAnalysis, invokeAnalyzeOnDemand } from '../api/postsApi'

export function usePostAnalysis(postId: number) {
  const queryClient = useQueryClient()
  const onDemandCalledRef = useRef(false)

  const query = useQuery({
    queryKey: ['postAnalysis', postId],
    queryFn: () => getPostAnalysis(postId),
    staleTime: 5 * 60 * 1000,
  })

  // Realtime subscription: post_analysis INSERT/UPDATE 감지 (글 수정 시 재분석 포함)
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`post-analysis-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_analysis',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['postAnalysis', postId] })
        },
      )
      .subscribe((status, err) => {
        if (err) logger.error(`Realtime post-analysis-${postId} error:`, err)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, queryClient])

  // On-demand 폴백: 15초 후에도 결과 없으면 수동 분석 요청
  useEffect(() => {
    if (query.data) {
      onDemandCalledRef.current = false
      return
    }
    if (onDemandCalledRef.current) return

    let innerTimer: ReturnType<typeof setTimeout> | undefined

    const timer = setTimeout(async () => {
      if (onDemandCalledRef.current) return
      onDemandCalledRef.current = true
      const post = queryClient.getQueryData<{ content?: string; title?: string }>(['post', postId])
      await invokeAnalyzeOnDemand(postId, post?.content, post?.title)
      // Realtime이 INSERT를 감지하여 자동으로 invalidate됨
      // 만약 Realtime이 놓칠 경우를 대비해 5초 후 수동 refetch
      innerTimer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['postAnalysis', postId] })
      }, 5000)
    }, 15000)

    return () => {
      clearTimeout(timer)
      clearTimeout(innerTimer)
    }
  }, [postId, query.data, queryClient])

  // 수동 재시도 — 15초 자동 폴백과 중복 방지
  const retryAnalysis = useCallback(async () => {
    onDemandCalledRef.current = true
    const post = queryClient.getQueryData<{ content?: string; title?: string }>(['post', postId])
    await invokeAnalyzeOnDemand(postId, post?.content, post?.title)
    // Realtime이 감지 못할 경우 대비 5초 후 수동 refetch
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['postAnalysis', postId] })
    }, 5000)
  }, [postId, queryClient])

  return { ...query, retryAnalysis }
}
