import { describe, it, expect } from 'vitest'
import { isPost, isComment, REACTION_TYPES } from '../database'

const validPost = {
  id: 1,
  title: '테스트',
  content: '내용',
  author: '작성자',
  author_id: 'uuid-123',
  created_at: '2024-01-01T00:00:00Z',
  is_anonymous: true,
  display_name: '익명 고양이',
}

const validComment = {
  id: 1,
  post_id: 1,
  content: '댓글',
  author: '작성자',
  author_id: 'uuid-123',
  created_at: '2024-01-01T00:00:00Z',
  is_anonymous: true,
  display_name: '익명 고양이',
}

describe('isPost', () => {
  it('returns true for valid post', () => {
    expect(isPost(validPost)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isPost(null)).toBe(false)
  })

  it('returns false for missing fields', () => {
    expect(isPost({ id: 1, title: '테스트' })).toBe(false)
  })

  it('returns false for wrong types', () => {
    expect(isPost({ ...validPost, id: '1' })).toBe(false)
  })
})

describe('isComment', () => {
  it('returns true for valid comment', () => {
    expect(isComment(validComment)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isComment(null)).toBe(false)
  })

  it('returns false for missing post_id', () => {
    expect(isComment({ ...validComment, post_id: undefined })).toBe(false)
  })
})

describe('REACTION_TYPES', () => {
  it('contains expected emoji types', () => {
    expect(REACTION_TYPES).toContain('👍')
    expect(REACTION_TYPES).toContain('❤️')
  })

  it('is non-empty', () => {
    expect(REACTION_TYPES.length).toBeGreaterThan(0)
  })
})
