# Next.js 15 + 풀 스택 개발환경 설정 (web-hermit-comm)

은둔마을 웹 앱용 개발환경 설계 및 설정 가이드입니다.  
Node.js 22, Next.js 15(App Router), Tailwind CSS v4, TypeScript 5.9.x, Supabase SSR, TanStack Query v5, React Hook Form + Zod, TipTap, Sentry, Vercel Analytics/Speed Insights를 기준으로 합니다.

---

## 전제 조건

- **실행 위치**: `create-next-app`은 **프로젝트 상위 디렉터리**에서 실행합니다. `apps/web`이 이미 있다면 상위(예: monorepo 루트)에서 아래 명령을 실행해 이 디렉터리에 앱을 생성합니다.

```bash
cd /path/to/parent && npx create-next-app@latest apps/web \
  --typescript --tailwind --app --src-dir --import-alias "@/*"
```

- **Node.js**: 22 LTS 사용. Next.js 15는 Node 20.9+ 요구.
- **Tailwind CSS**: **추천 버전 v4** 사용. Next.js 15와 완전 호환되며, Oxide 엔진·CSS-first 설정·빠른 HMR을 제공합니다. create-next-app이 v3를 설치하면 v4로 업그레이드하는 단계를 권장합니다.

---

## 1. Node.js 22 및 프로젝트 루트

- **`.nvmrc`** (또는 volta/fnm 사용 시 해당 설정): `22` 또는 `22.12.0` 등 22 LTS 버전 명시.
- **`package.json`** (create-next-app 이후): `"engines": { "node": ">=22" }` 추가 권장.
- 앱 코드는 이 저장소 루트(`apps/web`) 아래에 생성됩니다.

---

## 2. create-next-app 실행

| 항목 | 값 |
|------|-----|
| 실행 경로 | 프로젝트 상위 디렉터리 |
| 명령 | `npx create-next-app@latest apps/web --typescript --tailwind --app --src-dir --import-alias "@/*"` |
| 패키지 매니저 | 기본값(npm) 또는 `--use-pnpm` 등으로 지정 |

생성 후 구조 예: `src/app/`, `src/app/layout.tsx`, `src/app/page.tsx`, Tailwind 설정 파일(`tailwind.config.ts` 또는 v4 시 `@theme` in CSS), `next.config.ts`, `tsconfig.json` 등.

---

## 3. Tailwind CSS 추천 버전(v4)

