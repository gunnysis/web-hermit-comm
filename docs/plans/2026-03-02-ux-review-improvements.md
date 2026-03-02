# UX Review & Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 웹 전반의 버그 수정, UX 개선, 신규 기능 추가를 통해 은둔마을 웹 클라이언트의 품질을 향상시킨다.

**Architecture:** 기존 Next.js 16 App Router + TanStack Query + shadcn/ui 구조를 유지하면서 파일별로 독립적 수정. 공유 컴포넌트는 `src/components/ui/` 또는 `src/components/layout/`에 추가. 앱(React Native)과의 기능 패리티를 참고 기준으로 삼는다.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, TanStack Query v5, Supabase, shadcn/ui, Tiptap, date-fns

---

## P0 — 사전 작업: 기존 unstaged 변경사항 커밋

현재 `constants.ts`, `schemas.ts`, `database.ts`에 앱과의 동기화 작업이 unstaged 상태.

### Task 0: 기존 변경사항 커밋

**Files:**
- Staged: `src/lib/constants.ts`, `src/lib/schemas.ts`, `src/types/database.ts`

**Step 1: 변경 내용 확인**

```bash
git diff src/lib/constants.ts src/lib/schemas.ts src/types/database.ts
```

Expected: VALIDATION 상수 추가, 스키마 상수화, 타입 개선 확인

**Step 2: 커밋**

```bash
git add src/lib/constants.ts src/lib/schemas.ts src/types/database.ts
git commit -m "sync: app과 constants/schemas/database 타입 동기화"
```

---

## P1 — B7: 감정 목록 동기화 (CRITICAL)

Edge Function이 분석에 사용하는 감정 목록과 프론트엔드 `constants.ts`가 다름.
실제 Claude AI가 반환하는 감정(`고립감`, `무기력` 등)이 UI에서 `💬`로만 표시됨.

**Edge Function VALID_EMOTIONS (정답):**
`고립감, 무기력, 불안, 외로움, 슬픔, 그리움, 두려움, 답답함, 설렘, 기대감, 안도감, 평온함, 즐거움`

### Task 1: 웹 constants.ts 감정 목록 교체

**Files:**
- Modify: `src/lib/constants.ts`

**Step 1: ALLOWED_EMOTIONS 및 EMOTION_EMOJI 업데이트**

`src/lib/constants.ts`의 `ALLOWED_EMOTIONS`와 `EMOTION_EMOJI`를 다음으로 교체:

```typescript
export const ALLOWED_EMOTIONS = [
  '고립감', '무기력', '불안', '외로움', '슬픔',
  '그리움', '두려움', '답답함', '설렘', '기대감',
  '안도감', '평온함', '즐거움',
] as const

export const EMOTION_EMOJI: Record<string, string> = {
  고립감: '🫥', 무기력: '😶', 불안: '😰', 외로움: '😔', 슬픔: '😢',
  그리움: '💭', 두려움: '😨', 답답함: '😤', 설렘: '💫', 기대감: '🌱',
  안도감: '😮‍💨', 평온함: '😌', 즐거움: '😊',
}
```

**Step 2: 앱 constants.ts도 동일하게 업데이트**

파일: `C:\Users\Administrator\programming\apps\gns-hermit-comm\src\shared\lib\constants.ts`

동일한 `ALLOWED_EMOTIONS`와 `EMOTION_EMOJI`로 교체.

**Step 3: 커밋 (웹)**

```bash
git add src/lib/constants.ts
git commit -m "fix(emotions): Edge Function 감정 목록과 UI 동기화"
```

---

## P2 — 버그 수정

### Task 2: B1 — 뒤로가기 안전화

**Files:**
- Modify: `src/features/posts/components/PostDetailView.tsx:96`

**문제:** `router.back()`은 history가 없으면 앱 밖으로 이탈함.

**Step 1: 뒤로가기 핸들러 수정**

