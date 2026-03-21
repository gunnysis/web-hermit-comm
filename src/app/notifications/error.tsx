'use client'
import { RouteError } from '@/components/layout/RouteError'
export default function NotificationsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError error={error} reset={reset} sectionName="알림" />
}