- **권장**: Next.js 15 신규 프로젝트에는 **Tailwind CSS v4** 사용을 추천합니다. Next.js 15와 완전 호환되며 Oxide 엔진·CSS-first 설정·자동 파일 스캔으로 성능과 DX가 좋습니다.
- **create-next-app이 v3를 설치한 경우**:
  - 공식 업그레이드: `npx @tailwindcss/upgrade@next` 실행 후, 가이드에 따라 `@tailwindcss/postcss` 및 `globals.css`의 `@theme` 기반 설정으로 전환.
  - 또는 `tailwindcss@^4` 설치 후 [Tailwind v4 Next.js 가이드](https://tailwindcss.com/docs/installation/framework-guides/nextjs)에 맞게 `postcss.config.mjs`와 `src/app/globals.css`를 v4 방식으로 수정.
- **이미 v4가 설치된 경우**: 별도 조치 없이 create-next-app 기본 구조를 유지합니다. v4는 `tailwind.config.js` 대신 `@import "tailwindcss"` 및 `@theme` 디렉티브를 사용합니다.

---

## 4. TypeScript ~5.9.x

- `package.json`의 `devDependencies`에: `"typescript": "~5.9.0"` (또는 `~5.9.x`로 5.9 패치 버전 허용).
- `tsconfig.json`은 create-next-app 기본값 유지 후, 필요 시만 조정.

---

## 5. Supabase (Server Client + Auth + @supabase/ssr)

- **설치**: `@supabase/supabase-js`, `@supabase/ssr`.
- **환경 변수** (`.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **유틸 파일**:
  - **클라이언트**: `src/utils/supabase/client.ts` — `createBrowserClient` from `@supabase/ssr`.
  - **서버**: `src/utils/supabase/server.ts` — `createServerClient` + Next.js `cookies()`.
  - **미들웨어**(선택): 쿠키 갱신용 미들웨어에서 Supabase 클라이언트 생성 및 `getUser`/리프레시 처리.
- Auth는 쿠키 기반 세션으로 동작하므로, Server Components / Route Handlers / Middleware에서 동일한 세션 사용 가능.

---

## 5-1. 환경 변수 (.env) — 은둔마을 웹 기준

Next.js 웹 앱용 `.env.example`을 두고 실제 값은 `.env.local`에 채워 사용합니다. `.env.local`은 저장소에 커밋하지 않고, Vercel 배포 시에는 Vercel Environment Variables / Secrets를 사용합니다.

**파일**: `.env.example` (커밋), `.env.local` (로컬 전용, git 제외)

예시 내용은 [환경 변수 예시](#환경-변수-예시-env.example) 섹션을 참고하거나, 프로젝트 루트의 `.env.example` 파일을 복사해 `.env.local`을 만든 뒤 값을 채웁니다.

- **Supabase**: Next.js 클라이언트 노출용으로 `NEXT_PUBLIC_SUPABASE_*` 사용. 서버/CLI용은 `SUPABASE_*` 유지.
- **Sentry**: 클라이언트 DSN은 `NEXT_PUBLIC_SENTRY_DSN`, 빌드/업로드용은 `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` 등.

### 환경 변수 예시 (.env.example)

```env
# ============================================================
# 은둔마을 — 웹(Next.js) 환경 변수 예시 (.env.example)
# ============================================================
# 이 파일을 복사해 .env.local 을 만들고 값을 채우세요.
# .env.local 은 저장소에 커밋하지 마세요.
# Vercel 배포 시에는 Vercel Environment Variables 사용 권장.
# ============================================================

# --- Supabase (필수) ---
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# --- Supabase CLI / 로컬 개발 (마이그레이션·함수 배포 등) ---
SUPABASE_ACCESS_TOKEN=
SUPABASE_DB_PASSWORD=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# --- Anthropic (선택, Edge/API 라우트에서 사용 시) ---
ANTHROPIC_API_KEY=

# --- Sentry (선택, 프로덕션 에러 수집) ---
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
SENTRY_DISABLE_AUTO_UPLOAD=false
# 참고용 (앱에서 미사용)
# SENTRY_PROJECT_SLUG=
# SENTRY_ORGANIZATION_ID=
# SENTRY_PROJECT_ID=
# SENTRY_PERSONAL_TOKEN=
# SENTRY_SECURITY_TOKEN=
```

---

## 6. TanStack Query v5

- **설치**: `@tanstack/react-query`.
- **설정**:
  - `src/lib/query-client.ts`: 싱글톤 `QueryClient` 생성 및 export.
  - `"use client"` Provider 컴포넌트 (예: `src/components/providers/query-provider.tsx`): `QueryClientProvider`로 감싸기.
  - `src/app/layout.tsx`의 `<body>` 안에서 해당 Provider로 children 감싸기.
- (선택) 서버에서 prefetch 후 hydrate: `HydrationBoundary` + `dehydrate`/`hydrate` 사용.

---

## 7. React Hook Form + Zod

- **설치**: `react-hook-form`, `@hookform/resolvers`, `zod`.
- **사용 패턴**: `@hookform/resolvers/zod`로 `zodResolver(schema)` 사용. 폼 컴포넌트는 `"use client"`에서 `useForm` + `resolver: zodResolver(schema)`.
- 공통 스키마/폼은 `src/lib/validations` 또는 `src/schemas` 등에 분리해 두면 유지보수에 유리합니다.

---

## 8. TipTap

- **설치**: `@tiptap/react`, `@tiptap/starter-kit` 등 필요한 확장만 추가.
- **구성**: `"use client"` 에디터 컴포넌트에서 `useEditor`/`EditorContent` 사용. 스타일은 Tailwind 또는 TipTap 권장 CSS 조합.
- (선택) `@tiptap/extension-*` 로 이미지/링크 등 확장 추가.

---

## 9. Sentry

- **설치**: `@sentry/nextjs`.
- **설정**:
  - `next.config.ts`: `withSentryConfig(nextConfig, { org, project, ... })` 래핑.
  - 루트에 `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` 생성 후 DSN 등 설정.
  - (선택) `instrumentation.ts`에서 서버 부트스트랩.
- 빠른 설정: `npx @sentry/wizard@latest -i nextjs` 실행 후 생성된 파일을 Next 15 구조에 맞게 `src/` 등으로 이동/조정 가능.

---

## 10. Vercel Analytics + Speed Insights

- **설치**: `@vercel/analytics`, `@vercel/speed-insights`.
- **사용**: `src/app/layout.tsx`에 `<Analytics />`, `<SpeedInsights />` 컴포넌트 추가 (기본 설정으로 동작).

---

## 11. 디렉터리 구조 요약

```
apps/web/
├── .env.example        # 환경 변수 예시 (커밋), 복사해 .env.local 생성
├── .env.local          # 실제 값 (git 제외), Vercel 배포 시 Vercel env 사용
├── .nvmrc              # 22
├── docs/               # 설계·설정 문서
│   └── SETUP_AND_DESIGN.md
├── src/
│   ├── app/
│   │   ├── layout.tsx  # Providers, Analytics, SpeedInsights
│   │   └── page.tsx
│   ├── components/
│   │   └── providers/  # QueryClientProvider 등
│   ├── lib/
│   │   ├── query-client.ts
│   │   └── validations/  # Zod 스키마 (선택)
│   └── utils/
│       └── supabase/
│           ├── client.ts
│           └── server.ts
├── sentry.*.config.ts  # Sentry (루트 또는 src 상위)
├── next.config.ts
├── tailwind.config.ts  # 또는 Tailwind v4 시 globals.css @theme
├── tsconfig.json
└── package.json        # engines.node, TypeScript ~5.9.x, Tailwind 추천 v4
```

---

## 12. 적용 순서 권장

1. 상위 디렉터리에서 `create-next-app` 실행 → `apps/web` 생성.
2. `apps/web`로 이동 후:
   - Tailwind 추천 버전(v4) 확인: v3가 설치됐으면 `npx @tailwindcss/upgrade@next` 또는 수동으로 v4 전환.
   - TypeScript ~5.9.x 지정, `.nvmrc` 및 `engines` 추가.
3. Supabase (`@supabase/ssr`, `@supabase/supabase-js`) + 클라이언트/서버 유틸 + `.env.example` 생성(위 5-1 내용) 후 `.env.local` 복사·작성.
4. TanStack Query v5 Provider + `layout.tsx` 적용.
5. React Hook Form, Zod, `@hookform/resolvers` 설치 및 예시 폼(선택).
6. TipTap 설치 및 최소 에디터 컴포넌트(선택).
7. Sentry 설정 (`withSentryConfig` + config 파일들).
8. Vercel Analytics + Speed Insights 추가.
9. `npm install`(또는 사용 패키지 매니저) 후 `npm run build`로 빌드 검증.

---

## 13. 개선 및 리팩토링 설계

초기 보일러플레이트가 갖춰진 뒤, 유지보수성과 확장성을 위해 아래 원칙으로 개선·리팩토링을 진행합니다.

### 13-1. 디렉터리 및 관심사 분리

- **`src/app/`**: 라우트·레이아웃·로딩/에러 UI만 두고, 비즈니스 로직은 `src/lib/`, `src/components/`, `src/features/` 등으로 분리.
- **`src/components/`**: 공통 UI는 `ui/`, 도메인/기능별 컴포넌트는 `features/` 또는 도메인 폴더로 구분해 중복 감소 및 재사용성 확보.
- **`src/lib/`**: `query-client.ts`, 유틸·헬퍼·상수, 클라이언트/서버 공용 로직. Supabase 클라이언트 생성은 `src/utils/supabase/` 유지.
- **`src/hooks/`**: 공통 `use*` 훅(예: `useDebounce`, `useAuth`)을 모아 의존성과 테스트를 단순화.

### 13-2. 데이터·API 계층

- **TanStack Query**: 쿼리 키는 `src/lib/query-keys.ts` 등에서 상수로 관리해 무효화·캐시 정책을 일관되게 유지.
- **Server Actions / Route Handlers**: 폼·뮤테이션은 가능한 한 Server Action으로 처리하고, 복잡한 API는 `src/app/api/` 라우트로 분리. Supabase 호출은 서버 유틸(`createServerClient`)만 사용해 키·권한 일원화.
- **타입**: Supabase 생성 타입·API 응답 타입은 `src/types/` 또는 각 도메인 하위에 두고, `import type`으로만 참조해 번들 크기·순환 참조를 관리.

### 13-3. 폼·검증

- **Zod 스키마**: `src/lib/validations/`(또는 `src/schemas/`)에 도메인별로 분리. 클라이언트·서버에서 동일 스키마 재사용해 검증 일치.
- **React Hook Form**: 공통 폼 래퍼·에러 표시 컴포넌트를 두어 스타일·접근성 일관성 유지.

### 13-4. 에러·로딩·접근성

- **에러 경계**: `app/error.tsx`, `app/global-error.tsx`와 중요 구간의 로컬 error boundary로 사용자 친화적 메시지·복구 유도.
- **로딩**: `loading.tsx`와 스켈레톤/스피너 컴포넌트를 공통화해 UX 일관성 확보.
- **접근성**: 시맨틱 마크업·`aria-*`·키보드 포커스 관리 원칙을 문서화하고, 공통 컴포넌트에 반영.

### 13-5. 성능·번들

- **동적 임포트**: 무거운 컴포넌트(TipTap 에디터 등)는 `next/dynamic`으로 lazy load.
- **이미지**: `next/image` 사용, 필요 시 도메인·크기 제한을 `next.config`에 명시.
- **환경 변수**: `NEXT_PUBLIC_*`는 필요한 것만 두고, 서버 전용 값은 노출하지 않도록 정리.

### 13-6. 적용 시점

- 초기 설정(1~10단계) 완료 후, 첫 기능(예: 로그인·목록·폼) 구현 시 위 구조를 적용.
- 디렉터리 구조(섹션 11)는 최소 필수만 두고, 기능이 늘어날 때마다 `features/`, `hooks/`, `types/`, `query-keys` 등을 단계적으로 도입해 리팩토링 부담을 분산.

---

## 주의사항

- **Tailwind v4**: 새 Next.js 15 프로젝트에는 v4 사용을 추천합니다. create-next-app이 v3를 설치하면 업그레이드 CLI 또는 공식 Next.js + Tailwind v4 가이드를 따라 v4로 맞춥니다.
- **Supabase 쿠키**: Next.js 15와 `cookies()` 동작 이슈가 있을 수 있으므로, 공식 `@supabase/ssr` 예제와 동일한 패턴을 따르는 것이 좋습니다.
- **web-hermit-comm**: 브랜치/태스크 이름으로 해석했으며, 필요 시 `package.json`의 `name`을 `"web-hermit-comm"`으로 설정하면 됩니다.

이 순서대로 진행하면 요청한 스택의 개발환경이 한 번에 구성됩니다.
