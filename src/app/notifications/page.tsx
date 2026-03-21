'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { useNotifications, useMarkAllRead, useMarkRead } from '@/features/notifications/hooks/useNotifications'
import type { Notification } from '@/types/database'

export default function NotificationsPage() {
  const { data: notifications = [] } = useNotifications()
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllRead()
  const { mutate: markRead } = useMarkRead()

  const getLabel = (n: Notification) => {
    const actor = n.actor_alias ?? '누군가'
    if (n.type === 'reaction') return `${actor}가 공감했어요`
    if (n.type === 'comment') return `${actor}가 댓글을 남겼어요`
    if (n.type === 'reply') return `${actor}가 답글을 달았어요`
    return ''
  }

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">알림</h1>
          {notifications.some(n => !n.read) && (
            <Button variant="ghost" size="sm" onClick={() => markAllRead()} disabled={isMarkingAll}>
              {isMarkingAll ? '처리 중...' : '모두 읽음'}
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">아직 알림이 없어요</p>
        ) : (
          <div className="space-y-1">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.post_id ? `/post/${n.post_id}` : '#'}
                onClick={() => { if (!n.read) markRead([n.id]) }}
                aria-label={`${getLabel(n)}, ${formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ko })}${n.read ? '' : ', 읽지 않음'}`}
              >
                <div className={`rounded-lg px-4 py-3 transition-colors ${
                  n.read ? 'hover:bg-muted/50' : 'bg-muted/30 hover:bg-muted/50'
                }`} role="article">
                  <p className="text-sm">{getLabel(n)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ko })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