`PostDetailView.tsx`에서 `router.back()` 호출 부분을 찾아 수정:

```typescript
// 기존
<Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
  <ArrowLeft size={16} className="mr-1" /> 뒤로
</Button>

// 수정 후
<Button
  variant="ghost"
  size="sm"
  onClick={() => {
    if (window.history.length > 1) {
      router.back()
    } else {
      const groupId = post?.group_id
      router.push(groupId ? `/groups/${groupId}` : '/')
    }
  }}
  className="-ml-2"
>
  <ArrowLeft size={16} className="mr-1" /> 뒤로
</Button>
```

**Step 2: 브라우저 테스트**

- 새 탭에서 `/post/[id]` 직접 접근 → "뒤로" 클릭 → 홈(`/`) 또는 그룹으로 이동 확인
- 피드에서 게시글 클릭 후 "뒤로" → 피드로 이동 확인

**Step 3: 커밋**

```bash
git add src/features/posts/components/PostDetailView.tsx
git commit -m "fix: 게시글 상세에서 뒤로가기 안전화 (history 없을 때 홈으로)"
```

---

### Task 3: B2 — 검색 URL 초기화

**Files:**
- Modify: `src/features/posts/components/SearchView.tsx:22-28`

**문제:** 검색어를 지워도 URL에 `?q=이전검색어` 가 잔존.

**Step 1: URL 초기화 로직 추가**

`SearchView.tsx`의 `useEffect` 수정:

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    const trimmed = input.trim()
    setQuery(trimmed)
    if (trimmed) {
      router.replace(`/search?q=${encodeURIComponent(trimmed)}`, { scroll: false })
    } else {
      router.replace('/search', { scroll: false })
    }
  }, 500)
  return () => clearTimeout(timer)
}, [input, router])
```

**Step 2: 테스트**

- 검색어 입력 후 `/search?q=검색어` 확인
- 검색어 전체 삭제 후 URL이 `/search`로 바뀌는지 확인

**Step 3: 커밋**

```bash
git add src/features/posts/components/SearchView.tsx
git commit -m "fix: 검색어 삭제 시 URL 쿼리 파라미터 초기화"
```

---

### Task 4: B3 — confirm() → Dialog 컴포넌트 교체

shadcn `Dialog`를 사용하는 재사용 가능한 `ConfirmDialog` 컴포넌트를 만들어 게시글/댓글 삭제에 적용.

**Files:**
- Create: `src/components/ui/confirm-dialog.tsx`
- Modify: `src/features/posts/components/PostDetailView.tsx`
- Modify: `src/features/comments/components/CommentItem.tsx`

**Step 1: ConfirmDialog 컴포넌트 생성**

`src/components/ui/confirm-dialog.tsx`:

```typescript
'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
  isPending?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '확인',
  onConfirm,
  isPending,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? '처리 중...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: PostDetailView에서 삭제 confirm 교체**

`src/features/posts/components/PostDetailView.tsx`:

1. import 추가:
```typescript
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
```

2. state 추가 (컴포넌트 내부):
```typescript
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [isDeleting, setIsDeleting] = useState(false)
```

3. `handleDelete` 수정 — `confirm()` 제거, Dialog로 처리:
```typescript
const handleDelete = async () => {
  setIsDeleting(true)
  try {
    await deletePost(postId)
    toast.success('게시글이 삭제됐습니다.')
    const groupId = post?.group_id
    router.push(groupId ? `/groups/${groupId}` : '/')
    queryClient.removeQueries({ queryKey: ['post', postId] })
    queryClient.invalidateQueries({ queryKey: ['boardPosts'] })
    queryClient.invalidateQueries({ queryKey: ['groupPosts'] })
  } catch (err) {
    console.error('deletePost error:', err)
    toast.error('삭제에 실패했습니다.')
  } finally {
    setIsDeleting(false)
    setDeleteDialogOpen(false)
  }
}
```

