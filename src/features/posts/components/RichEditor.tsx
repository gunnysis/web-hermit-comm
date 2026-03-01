'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { cn } from '@/lib/utils'

interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

export function RichEditor({ value, onChange, placeholder, className }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: cn(
          'min-h-[160px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'prose prose-sm max-w-none dark:prose-invert',
          className,
        ),
      },
    },
    immediatelyRender: false,
  })

  return (
    <div>
      {/* 툴바 */}
      {editor && (
        <div className="flex gap-1 mb-1 flex-wrap">
          {[
            { label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
            { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
            { label: 'S', action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
            { label: '—', action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
          ].map(({ label, action, active }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              className={cn(
                'px-2 py-0.5 text-xs border rounded hover:bg-accent',
                active && 'bg-accent font-bold',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  )
}
