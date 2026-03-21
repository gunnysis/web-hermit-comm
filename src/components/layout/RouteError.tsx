'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'

interface RouteErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  sectionName?: string
}

export function RouteError({ error, reset, sectionName }: RouteErrorProps) {
  useEffect(() => {
    logger.error(`[${sectionName ?? 'Page'}] error:`, error)
  }, [error, sectionName])

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-3xl">😢</p>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {sectionName ? `${sectionName} 페이지에 문제가 생겼어요` : '문제가 발생했습니다'}
        </p>
        <p className="text-xs text-muted-foreground">잠시 후 다시 시도해주세요.</p>
      </div>
      <Button onClick={reset} variant="outline" size="sm">다시 시도</Button>
    </div>
  )
}
