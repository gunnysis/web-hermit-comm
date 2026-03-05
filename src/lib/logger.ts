import * as Sentry from '@sentry/nextjs'

const IS_DEV = process.env.NODE_ENV !== 'production'

export const logger = {
  log: (...args: unknown[]) => {
    if (IS_DEV) console.log(...args)
  },
  warn: (...args: unknown[]) => {
    if (IS_DEV) console.warn(...args)
  },
  error: (...args: unknown[]) => {
    if (IS_DEV) {
      console.error(...args)
      return
    }
    if (args[0] instanceof Error) {
      Sentry.captureException(args[0], { extra: { args: args.slice(1) } })
    } else {
      Sentry.captureMessage(String(args[0] ?? 'Error'), { extra: { args: args.slice(1) } })
    }
  },
}

export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
) {
  Sentry.addBreadcrumb({ category, message, data: data ?? {} })
}
