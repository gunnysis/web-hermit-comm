'use client'

import { useQuery } from '@tanstack/react-query'
import { getWeeklyEmotionSummary } from '../api/myApi'

export function useWeeklySummary(weekOffset = 0, enabled = true) {
  return useQuery({
    queryKey: ['weeklySummary', weekOffset],
    queryFn: () => getWeeklyEmotionSummary(weekOffset),
    enabled,
    staleTime: 30 * 60 * 1000,
  })
}
