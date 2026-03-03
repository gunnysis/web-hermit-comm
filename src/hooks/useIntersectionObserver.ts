'use client'

import { useEffect, useRef } from 'react'

interface Options {
  threshold?: number
  rootMargin?: string
  enabled?: boolean
}

export function useIntersectionObserver(
  onIntersect: () => void,
  { threshold = 0.1, rootMargin = '0px', enabled = true }: Options = {},
) {
  const targetRef = useRef<HTMLDivElement>(null)
  const callbackRef = useRef(onIntersect)

  useEffect(() => {
    callbackRef.current = onIntersect
  })

  useEffect(() => {
    if (!enabled || !targetRef.current) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) callbackRef.current()
      },
      { threshold, rootMargin },
    )
    observer.observe(targetRef.current)

    return () => observer.disconnect()
  }, [enabled, threshold, rootMargin])

  return targetRef
}
