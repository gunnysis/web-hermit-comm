import { ADJECTIVES, ANIMALS } from './constants'

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function generateAlias(seed: string): string {
  const hash = hashString(seed)
  const adj = ADJECTIVES[hash % ADJECTIVES.length]
  const animal = ANIMALS[Math.floor(hash / ADJECTIVES.length) % ANIMALS.length]
  const num = (hash % 99) + 1
  return `${adj} ${animal} ${num}`
}

export function resolveDisplayName(
  userId: string,
  contextId: string | number,
  isAnonymous: boolean,
  realName?: string,
): string {
  if (!isAnonymous && realName) return realName
  return generateAlias(`${userId}-${contextId}`)
}
