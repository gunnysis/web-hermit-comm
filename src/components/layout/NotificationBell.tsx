'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications'
import { useAuthContext } from '@/features/auth/AuthProvider'

export function NotificationBell() {
  const { user } = useAuthContext()
  const { data: count = 0 } = useUnreadCount(!!user)

  return (
    <Link href="/notifications" className="relative p-2">
      <Bell size={20} />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
