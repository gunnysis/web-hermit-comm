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

export const ALLOWED_EMOTIONS = [
  '기쁨', '슬픔', '분노', '공포', '놀람',
  '혐오', '중립', '희망', '감사', '외로움',
  '불안', '그리움', '설렘',
] as const

export const EMOTION_EMOJI: Record<string, string> = {
  기쁨: '😊', 슬픔: '😢', 분노: '😠', 공포: '😨', 놀람: '😲',
  혐오: '🤢', 중립: '😐', 희망: '🌟', 감사: '🙏', 외로움: '😔',
  불안: '😰', 그리움: '💭', 설렘: '💫',
}