4. DropdownMenuItem 수정:
```typescript
<DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
  <Trash2 size={14} className="mr-2" /> 삭제
</DropdownMenuItem>
```

5. article 내에 ConfirmDialog 추가:
```tsx
<ConfirmDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  title="게시글을 삭제할까요?"
  description="삭제한 게시글은 복구할 수 없습니다."
  confirmLabel="삭제"
  onConfirm={handleDelete}
  isPending={isDeleting}
/>
```

**Step 3: CommentItem에서 삭제 confirm 교체**

`src/features/comments/components/CommentItem.tsx`:

1. import 추가:
```typescript
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
```

2. state 추가:
```typescript
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
```

3. `handleDelete` 수정:
```typescript
const handleDelete = () => {
  deleteMutation.mutate(comment.id, {
    onSettled: () => setDeleteDialogOpen(false),
  })
}
```

4. DropdownMenuItem 수정:
```typescript
<DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
  <Trash2 size={14} className="mr-2" /> 삭제
</DropdownMenuItem>
```

5. div 내에 ConfirmDialog 추가:
```tsx
<ConfirmDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  title="댓글을 삭제할까요?"
  confirmLabel="삭제"
  onConfirm={handleDelete}
  isPending={deleteMutation.isPending}
/>
```

**Step 4: 테스트**

- 게시글 삭제 버튼 클릭 → Dialog 표시 확인
- 취소 클릭 → Dialog 닫힘, 삭제 안 됨 확인
- 삭제 클릭 → 삭제 후 이동 확인
- 댓글 삭제도 동일하게 확인

**Step 5: 커밋**

```bash
git add src/components/ui/confirm-dialog.tsx \
        src/features/posts/components/PostDetailView.tsx \
        src/features/comments/components/CommentItem.tsx
git commit -m "feat: confirm() 삭제 다이얼로그를 shadcn Dialog로 교체"
```

---

### Task 5: B4 — CreateGroupPostForm 이미지 제거 버그 수정

**Files:**
- Modify: `src/features/community/components/CreateGroupPostForm.tsx`

**문제:** 이미지 X 버튼 클릭 후 fileInput value 미리셋 → 동일 파일 재선택 불가.

**Step 1: fileInputRef 추가 및 핸들러 수정**

`CreateGroupPostForm.tsx`에서:

1. `useRef` import 확인 (이미 있음)

2. `fileInputRef` 추가:
```typescript
const fileInputRef = useRef<HTMLInputElement>(null)
```

3. X 버튼 onClick 핸들러를 별도 함수로 분리:
```typescript
const handleRemoveImage = () => {
  setImageFile(null)
  setImagePreview(null)
  if (fileInputRef.current) fileInputRef.current.value = ''
}
```

4. `<input>` 태그에 `ref={fileInputRef}` 추가, X 버튼에 `onClick={handleRemoveImage}` 사용

5. "이미지 첨부" 버튼도 `onClick={() => fileInputRef.current?.click()}` 으로 변경

**Step 2: 테스트**

- 이미지 첨부 → X 클릭 → 동일 파일 다시 선택 → 정상 첨부 확인

**Step 3: 커밋**

```bash
git add src/features/community/components/CreateGroupPostForm.tsx
git commit -m "fix: 그룹 포스트 폼 이미지 제거 후 동일 파일 재선택 가능하도록 수정"
```

---

### Task 6: B5 — GroupPage 권한 체크 UI 보완

**Files:**
- Modify: `src/app/groups/[groupId]/page.tsx`

**문제 1:** `memberLoading` 중에 권한 체크 UI가 없어 순간 flash 발생.
**문제 2:** `user`가 null인 경우 처리 없음.

**Step 1: 로딩 중 스켈레톤, 미로그인 안내 추가**

`groups/[groupId]/page.tsx`의 권한 체크 로직 교체:

