import { describe, it, expect } from 'vitest'
import { PAGE_SIZE, ALLOWED_EMOTIONS, VALIDATION, EMOTION_EMOJI } from '../constants'

describe('constants', () => {
  it('PAGE_SIZE is a positive integer', () => {
    expect(PAGE_SIZE).toBeGreaterThan(0)
    expect(Number.isInteger(PAGE_SIZE)).toBe(true)
  })

  it('ALLOWED_EMOTIONS is non-empty', () => {
    expect(ALLOWED_EMOTIONS.length).toBeGreaterThan(0)
  })

  it('every emotion has a matching emoji', () => {
    for (const emotion of ALLOWED_EMOTIONS) {
      expect(EMOTION_EMOJI[emotion]).toBeDefined()
    }
  })

  it('VALIDATION limits are positive numbers', () => {
    expect(VALIDATION.POST_TITLE_MAX).toBeGreaterThan(0)
    expect(VALIDATION.POST_CONTENT_MAX).toBeGreaterThan(0)
    expect(VALIDATION.COMMENT_MAX).toBeGreaterThan(0)
    expect(VALIDATION.AUTHOR_MAX).toBeGreaterThan(0)
  })

  it('content max is greater than title max', () => {
    expect(VALIDATION.POST_CONTENT_MAX).toBeGreaterThan(VALIDATION.POST_TITLE_MAX)
  })
})
