'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import * as Sentry from '@sentry/nextjs'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">문제가 발생했습니다</h2>
        <p className="text-sm text-muted-foreground">잠시 후 다시 시도해주세요.</p>
      </div>
      <Button onClick={reset} variant="outline">다시 시도</Button>
    </div>
  )
}
