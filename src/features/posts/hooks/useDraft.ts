'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const DRAFT_PREFIX = 'draft_post_'
const DEBOUNCE_MS = 1000

export type DraftStatus = 'idle' | 'saving' | 'saved'

interface DraftData {
  title: string
  content: string
  updatedAt: number
}

export function useDraft(boardId: number) {
  const [status, setStatus] = useState<DraftStatus>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statusResetRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const key = `${DRAFT_PREFIX}${boardId}`

  const loadDraft = useCallback((): DraftData | null => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      return JSON.parse(raw) as DraftData
    } catch {
      return null
    }
  }, [key])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key)
    setStatus('idle')
  }, [key])

  const saveDraft = useCallback(
    (data: { title: string; content: string }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (statusResetRef.current) clearTimeout(statusResetRef.current)
      setStatus('saving')
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null
        const hasContent = data.title.trim() || data.content.trim()
        if (hasContent) {
          localStorage.setItem(key, JSON.stringify({ ...data, updatedAt: Date.now() }))
          setStatus('saved')
          statusResetRef.current = setTimeout(() => setStatus('idle'), 3000)
        } else {
          localStorage.removeItem(key)
          setStatus('idle')
        }
      }, DEBOUNCE_MS)
    },
    [key],
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (statusResetRef.current) clearTimeout(statusResetRef.current)
    }
  }, [])

  return { saveDraft, loadDraft, clearDraft, status }
}