기존:
```typescript
if (!member && !memberLoading && user) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
      <p className="text-muted-foreground">이 그룹에 접근할 권한이 없습니다.</p>
      ...
    </div>
  )
}
```

수정 후 — 기존 return 위에 추가:
```typescript
// 미로그인
if (!user && !memberLoading) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
      <p className="text-muted-foreground">로그인이 필요합니다.</p>
      <Button variant="outline" onClick={() => router.push('/groups')}>
        <ArrowLeft size={14} className="mr-1" /> 그룹 목록으로
      </Button>
    </div>
  )
}

// 멤버 로딩 중
if (memberLoading) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-8 w-32" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  )
}
```

**Step 2: 테스트**

- 로그아웃 상태에서 `/groups/1` 접근 → 로그인 안내 확인
- 멤버가 아닌 사용자 접근 → "접근 권한 없음" 확인
- 정상 멤버 접근 → 피드 표시 확인

**Step 3: 커밋**

```bash
git add "src/app/groups/[groupId]/page.tsx"
git commit -m "fix: 그룹 페이지 권한 체크 로딩 및 미로그인 상태 처리 추가"
```

---

### Task 7: B6 — RichEditor placeholder 동작 수정

**Files:**
- Modify: `src/features/posts/components/RichEditor.tsx`
- Modify: `src/app/globals.css`

**문제:** Tiptap `EditorContent`에 `placeholder` prop 전달 불가 — CSS pseudo-element로 처리해야 함.

**Step 1: Tiptap Placeholder extension 설치**

```bash
npm install @tiptap/extension-placeholder
```

**Step 2: RichEditor.tsx 수정**

```typescript
import Placeholder from '@tiptap/extension-placeholder'

// extensions 배열에 추가:
extensions: [
  StarterKit,
  Image.configure({ inline: false, allowBase64: false }),
  Placeholder.configure({ placeholder: placeholder ?? '내용을 입력하세요...' }),
],
```

`EditorContent`에서 `placeholder` prop 제거 (불필요):
```tsx
<EditorContent editor={editor} />
```

**Step 3: globals.css에 placeholder 스타일 추가**

`src/app/globals.css`의 `@layer utilities` 블록에 추가:

```css
/* Tiptap placeholder */
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--muted-foreground);
  pointer-events: none;
  height: 0;
}
```

**Step 4: 테스트**

- `/create` 페이지 접근 → 에디터 빈 상태에서 "내용을 입력하세요..." 표시 확인
- 텍스트 입력 시 placeholder 사라짐 확인

**Step 5: 커밋**

```bash
git add src/features/posts/components/RichEditor.tsx src/app/globals.css
git commit -m "fix: Tiptap placeholder 미동작 수정 (@tiptap/extension-placeholder 적용)"
```

---

## P3 — UX 개선

### Task 8: U1 — 그룹 페이지 그룹명 표시

**Files:**
- Modify: `src/app/groups/[groupId]/page.tsx`
- Modify: `src/features/community/api/communityApi.ts` (그룹 조회 API 없으면 추가)
- Create (optional): `src/features/community/hooks/useGroup.ts`

**Step 1: communityApi.ts에 getGroup 추가 확인/추가**

`src/features/community/api/communityApi.ts` 파일 확인 후, 없으면 추가:

```typescript
export async function getGroup(groupId: number): Promise<Group | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()
  if (error) return null
  return data as Group
}
```

**Step 2: useGroup 훅 생성**

`src/features/community/hooks/useGroup.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import { getGroup } from '../api/communityApi'

export function useGroup(groupId: number) {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroup(groupId),
    staleTime: 5 * 60 * 1000,
  })
}
```

**Step 3: GroupPage 헤더에 그룹명 추가**

`groups/[groupId]/page.tsx` import 추가:
```typescript
import { useGroup } from '@/features/community/hooks/useGroup'
```

