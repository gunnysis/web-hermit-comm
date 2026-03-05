import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 0,
  integrations: [
    Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    Sentry.browserTracingIntegration(),
  ],
  beforeSend(event) {
    // PII 필터
    if (event.message) {
      event.message = event.message.replace(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
        '[email]',
      );
    }
    if (event.extra && typeof event.extra === 'object') {
      for (const k of Object.keys(event.extra)) {
        if (/email|password|author|display_name/i.test(k)) {
          (event.extra as Record<string, unknown>)[k] = '[redacted]';
        }
      }
    }
    return event;
  },
  debug: false,
});
