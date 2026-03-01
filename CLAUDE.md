# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 개발 서버 시작
npm run build    # 프로덕션 빌드 (Sentry 소스맵 업로드 포함)
npm run lint     # ESLint 실행
```

Node.js 22 필수. nvm 사용 시: `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use`

## Architecture

### Next.js 16 특이사항
- `middleware.ts` 대신 **`src/proxy.ts`** 사용. 함수명도 `middleware` → `proxy`.
- Supabase 세션 갱신(토큰 리프레시)은 `proxy.ts`에서 `supabase.auth.getUser()` 호출로 처리.

### Supabase 클라이언트 패턴
- **브라우저**: `src/utils/supabase/client.ts` — `createBrowserClient` (Client Component에서만)
- **서버**: `src/utils/supabase/server.ts` — `createServerClient` + `cookies()` (Server Component, Route Handler, Server Action에서 `await createClient()`)

### TanStack Query
- `src/lib/query-client.ts`: SSR/CSR 구분 싱글톤 (`getQueryClient()`). 서버에서는 매번 새 인스턴스, 브라우저에서는 싱글톤.
- `src/components/providers/query-provider.tsx`: `"use client"` QueryClientProvider. `src/app/layout.tsx`에서 children 래핑.
- 기본 `staleTime`: 60초.

### Tailwind CSS v4
- CSS-first 방식. `tailwind.config.js` 없음.
- `src/app/globals.css`에서 `@import "tailwindcss"` 및 `@theme` 디렉티브로 테마 정의.

### 환경 변수 규칙
- 브라우저 노출 필요: `NEXT_PUBLIC_` 접두어 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SENTRY_DSN`)
- 서버 전용: 접두어 없이 (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` 등)
- `.env.local` — git 제외. `.env.example` — 빈 템플릿으로 커밋.

### 디렉터리 확장 방향
기능이 추가될 때 `src/features/`, `src/hooks/`, `src/types/`, `src/lib/validations/` 등을 단계적으로 도입. `src/app/`에는 라우트·레이아웃·페이지만 두고 비즈니스 로직은 분리.

### Sentry
- `next.config.ts`: `withSentryConfig` 래핑. org: `gunnys`, project: `gns-hermit-comm`.
- `sentry.client.config.ts` / `sentry.server.config.ts` / `sentry.edge.config.ts` 세 파일로 분리.
- 빌드 시 소스맵 업로드에 `SENTRY_AUTH_TOKEN` 환경 변수 필요.