컴포넌트 내부 추가:
```typescript
const { data: group } = useGroup(groupId)
```

헤더 div 수정 — 가운데에 그룹명 추가:
```tsx
<div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
  <Button variant="ghost" size="icon" onClick={() => router.push('/groups')}>
    <ArrowLeft size={18} />
  </Button>
  <span className="font-semibold text-sm truncate px-2">
    {group?.name ?? ''}
  </span>
  <div className="flex items-center gap-1">
    {/* 기존 버튼들 */}
  </div>
</div>
```

**Step 4: 테스트**

- 그룹 상세 페이지 접근 → 헤더 중앙에 그룹명 표시 확인

**Step 5: 커밋**

```bash
git add src/features/community/api/communityApi.ts \
        src/features/community/hooks/useGroup.ts \
        "src/app/groups/[groupId]/page.tsx"
git commit -m "feat: 그룹 상세 페이지 헤더에 그룹명 표시"
```

---

### Task 9: U2 — PostCard 좋아요 아이콘 통일

**Files:**
- Modify: `src/features/posts/components/PostCard.tsx`

**문제:** 피드 카드는 `Heart` 아이콘, 상세 반응바는 이모지 버튼 → 시각적 불일치.

**Step 1: 아이콘 변경**

`PostCard.tsx`에서:
- `Heart` import 제거
- `ThumbsUp` import 추가
- `<Heart size={13} />` → `<ThumbsUp size={13} />` 교체

**Step 2: 테스트**

- 홈 피드에서 포스트 카드 → 좋아요 수 옆에 ThumbsUp 아이콘 확인

**Step 3: 커밋**

```bash
git add src/features/posts/components/PostCard.tsx
git commit -m "fix: PostCard 좋아요 아이콘 ThumbsUp으로 통일"
```

---

### Task 10: U3 — EmptyState 공유 컴포넌트 생성 및 적용

앱의 `EmptyState.tsx` 패턴을 참고하여 웹용 공유 EmptyState 컴포넌트를 만들고, 빈 상태 메시지를 표시하는 모든 곳에 적용.

**Files:**
- Create: `src/components/ui/empty-state.tsx`
- Modify: `src/features/posts/components/PublicFeed.tsx`
- Modify: `src/app/groups/page.tsx`
- Modify: `src/features/posts/components/SearchView.tsx`
- Modify: `src/features/comments/components/CommentSection.tsx`

**Step 1: EmptyState 컴포넌트 생성**

`src/components/ui/empty-state.tsx`:

```typescript
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 gap-3 text-center', className)}>
      <div className="rounded-full bg-muted p-4">
        <Icon size={24} className="text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}
```

**Step 2: PublicFeed 빈 상태 적용**

`PublicFeed.tsx`:

```typescript
import { EmptyState } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'

// 기존
{!isLoading && posts.length === 0 && (
  <p className="text-center text-muted-foreground py-16">아직 게시글이 없습니다.</p>
)}

// 수정 후
{!isLoading && posts.length === 0 && (
  <EmptyState icon={FileText} title="아직 게시글이 없습니다" description="첫 번째 글을 작성해보세요." />
)}
```

**Step 3: groups/page.tsx 빈 상태 적용**

```typescript
import { EmptyState } from '@/components/ui/empty-state'
import { Users } from 'lucide-react'

// 기존
{!isLoading && groups?.length === 0 && (
  <p className="text-center text-muted-foreground py-12">
    아직 참여한 그룹이 없습니다.<br />
    <span className="text-sm">초대 코드로 그룹에 참여해보세요.</span>
  </p>
)}

// 수정 후
{!isLoading && groups?.length === 0 && (
  <EmptyState
    icon={Users}
    title="참여한 그룹이 없습니다"
    description="초대 코드로 그룹에 참여해보세요."
  />
)}
```

**Step 4: SearchView 빈 상태 적용**

