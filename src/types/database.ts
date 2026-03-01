export type AnonMode = 'always_anon' | 'allow_choice' | 'require_name'
export type JoinMode = 'invite_only' | 'request_approve' | 'code_join'
export type MemberRole = 'owner' | 'member' | 'moderator'
export type MemberStatus = 'pending' | 'approved' | 'rejected' | 'left'

export interface Group {
  id: number
  name: string
  description: string | null
  owner_id: string
  join_mode: JoinMode
  invite_code: string | null
  created_at: string
  updated_at: string
}

export interface Board {
  id: number
  name: string
  description: string | null
  visibility: string
  anon_mode: AnonMode
  group_id: number | null
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: number
  group_id: number
  user_id: string
  role: MemberRole
  status: MemberStatus
  nickname: string | null
  joined_at: string
  left_at: string | null
}

export interface Post {
  id: number
  title: string
  content: string
  author: string
  author_id: string
  board_id: number | null
  group_id: number | null
  member_id: number | null
  is_anonymous: boolean
  display_name: string
  image_url: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PostWithCounts extends Post {
  like_count: number
  comment_count: number
  emotions: string[] | null
}

export interface Comment {
  id: number
  post_id: number
  content: string
  author: string
  author_id: string
  board_id: number | null
  group_id: number | null
  is_anonymous: boolean
  display_name: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Reaction {
  id: number
  post_id: number
  reaction_type: string
  count: number
}

export interface UserReaction {
  id: number
  user_id: string
  post_id: number
  reaction_type: string
  created_at: string
}

export interface PostAnalysis {
  id: number
  post_id: number
  emotions: string[]
  analyzed_at: string
}

export interface AppAdmin {
  user_id: string
  created_at: string
}

export interface EmotionTrend {
  emotion: string
  cnt: number
}

export interface RecommendedPost {
  id: number
  title: string
  board_id: number | null
  like_count: number
  comment_count: number
  emotions: string[]
  created_at: string
}

export interface CreatePostRequest {
  title: string
  content: string
  author: string
  board_id?: number
  group_id?: number
  is_anonymous?: boolean
  display_name?: string
  image_url?: string
}

export interface CreateCommentRequest {
  content: string
  author: string
  board_id?: number
  group_id?: number
  is_anonymous?: boolean
  display_name?: string
}

export const REACTION_TYPES = ['👍', '❤️', '😂', '😢', '😮'] as const
export type ReactionType = (typeof REACTION_TYPES)[number]

export const DEFAULT_PUBLIC_BOARD_ID = 1
