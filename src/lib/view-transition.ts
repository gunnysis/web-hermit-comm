/**
 * View Transitions API 유틸리티
 * 페이지 전환 시 부드러운 애니메이션을 위한 래퍼.
 * 브라우저 미지원 시 폴백으로 즉시 실행.
 */

type TransitionDirection = 'forward' | 'back'

function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document
}

/**
 * View Transition으로 콜백을 감싸 실행.
 * 미지원 브라우저에서는 콜백만 즉시 실행.
 */
export function startViewTransition(
  callback: () => void | Promise<void>,
  direction: TransitionDirection = 'forward',
) {
  if (!supportsViewTransitions()) {
    callback()
    return
  }

  if (direction === 'back') {
    document.documentElement.classList.add('vt-back')
  }

  const transition = document.startViewTransition(callback)
  transition.finished.then(() => {
    document.documentElement.classList.remove('vt-back')
  })
}
