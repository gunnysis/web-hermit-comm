'use client'

import { useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { cn } from '@/lib/utils'
import { VALIDATION } from '@/lib/constants'

interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  maxLength?: number
}

export function RichEditor({
  value,
  onChange,
  placeholder,
  className,
  maxLength = VALIDATION.POST_CONTENT_MAX,
}: RichEditorProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({ placeholder: placeholder ?? '내용을 입력하세요...' }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class: cn(
          'min-h-[240px] w-full border border-t-0 border-input bg-transparent px-4 py-3 text-sm',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'prose prose-sm max-w-none dark:prose-invert',
          'prose-p:my-1 prose-headings:mt-3 prose-headings:mb-1',
          className,
        ),
      },
    },
    immediatelyRender: false,
  })

  const charCount = editor?.storage.characterCount?.characters() ?? 0
  const isOverLimit = charCount > maxLength
  const charPercent = Math.min((charCount / maxLength) * 100, 100)
  const readTimeMin = Math.max(1, Math.ceil(charCount / 500))

  const handleSetLink = useCallback(() => {
    if (!editor) return
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      setShowLinkInput(false)
      setLinkUrl('')
      return
    }
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    setShowLinkInput(false)
    setLinkUrl('')
  }, [editor, linkUrl])

  const handleLinkToggle = useCallback(() => {
    if (!editor) return
    if (editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    const previousUrl = editor.getAttributes('link').href ?? ''
    setLinkUrl(previousUrl)
    setShowLinkInput(true)
  }, [editor])

  return (
    <div className="rounded-xl border border-input overflow-hidden">
      {/* 도구 모음 */}
      {editor && (
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-muted/30 border-b border-input">
          <ToolbarButton
            label="↩"
            title="되돌리기 (Ctrl+Z)"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          />
          <ToolbarButton
            label="↪"
            title="다시 실행 (Ctrl+Shift+Z)"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          />

          <Sep />

          <ToolbarButton
            label="B"
            title="굵게 (Ctrl+B)"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            className="font-bold"
          />
          <ToolbarButton
            label="I"
            title="기울임 (Ctrl+I)"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            className="italic"
          />
          <ToolbarButton
            label="U"
            title="밑줄 (Ctrl+U)"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            className="underline"
          />
          <ToolbarButton
            label="S"
            title="취소선 (Ctrl+Shift+S)"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            className="line-through"
          />

          <Sep />

          <ToolbarButton
            label="H2"
            title="제목 2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            className="text-[10px] font-bold"
          />
          <ToolbarButton
            label="H3"
            title="제목 3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            className="text-[10px] font-semibold"
          />

          <Sep />

          <ToolbarButton
            label="•"
            title="글머리 기호"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          />
          <ToolbarButton
            label="1."
            title="번호 목록"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            className="text-[10px]"
          />
          <ToolbarButton
            label="❝"
            title="인용구"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
          />
          <ToolbarButton
            label="—"
            title="구분선"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          />

          <Sep />

          {/* 정렬 — SVG로 시각적 구분 */}
          <ToolbarButton
            title="왼쪽 정렬"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="1.5" rx=".5"/><rect x="1" y="6" width="10" height="1.5" rx=".5"/><rect x="1" y="10" width="14" height="1.5" rx=".5"/><rect x="1" y="14" width="8" height="1.5" rx=".5"/></svg>
          </ToolbarButton>
          <ToolbarButton
            title="가운데 정렬"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="1.5" rx=".5"/><rect x="3" y="6" width="10" height="1.5" rx=".5"/><rect x="1" y="10" width="14" height="1.5" rx=".5"/><rect x="4" y="14" width="8" height="1.5" rx=".5"/></svg>
          </ToolbarButton>
          <ToolbarButton
            title="오른쪽 정렬"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="1.5" rx=".5"/><rect x="5" y="6" width="10" height="1.5" rx=".5"/><rect x="1" y="10" width="14" height="1.5" rx=".5"/><rect x="7" y="14" width="8" height="1.5" rx=".5"/></svg>
          </ToolbarButton>

          <Sep />

          <ToolbarButton
            title="링크 삽입/제거"
            onClick={handleLinkToggle}
            active={editor.isActive('link')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </ToolbarButton>
        </div>
      )}

      {/* 링크 입력 바 */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b border-input">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); handleSetLink() }
              if (e.key === 'Escape') { setShowLinkInput(false); setLinkUrl('') }
            }}
            placeholder="https://example.com"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            autoFocus
          />
          <button
            type="button"
            onClick={handleSetLink}
            className="text-xs font-medium px-2.5 py-1 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            적용
          </button>
          <button
            type="button"
            onClick={() => { setShowLinkInput(false); setLinkUrl('') }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            취소
          </button>
        </div>
      )}

      {/* 에디터 */}
      <EditorContent editor={editor} />

      {/* 하단 바: 읽기 시간 + 글자 수 */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-input bg-muted/20">
        <span className="text-[11px] text-muted-foreground/50">
          {charCount > 0 ? `약 ${readTimeMin}분 읽기` : ''}
        </span>
        <div className="flex items-center">
          <span className={cn(
            'text-[11px] tabular-nums transition-colors',
            isOverLimit
              ? 'text-destructive font-medium'
              : charPercent > 80
                ? 'text-amber-500'
                : 'text-muted-foreground',
          )}>
            {charCount.toLocaleString()} / {maxLength.toLocaleString()}
          </span>
          {charPercent > 0 && (
            <div className="ml-2 w-12 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  isOverLimit ? 'bg-destructive' : charPercent > 80 ? 'bg-amber-400' : 'bg-foreground/20',
                )}
                style={{ width: `${charPercent}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Sep() {
  return <div className="w-px h-4 bg-border mx-0.5" />
}

function ToolbarButton({
  label,
  title,
  onClick,
  active,
  disabled,
  className: btnClassName,
  children,
}: {
  label?: string
  title: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
      aria-pressed={active}
      title={title}
      className={cn(
        'w-7 h-7 flex items-center justify-center rounded text-xs transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'disabled:opacity-30 disabled:cursor-not-allowed',
        active && 'bg-accent text-accent-foreground shadow-sm',
        btnClassName,
      )}
    >
      {children ?? label}
    </button>
  )
}
