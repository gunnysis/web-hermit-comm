import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getNotifications, getUnreadCount, markAllRead, markNotificationsRead } from '../api/notificationsApi'

export function useUnreadCount(enabled = true) {
  const { user } = useAuth()

  useRealtimeTable({
    channelName: `notifications-${user?.id ?? 'anon'}`,
    table: 'notifications',
    filter: user?.id ? `user_id=eq.${user.id}` : undefined,
    queryKeys: [['unreadNotificationCount'], ['notifications']],
    enabled: enabled && !!user?.id,
  })

  return useQuery({
    queryKey: ['unreadNotificationCount'],
    queryFn: getUnreadCount,
    enabled,
    staleTime: 30 * 1000,
    meta: { silent: true },
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) => markNotificationsRead(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['unreadNotificationCount'] })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['unreadNotificationCount'] })
    },
  })
}
