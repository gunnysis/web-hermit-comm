import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, getUnreadCount, markAllRead, markNotificationsRead } from '../api/notificationsApi'

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: ['unreadNotificationCount'],
    queryFn: getUnreadCount,
    enabled,
    refetchInterval: 30000,
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
