import { createClient } from '@/utils/supabase/client'
import { logger } from '@/lib/logger'
import type { Notification } from '@/types/database'

export type { Notification }

export async function getNotifications(limit = 20, offset = 0): Promise<Notification[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_notifications', { p_limit: limit, p_offset: offset })
  if (error) { logger.error('[getNotifications]', error); throw error }
  return (data ?? []) as Notification[]
}

export async function getUnreadCount(): Promise<number> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_unread_notification_count')
  if (error) return 0
  return (data as number) ?? 0
}

export async function markNotificationsRead(ids: number[]): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('mark_notifications_read', { p_ids: ids })
  if (error) {
    logger.error('[markNotificationsRead]', error.message, { code: error.code })
    throw error
  }
}

export async function markAllRead(): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('mark_all_notifications_read')
  if (error) {
    logger.error('[markAllRead]', error.message, { code: error.code })
    throw error
  }
}
