import { z } from 'zod'
import { VALIDATION } from './constants'

export const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(VALIDATION.POST_TITLE_MAX, `제목은 ${VALIDATION.POST_TITLE_MAX}자 이내로 입력해주세요`),
  content: z.string().min(1, '내용을 입력해주세요').max(VALIDATION.POST_CONTENT_MAX, `내용은 ${VALIDATION.POST_CONTENT_MAX}자 이내로 입력해주세요`),
  is_anonymous: z.boolean(),
  display_name: z.string().max(VALIDATION.AUTHOR_MAX).optional(),
  image_url: z.string().optional(),
})

export const commentSchema = z.object({
  content: z.string().min(1, '댓글을 입력해주세요').max(VALIDATION.COMMENT_MAX, `${VALIDATION.COMMENT_MAX}자 이내로 입력해주세요`),
  is_anonymous: z.boolean(),
  display_name: z.string().max(VALIDATION.AUTHOR_MAX).optional(),
})

export type PostFormValues = z.infer<typeof postSchema>
export type CommentFormValues = z.infer<typeof commentSchema>
