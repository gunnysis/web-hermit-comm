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

## 멀티프로젝트 관리

이 웹 레포, 앱 레포(`/mnt/c/Users/Administrator/programming/apps/gns-hermit-comm`), **중앙 Supabase 프로젝트**(`~/apps/supabase-hermit`)가 동일 Supabase 백엔드를 공유.

### 역할 경계

- **Supabase 마이그레이션 정본**: `~/apps/supabase-hermit`. 마이그레이션은 **여기서만** 생성/적용.
- **Edge Functions**: 앱 레포의 `supabase/functions/`.
- **웹 레포**: 마이그레이션 읽기 전용 복사본 (`scripts/sync-from-app.sh`로 동기화).
- **앱 레포**: 마이그레이션 읽기 전용 복사본 (중앙에서 `scripts/sync-to-projects.sh`로 동기화).

### DB 변경 워크플로

```bash
# 1. 중앙 프로젝트에서 마이그레이션 작성
cd ~/apps/supabase-hermit
vi supabase/migrations/YYYYMMDDNNNNNN_description.sql

# 2. 적용
bash scripts/db.sh push

# 3. 앱/웹 동기화
bash scripts/sync-to-projects.sh

# 4. 웹 레포에서도 동기화 확인 가능
cd ~/apps/web && bash scripts/sync-from-app.sh
```

### 동기화 대상

- `supabase/migrations/` — 중앙에서 생성 후 앱/웹에 복사
- `src/types/database.ts` ← 앱 `src/types/index.ts` (수동 검토 후 적용)
- `src/lib/constants.ts`의 `VALIDATION`, `ALLOWED_EMOTIONS`, `EMOTION_EMOJI` — 앱과 값 동일하게 유지

### 동기화 시 주의사항

- `src/lib/anonymous.ts` (별칭 해시 알고리즘·목록): **앱과 독립 유지**. 변경 시 기존 사용자 alias가 바뀜.
- 상수 값 변경 시 앱 `src/shared/lib/constants.ts`도 함께 업데이트.
- 동기화 스크립트: `scripts/sync-from-app.sh` (중앙 → 웹)
- **앱/웹 레포에서 직접 마이그레이션 생성 금지** — 반드시 중앙 프로젝트에서

## Vercel 배포

### 배포 방식
- **자동 배포**: `git push origin main` → Vercel GitHub 연동이 자동 빌드/배포.
- **수동 배포**: 자동 배포 실패(Canceled 등) 시 `vercel deploy --prod` CLI 사용.
- Hobby 플랜 동시 빌드 1개 제한 — 짧은 시간에 여러 커밋 연속 푸시 시 이전 빌드가 취소됨. **변경사항을 모아서 한 번에 푸시** 권장.

### 배포 확인 절차
```bash
vercel ls web --scope jeonggeon-parks-projects   # 배포 목록 확인
vercel inspect <deployment-url>                   # 개별 배포 상태 확인
```
- 배포 후 `dpl_` ID가 변경되었는지 curl 헤더로 확인: `curl -sI https://www.eundunmaeul.store | grep x-vercel`

### 정적 파일 서빙 주의사항
- `public/` 디렉토리의 정적 파일은 Vercel에서 루트 URL로 서빙됨.
- 단, `src/proxy.ts`의 matcher가 가로챌 수 있으므로, **proxy를 거치지 않아야 할 파일은 proxy 함수 내에서 early return 처리**.
- 외부 서비스 인증 파일(네이버, 구글 등)은 proxy에서 직접 응답하는 방식이 가장 확실함.

### Vercel CLI 설정
- 프로젝트: `jeonggeon-parks-projects/web`
- 링크: `vercel link --yes --scope jeonggeon-parks-projects --project web`
- `.vercel/project.json`이 깨졌을 때 위 명령으로 재연결.
