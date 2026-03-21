import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRpc = vi.fn()
vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({ rpc: mockRpc }),
}))
vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), log: vi.fn() },
}))

import {
  getDailyHistory,
  getMonthlyEmotionReport,
  getWeeklyEmotionSummary,
  getActivitySummary,
  getMyAlias,
} from '../api/myApi'

describe('myApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDailyHistory', () => {
    it('성공 시 배열 반환', async () => {
      mockRpc.mockResolvedValue({
        data: [{ id: 1, emotions: ['기쁨'], content: 'hello' }],
        error: null,
      })
      const result = await getDailyHistory(10, 0)
      expect(result).toHaveLength(1)
      expect(mockRpc).toHaveBeenCalledWith('get_my_daily_history', { p_limit: 10, p_offset: 0 })
    })

    it('에러 시 throw', async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: 'fail', code: '500' } })
      await expect(getDailyHistory()).rejects.toBeDefined()
    })

    it('null data → 빈 배열', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null })
      expect(await getDailyHistory()).toEqual([])
    })
  })

  describe('getMonthlyEmotionReport', () => {
    it('year/month 파라미터 전달', async () => {
      mockRpc.mockResolvedValue({
        data: { year: 2026, month: 3, days_logged: 10, top_emotions: [], top_activities: [] },
        error: null,
      })
      const result = await getMonthlyEmotionReport(2026, 3)
      expect(result.days_logged).toBe(10)
      expect(mockRpc).toHaveBeenCalledWith('get_monthly_emotion_report', { p_year: 2026, p_month: 3 })
    })
  })

  describe('getWeeklyEmotionSummary', () => {
    it('weekOffset 전달', async () => {
      mockRpc.mockResolvedValue({
        data: { week_start: '2026-03-16', days_logged: 5 },
        error: null,
      })
      const result = await getWeeklyEmotionSummary(1)
      expect(result?.days_logged).toBe(5)
      expect(mockRpc).toHaveBeenCalledWith('get_weekly_emotion_summary', { p_week_offset: 1 })
    })
  })

  describe('getActivitySummary', () => {
    it('활동 요약 반환', async () => {
      mockRpc.mockResolvedValue({
        data: { post_count: 10, comment_count: 5, reaction_count: 20 },
        error: null,
      })
      const result = await getActivitySummary()
      expect(result.post_count).toBe(10)
    })
  })

  describe('getMyAlias', () => {
    it('별칭 반환', async () => {
      mockRpc.mockResolvedValue({ data: '고요한 바다', error: null })
      expect(await getMyAlias()).toBe('고요한 바다')
    })

    it('null 반환', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null })
      expect(await getMyAlias()).toBeNull()
    })
  })
})
