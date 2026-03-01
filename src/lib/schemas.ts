import { z } from 'zod'

export const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자 이내로 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
  is_anonymous: z.boolean(),
  display_name: z.string().max(20).optional(),
  image_url: z.string().optional(),
})

export const commentSchema = z.object({
  content: z.string().min(1, '댓글을 입력해주세요').max(500, '500자 이내로 입력해주세요'),
  is_anonymous: z.boolean(),
  display_name: z.string().max(20).optional(),
})

export type PostFormValues = z.infer<typeof postSchema>
export type CommentFormValues = z.infer<typeof commentSchema>
