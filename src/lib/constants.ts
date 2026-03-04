export const DEFAULT_PUBLIC_BOARD_ID = 1
export const PAGE_SIZE = 20

/** 입력 유효성 검사 상수 */
export const VALIDATION = {
  POST_TITLE_MAX: 100,
  POST_CONTENT_MAX: 5000,
  COMMENT_MAX: 1000,
  AUTHOR_MAX: 50,
} as const

export const ADJECTIVES = [
  '조용한', '평화로운', '수줍은', '느긋한', '차분한',
  '따뜻한', '신중한', '소박한', '고요한', '온화한',
]
export const ANIMALS = [
  '고양이', '토끼', '곰', '여우', '부엉이',
  '거북이', '다람쥐', '고슴도치', '수달', '판다',
]

// 감정·디자인 토큰 상수는 중앙 프로젝트에서 생성됨 (constants.generated.ts)
export { ALLOWED_EMOTIONS, EMOTION_EMOJI, REACTION_COLOR_MAP, SHARED_PALETTE } from './constants.generated'
export type { AllowedEmotion, ReactionColorKey } from './constants.generated'
