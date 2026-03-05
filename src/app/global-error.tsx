'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
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
    <html>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, textAlign: 'center', padding: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>문제가 발생했습니다</h2>
          <p style={{ fontSize: 14, color: '#888' }}>잠시 후 다시 시도해주세요.</p>
          <button
            onClick={reset}
            style={{ padding: '8px 24px', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  )
}
