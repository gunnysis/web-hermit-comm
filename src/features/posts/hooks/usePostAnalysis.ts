'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getPostAnalysis, invokeAnalyzeOnDemand } from '../api/postsApi'

export function usePostAnalysis(postId: number) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['postAnalysis', postId],
    queryFn: () => getPostAnalysis(postId),
    refetchInterval: (query) => {
      // 결과가 없으면 1.5초마다 폴링
      return query.state.data ? false : 1500
    },
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (query.data) return

    // 12초 후에도 결과 없으면 on-demand 호출 (폴백)
    const timer = setTimeout(async () => {
      if (!query.data) {
        await invokeAnalyzeOnDemand(postId)
        queryClient.invalidateQueries({ queryKey: ['postAnalysis', postId] })
      }
    }, 12000)

    return () => clearTimeout(timer)
  }, [postId, query.data, queryClient])

  return query
}
