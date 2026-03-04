const POSITIVE = new Set(['설렘', '기대감', '안도감', '평온함', '즐거움'])
const NEGATIVE = new Set(['고립감', '무기력', '불안', '외로움', '슬픔', '두려움', '답답함'])

export function getEmotionClassName(emotion: string): string {
  if (POSITIVE.has(emotion)) return 'emotion-positive'
  if (NEGATIVE.has(emotion)) return 'emotion-negative'
  return 'emotion-neutral'
}