```typescript
import { EmptyState } from '@/components/ui/empty-state'
import { Search as SearchIcon } from 'lucide-react'

// 검색 전 안내
{!query && (
  <EmptyState icon={SearchIcon} title="검색어를 입력하세요" />
)}

// 결과 없음
{!isLoading && query && data?.length === 0 && (
  <EmptyState
    icon={SearchIcon}
    title={`'${query}'에 대한 결과가 없습니다`}
    description="다른 검색어를 시도해보세요."
  />
)}
```

**Step 5: CommentSection 빈 상태 적용**

```typescript
import { EmptyState } from '@/components/ui/empty-state'
import { MessageCircle } from 'lucide-react'

// 기존
{query.data?.length === 0 && (
  <p className="text-sm text-muted-foreground text-center py-6">
    아직 댓글이 없습니다.
  </p>
)}

// 수정 후
{query.data?.length === 0 && (
  <EmptyState icon={MessageCircle} title="아직 댓글이 없습니다" className="py-8" />
)}
```

**Step 6: 커밋**

```bash
git add src/components/ui/empty-state.tsx \
        src/features/posts/components/PublicFeed.tsx \
        src/app/groups/page.tsx \
        src/features/posts/components/SearchView.tsx \
        src/features/comments/components/CommentSection.tsx
git commit -m "feat: EmptyState 공유 컴포넌트 추가 및 전체 적용"
```

---

### Task 11: U4 — RichEditor 툴바 확장

**Files:**
- Modify: `src/features/posts/components/RichEditor.tsx`

**Step 1: 툴바 버튼 추가**

`RichEditor.tsx`의 툴바 배열에 추가:

```typescript
{ label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: '굵게' },
{ label: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: '기울임' },
{ label: 'S', action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), title: '취소선' },
{ label: '—', action: () => editor.chain().focus().setHorizontalRule().run(), active: false, title: '구분선' },
{ label: '•', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), title: '목록' },
{ label: '1.', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), title: '번호 목록' },
{ label: '"', action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), title: '인용구' },
```

버튼에 `title` prop 추가:
```tsx
<button
  key={label}
  type="button"
  onClick={action}
  title={title}
  className={cn(
    'px-2 py-0.5 text-xs border rounded hover:bg-accent',
    active && 'bg-accent font-bold',
  )}
>
  {label}
</button>
```

**Step 2: 테스트**

- `/create` 접근 → 에디터 툴바에 `•`, `1.`, `"` 버튼 표시 확인
- 각 버튼 클릭 → 해당 서식 적용 확인

**Step 3: 커밋**

```bash
git add src/features/posts/components/RichEditor.tsx
git commit -m "feat: 에디터 툴바에 목록/인용구 버튼 추가"
```

---

### Task 12: U5 — 미로그인 사용자 안내

**Files:**
- Modify: `src/features/comments/components/CommentForm.tsx`
- Modify: `src/app/create/page.tsx`

**Step 1: CommentForm 미로그인 안내 추가**

`CommentForm.tsx` 확인 후, `userId` null 체크:

```typescript
if (!userId) {
  return (
    <p className="text-sm text-muted-foreground text-center py-4">
      댓글을 작성하려면 로그인이 필요합니다.
    </p>
  )
}
```

**Step 2: /create 페이지 미로그인 안내**

`src/app/create/page.tsx`에서 `user` 상태 확인 후 안내 UI 추가:

```typescript
'use client'
import { useAuthContext } from '@/features/auth/AuthProvider'
import { Header } from '@/components/layout/Header'
import { CreatePostForm } from '@/features/posts/components/CreatePostForm'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function CreatePage() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  // 로딩 중에는 아무것도 렌더링 안 함
  if (loading) return null

  if (!user) {
    return (
      <>
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
          <p className="text-muted-foreground">글을 작성하려면 로그인이 필요합니다.</p>
          <Button variant="outline" onClick={() => router.push('/')}>홈으로</Button>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <h1 className="text-xl font-bold mb-4">새 글쓰기</h1>
        <CreatePostForm />
      </main>
    </>
  )
}
```

