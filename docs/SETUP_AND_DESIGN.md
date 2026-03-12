# 은둔마을 웹 — 개발환경 및 아키텍처 (web-hermit-comm)

Node.js 22, Next.js 16(App Router), Tailwind CSS v4, TypeScript 5.9.x, Supabase SSR, TanStack Query v5, React Hook Form + Zod, TipTap, shadcn/ui, Sentry, Vercel Analytics/Speed Insights 기반.

---

## 1. 환경 요구사항

- **Node.js**: 22 LTS (`.nvmrc: 22`, `engines.node: ">=22"`)
- **패키지 매니저**: npm
- **nvm 로드**: `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use`

---

## 2. 주요 명령어

```bash
npm run dev      # 개발 서버 시작
npm run build    # 프로덕션 빌드 (Sentry 소스맵 업로드 포함)
npm run lint     # ESLint 실행
```

---

## 3. 아키텍처

### Next.js 16 특이사항

- `middleware.ts` 대신 **`src/proxy.ts`** 사용. 함수명도 `middleware` → `proxy`.
- Supabase 세션 갱신(토큰 리프레시)은 `proxy.ts`에서 `supabase.auth.getUser()` 호출로 처리.
- 외부 서비스 인증 파일(네이버, 구글 등)은 `proxy.ts`에서 early return으로 직접 응답.

### Supabase 클라이언트 패턴

- **브라우저**: `src/utils/supabase/client.ts` — `createBrowserClient` (Client Component에서만)
- **서버**: `src/utils/supabase/server.ts` — `createServerClient` + `cookies()` (Server Component, Route Handler, Server Action에서 `await createClient()`)

### TanStack Query

- `src/lib/query-client.ts`: SSR/CSR 구분 싱글톤 (`getQueryClient()`). 서버에서는 매번 새 인스턴스, 브라우저에서는 싱글톤.
- `src/components/providers/query-provider.tsx`: `"use client"` QueryClientProvider.
- 기본 `staleTime`: 60초.

### Tailwind CSS v4

- CSS-first 방식. `tailwind.config.js` 없음.
- `src/app/globals.css`에서 `@import "tailwindcss"` 및 `@theme` 디렉티브로 테마 정의.

### shadcn/ui

- v3.8.5, new-york 스타일, neutral 컬러.
- 컴포넌트: `src/components/ui/` (button, card, badge, skeleton, dialog, dropdown-menu 등)

### 인증

- 전원 익명 자동 로그인 (`signInAnonymously`) — 앱 시작 시 자동 실행, 재시도 3회.
- 관리자만 `signInWithPassword`.
- `src/features/auth/` — AuthProvider, useAuth, auth.ts.

---

## 4. 환경 변수

`.env.example`을 복사해 `.env.local`을 만든 뒤 값을 채웁니다. `.env.local`은 git 제외.

### 네이밍 규칙

- 브라우저 노출 필요: `NEXT_PUBLIC_` 접두어
- 서버 전용: 접두어 없이

### 필수 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=gunnys
SENTRY_PROJECT=gns-hermit-comm
SENTRY_AUTH_TOKEN=

