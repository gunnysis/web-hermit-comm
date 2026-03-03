import { describe, it, expect } from 'vitest'
import { postSchema, commentSchema } from '../schemas'
import { VALIDATION } from '../constants'

describe('postSchema', () => {
  it('accepts valid post data', () => {
    const result = postSchema.safeParse({
      title: '테스트 제목',
      content: '테스트 내용',
      is_anonymous: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = postSchema.safeParse({
      title: '',
      content: '내용',
      is_anonymous: true,
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty content', () => {
    const result = postSchema.safeParse({
      title: '제목',
      content: '',
      is_anonymous: true,
    })
    expect(result.success).toBe(false)
  })

  it('rejects title exceeding max length', () => {
    const result = postSchema.safeParse({
      title: 'a'.repeat(VALIDATION.POST_TITLE_MAX + 1),
      content: '내용',
      is_anonymous: true,
    })
    expect(result.success).toBe(false)
  })

  it('rejects content exceeding max length', () => {
    const result = postSchema.safeParse({
      title: '제목',
      content: 'a'.repeat(VALIDATION.POST_CONTENT_MAX + 1),
      is_anonymous: true,
    })
    expect(result.success).toBe(false)
  })
})

describe('commentSchema', () => {
  it('accepts valid comment data', () => {
    const result = commentSchema.safeParse({
      content: '댓글 내용',
      is_anonymous: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty content', () => {
    const result = commentSchema.safeParse({
      content: '',
      is_anonymous: true,
    })
    expect(result.success).toBe(false)
  })

  it('rejects content exceeding max length', () => {
    const result = commentSchema.safeParse({
      content: 'a'.repeat(VALIDATION.COMMENT_MAX + 1),
      is_anonymous: true,
    })
    expect(result.success).toBe(false)
  })
})
