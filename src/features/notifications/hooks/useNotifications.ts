import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, getUnreadCount, markAllRead } from '../api/notificationsApi'

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: ['unreadNotificationCount'],
    queryFn: getUnreadCount,
    enabled,
    refetchInterval: 30000,
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
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
