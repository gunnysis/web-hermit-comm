# 은둔마을 웹 (web-hermit-comm)

Next.js 15(App Router) 기반 웹 클라이언트입니다.

## 문서

- **[개발환경 설정 및 설계](docs/SETUP_AND_DESIGN.md)** — 스택, 설치 순서, 디렉터리 구조, 개선·리팩토링 설계

## 요약 스택

- Node.js 22 LTS, Next.js 15 (App Router), TypeScript ~5.9.x
- Tailwind CSS v4 (추천)
- Supabase (Auth + @supabase/ssr), TanStack Query v5
- React Hook Form + Zod, TipTap
- Sentry, Vercel Analytics + Speed Insights

환경 변수는 `.env.example`을 복사해 `.env.local`을 만든 뒤 값을 채우세요. 자세한 내용은 [SETUP_AND_DESIGN.md](docs/SETUP_AND_DESIGN.md)를 참고하세요.