**Step 3: 테스트**

- 로그아웃 상태 → `/create` 접근 → 안내 메시지 표시 확인
- 로그인 상태 → 글쓰기 폼 표시 확인

**Step 4: 커밋**

```bash
git add src/features/comments/components/CommentForm.tsx \
        src/app/create/page.tsx
git commit -m "feat: 미로그인 사용자에게 댓글/글쓰기 로그인 안내 추가"
```

---

## P4 — 신규 기능

### Task 13: N1 — 감정 태그 클릭 필터링

감정 배지 클릭 시 해당 감정으로 필터링된 게시글 목록을 검색 페이지에서 보여줌.

**Files:**
- Modify: `src/features/posts/components/EmotionTags.tsx`
- Modify: `src/features/posts/api/searchApi.ts`
- Modify: `src/features/posts/components/SearchView.tsx`

**Step 1: searchApi.ts에 감정 필터 지원 추가**

`src/features/posts/api/searchApi.ts` 확인 후 emotion 파라미터 추가:

```typescript
export async function searchPosts(query: string, emotion?: string): Promise<PostWithCounts[]> {
  const supabase = createClient()
  let dbQuery = supabase
    .from('posts_with_like_count')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)

  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
  }

  if (emotion) {
    dbQuery = dbQuery.contains('emotions', [emotion])
  }

  const { data, error } = await dbQuery
  if (error) throw error
  return (data ?? []) as PostWithCounts[]
}
```

**Step 2: SearchView에서 emotion 파라미터 처리**

`SearchView.tsx`:

```typescript
const initialEmotion = searchParams.get('emotion') ?? ''
const [emotionFilter, setEmotionFilter] = useState(initialEmotion)

// useQuery queryKey에 emotion 추가
const { data, isLoading } = useQuery({
  queryKey: ['search', query, emotionFilter],
  queryFn: () => searchPosts(query, emotionFilter || undefined),
  enabled: query.length > 0 || emotionFilter.length > 0,
  staleTime: 30 * 1000,
})

// emotion 필터 표시 (필터 활성화 시)
{emotionFilter && (
  <div className="flex items-center gap-2">
    <span className="text-sm text-muted-foreground">감정 필터:</span>
    <Badge variant="secondary" className="gap-1">
      {EMOTION_EMOJI[emotionFilter] ?? '💬'} {emotionFilter}
      <button onClick={() => { setEmotionFilter(''); router.replace('/search', { scroll: false }) }}>
        <X size={12} />
      </button>
    </Badge>
  </div>
)}
```

URL 동기화 useEffect 수정:
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    const trimmed = input.trim()
    setQuery(trimmed)
    const params = new URLSearchParams()
    if (trimmed) params.set('q', trimmed)
    if (emotionFilter) params.set('emotion', emotionFilter)
    const url = params.toString() ? `/search?${params}` : '/search'
    router.replace(url, { scroll: false })
  }, 500)
  return () => clearTimeout(timer)
}, [input, emotionFilter, router])
```

**Step 3: EmotionTags 컴포넌트 클릭 가능하게 수정**

`src/features/posts/components/EmotionTags.tsx` 확인 후:

```typescript
import Link from 'next/link'
import { EMOTION_EMOJI } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'

interface EmotionTagsProps {
  emotions?: string[] | null
  clickable?: boolean
}