# Vercel (선택)
VERCEL_PROJECT_ID=
VERCEL_API_KEY=
```

---

## 5. 디렉터리 구조

```
apps/web/
├── .env.example           # 환경 변수 템플릿 (커밋)
├── .env.local             # 실제 값 (git 제외)
├── .nvmrc                 # 22
├── docs/                  # 설계·설정 문서
├── public/                # 정적 파일 (favicon 등)
├── src/
│   ├── app/               # 라우트·레이아웃·페이지만
│   │   ├── layout.tsx     # Providers, Analytics, SpeedInsights, BottomNav
│   │   ├── page.tsx       # 홈 (PublicFeed)
│   │   ├── create/        # 게시글 작성
│   │   ├── post/[id]/     # 게시글 상세·수정
│   │   ├── search/        # 검색
│   │   └── admin/         # 관리자 대시보드·로그인
│   ├── components/
│   │   ├── layout/        # Header, BottomNav, ScrollToTop
│   │   ├── providers/     # QueryProvider
│   │   └── ui/            # shadcn/ui 컴포넌트
│   ├── features/
│   │   ├── auth/          # AuthProvider, useAuth, auth.ts
│   │   ├── posts/         # API, hooks, PostCard, PostDetailView, CreatePostForm, RichEditor
│   │   ├── comments/      # API, hooks, CommentSection, CommentItem, CommentForm
│   │   ├── reactions/     # API, hooks, ReactionBar
│   │   └── admin/         # adminApi, useIsAdmin
│   ├── hooks/             # useRealtimePosts 등 공통 훅
│   ├── lib/               # constants, schemas, query-client, anonymous, utils
│   ├── types/             # database.ts (DB 타입)
│   └── utils/supabase/    # client.ts, server.ts
├── src/proxy.ts           # Supabase 세션 갱신 프록시 (Next.js 16)
├── sentry.*.config.ts     # Sentry 설정 (client/server/edge)
├── next.config.ts         # withSentryConfig 래핑
└── package.json
```

---

## 6. 라우트 구조

| 경로 | 설명 |
|------|------|
| `/` | 공개 피드 홈 (감정트렌드, 무한스크롤, 최신/인기순) |
| `/search` | 게시글 검색 (500ms 디바운스, 감정 필터) |
| `/create` | 게시글 작성 (TipTap + 이미지 업로드) |
| `/post/[id]` | 게시글 상세 (감정태그, 반응바, 댓글, AI분석) |
| `/post/[id]/edit` | 게시글 수정 |
| `/admin` | 관리자 대시보드 |
| `/admin/login` | 관리자 이메일 로그인 |

---

## 7. DB 주요 테이블

- `posts` / `posts_with_like_count` (view) — 게시글 + like_count + comment_count + emotions
  - **뷰에 `deleted_at` 컬럼 없음** — 뷰 내부 `WHERE p.deleted_at IS NULL`이 처리
  - `.is('deleted_at', null)` 필터 사용 시 42703 에러 → **절대 사용 금지**
- `comments` — 댓글 (소프트 삭제: deleted_at)
- `reactions` — 집계 카운트 (reaction_type: `'like' 'heart' 'laugh' 'sad' 'surprise'`)
- `user_reactions` — 개인 반응 기록 (토글용)
- `post_analysis` — 감정 분석 결과 (emotions TEXT[])
- `boards`, `app_admin`

---

## 8. Vercel 배포

### 배포 방식

- **자동**: `git push origin main` → Vercel GitHub 연동 자동 빌드/배포
- **수동**: `vercel deploy --prod` (자동 배포 실패 시)
- Hobby 플랜 동시 빌드 1개 — 짧은 시간에 여러 커밋 연속 푸시 시 이전 빌드 취소됨. **변경사항을 모아서 한 번에 푸시** 권장.

### Vercel CLI

```bash
# 프로젝트 링크
vercel link --yes --scope jeonggeon-parks-projects --project web

# 배포 목록 확인
vercel ls web --scope jeonggeon-parks-projects

# 수동 프로덕션 배포
vercel deploy --prod

# 배포 상태 확인
vercel inspect <deployment-url>
```

### 정적 파일 주의사항

- `public/` 디렉토리의 정적 파일은 루트 URL로 서빙됨.
- `src/proxy.ts` matcher가 가로챌 수 있으므로, proxy를 거치지 않아야 할 파일은 proxy 함수 내에서 early return 처리.
- 외부 서비스 인증 파일(네이버, 구글 등)은 proxy에서 직접 응답하는 방식이 가장 확실함.

### 프로덕션 정보

- **URL**: https://www.eundunmaeul.store
- **Vercel 프로젝트**: `jeonggeon-parks-projects/web`

---

## 9. 멀티프로젝트 관리

이 웹 레포, 앱 레포(`/mnt/c/Users/Administrator/programming/apps/gns-hermit-comm`), **중앙 Supabase 프로젝트**(`~/apps/supabase-hermit`)가 동일 Supabase 백엔드를 공유.

### 역할 경계

- **Supabase 마이그레이션 정본**: `~/apps/supabase-hermit`
- **Edge Functions**: 앱 레포의 `supabase/functions/`
- **웹 레포**: 마이그레이션 읽기 전용 복사본

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
cd ~/apps/web-hermit-comm && bash scripts/sync-from-app.sh
```

### 동기화 주의사항

- `src/lib/anonymous.ts` (별칭 해시): **앱과 독립 유지**
- `src/lib/constants.ts`의 `VALIDATION`, `ALLOWED_EMOTIONS`, `EMOTION_EMOJI` — 앱과 동일하게 유지
- **앱/웹 레포에서 직접 마이그레이션 생성 금지** — 반드시 중앙 프로젝트에서

---

## 10. Edge Functions

| 함수명 | 호출 방식 | 설명 |
|--------|----------|------|
| `analyze-post` | DB INSERT 트리거 | 최신 미분석 게시글 자동 분석 |
| `analyze-post-on-demand` | 수동 (`{ postId: number }`) | 특정 게시글 분석 |
| `recommend-posts-by-emotion` | RPC 기반 | 감정 기반 게시글 추천 |

- 모든 함수에 `content_too_short` 스킵 조건 있음

---

## 11. Sentry

- `next.config.ts`: `withSentryConfig` 래핑
- org: `gunnys`, project: `gns-hermit-comm`
- `sentry.client.config.ts` / `sentry.server.config.ts` / `sentry.edge.config.ts` 분리
- 빌드 시 소스맵 업로드에 `SENTRY_AUTH_TOKEN` 필요
