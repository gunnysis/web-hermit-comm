// 비즈니스 타입은 중앙 프로젝트에서 생성됨 (database.types.ts)
// 이 파일은 하위 호환성을 위한 re-export 래퍼
export * from './database.types'

// 웹 전용: DEFAULT_PUBLIC_BOARD_ID는 lib/constants.ts에서 관리
export { DEFAULT_PUBLIC_BOARD_ID } from '@/lib/constants'