export function EmotionTags({ emotions, clickable = false }: EmotionTagsProps) {
  if (!emotions?.length) return null

  return (
    <div className="flex flex-wrap gap-1">
      {emotions.map((emotion) => {
        const badge = (
          <Badge key={emotion} variant="secondary" className="text-xs gap-1 py-0">
            <span>{EMOTION_EMOJI[emotion] ?? '💬'}</span>
            {emotion}
          </Badge>
        )

        if (clickable) {
          return (
            <Link
              key={emotion}
              href={`/search?emotion=${encodeURIComponent(emotion)}`}
              onClick={(e) => e.stopPropagation()}
            >
              {badge}
            </Link>
          )
        }

        return badge
      })}
    </div>
  )
}
```

`PostDetailView.tsx`에서 `<EmotionTags emotions={emotions} clickable />` 로 변경.

**Step 4: 테스트**

- 게시글 상세에서 감정 배지 클릭 → `/search?emotion=슬픔` 이동
- 해당 감정 포함 게시글 목록 표시 확인
- 필터 X 클릭 → 필터 해제 확인

**Step 5: 커밋**

```bash
git add src/features/posts/api/searchApi.ts \
        src/features/posts/components/SearchView.tsx \
        src/features/posts/components/EmotionTags.tsx \
        src/features/posts/components/PostDetailView.tsx
git commit -m "feat: 감정 태그 클릭 시 감정 기반 게시글 필터링"
```

---

### Task 14: N2 — 게시글 URL 공유 버튼

앱의 `handleShare` 패턴 참고. 웹에서는 `navigator.clipboard`로 URL 복사.

**Files:**
- Modify: `src/features/posts/components/PostDetailView.tsx`

**Step 1: 공유 버튼 추가**

`PostDetailView.tsx`:

1. import 추가:
```typescript
import { ArrowLeft, MoreHorizontal, Pencil, Trash2, Share2 } from 'lucide-react'
```

2. 공유 핸들러 추가:
```typescript
const handleShare = async () => {
  const url = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({ title: post?.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('링크가 복사됐습니다.')
    }
  } catch {
    // 사용자가 공유 취소 시 무시
  }
}
```

3. 헤더 내 버튼 추가 (뒤로가기 버튼과 더보기 메뉴 사이):
```tsx
<div className="flex items-center gap-1">
  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShare}>
    <Share2 size={16} />
  </Button>
  {canEdit && (
    <DropdownMenu>
      {/* 기존 코드 */}
    </DropdownMenu>
  )}
</div>
```

**Step 2: 테스트**

- 게시글 상세에서 공유 버튼 클릭 → URL 복사 토스트 또는 시스템 공유 다이얼로그
- 복사된 URL로 게시글 접근 확인

**Step 3: 커밋**

```bash
git add src/features/posts/components/PostDetailView.tsx
git commit -m "feat: 게시글 URL 공유 버튼 추가"
```

---

### Task 15: N3 — 스크롤 to top 버튼

**Files:**
- Create: `src/components/layout/ScrollToTop.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: ScrollToTop 컴포넌트 생성**

`src/components/layout/ScrollToTop.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        'fixed bottom-20 right-4 z-40 h-9 w-9 rounded-full shadow-md',
        'md:bottom-6',
        'animate-fade-in',
      )}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="맨 위로"
    >
      <ChevronUp size={16} />
    </Button>
  )
}
```

**Step 2: layout.tsx에 추가**

`src/app/layout.tsx`:

```typescript
import { ScrollToTop } from '@/components/layout/ScrollToTop'

// BottomNav 아래에 추가
<BottomNav />
<ScrollToTop />
```

**Step 3: 테스트**

- 홈 피드에서 300px 이상 스크롤 → 우하단 버튼 표시
- 클릭 → 부드럽게 상단 이동
- 모바일: BottomNav 위에 겹치지 않는지 확인

**Step 4: 커밋**

```bash
git add src/components/layout/ScrollToTop.tsx src/app/layout.tsx
git commit -m "feat: 스크롤 to top 버튼 추가"
```

---

## 최종 확인

모든 Task 완료 후:

```bash
npm run lint
npm run build
```

빌드 에러 없음 확인 후 최종 커밋 필요 시:
```bash
git log --oneline -15
```
