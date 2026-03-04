# 은둔마을 웹 (web-hermit-comm)

Next.js 16(App Router) 기반 웹 클라이언트입니다.

## 문서

- **[개발환경 설정 및 설계](SETUP_AND_DESIGN.md)** — 스택, 디렉터리 구조, 아키텍처, 배포

## 요약 스택

- Node.js 22 LTS, Next.js 16 (App Router, Turbopack), TypeScript ~5.9.x
- Tailwind CSS v4 (CSS-first, `@import "tailwindcss"`)
- Supabase (Auth + @supabase/ssr), TanStack Query v5
- React Hook Form + Zod, TipTap
- shadcn/ui (new-york style, neutral)
- Sentry, Vercel Analytics + Speed Insights

## 빠른 시작

```bash
# 1. Node.js 22 활성화
nvm use

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local에 실제 값 채우기

# 4. 개발 서버
npm run dev
```

## 배포

- **자동**: `git push origin main` → Vercel GitHub 연동 자동 빌드/배포
- **수동**: `vercel deploy --prod` (자동 배포 실패 시)
- **프로덕션 URL**: https://www.eundunmaeul.store

자세한 내용은 [SETUP_AND_DESIGN.md](SETUP_AND_DESIGN.md)를 참고하세요.
