'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
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
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder: placeholder ?? '내용을 입력하세요...' }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class: cn(
          'min-h-[200px] w-full rounded-b-xl border border-t-0 border-input bg-transparent px-4 py-3 text-sm',
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

  return (
    <div className="rounded-xl border border-input overflow-hidden">
      {/* 툴바 */}
      {editor && (
        <div className="flex items-center gap-0.5 px-2 py-1.5 bg-muted/30 border-b border-input">
          {/* 되돌리기 / 다시 실행 */}
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

          <div className="w-px h-4 bg-border mx-1" />

          {/* 텍스트 서식 */}
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
            label="S"
            title="취소선 (Ctrl+Shift+S)"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            className="line-through"
          />

          <div className="w-px h-4 bg-border mx-1" />

          {/* 구조 */}
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
        </div>
      )}

      {/* 에디터 */}
      <EditorContent editor={editor} />

      {/* 글자 수 카운터 */}
      <div className="flex justify-end px-3 py-1.5 border-t border-input bg-muted/20">
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
          <div className="ml-2 w-12 h-1.5 rounded-full bg-muted overflow-hidden self-center">
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
  )
}

function ToolbarButton({
  label,
  title,
  onClick,
  active,
  disabled,
  className: btnClassName,
}: {
  label: string
  title: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
  className?: string
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
      {label}
    </button>
  )
}
