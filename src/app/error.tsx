'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">문제가 발생했습니다</h2>
        <p className="text-sm text-muted-foreground">잠시 후 다시 시도해주세요.</p>
      </div>
      <details className="max-w-md text-left">
        <summary className="text-xs text-muted-foreground cursor-pointer">오류 상세</summary>
        <pre className="mt-2 text-xs text-red-500 whitespace-pre-wrap break-all bg-muted p-3 rounded-lg">
          {error.message}
          {error.stack && `\n\n${error.stack}`}
        </pre>
      </details>
      <Button onClick={reset} variant="outline">다시 시도</Button>
    </div>
  )
}
