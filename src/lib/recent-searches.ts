import { SEARCH_CONFIG } from '@/lib/constants'

const STORAGE_KEY = 'search_recent'

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, SEARCH_CONFIG.RECENT_MAX) : []
  } catch {
    return []
  }
}

export function addRecentSearch(query: string): string[] {
  if (!query.trim()) return getRecentSearches()
  const recent = getRecentSearches().filter((q) => q !== query)
  recent.unshift(query.trim())
  const updated = recent.slice(0, SEARCH_CONFIG.RECENT_MAX)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function removeRecentSearch(query: string): string[] {
  const recent = getRecentSearches().filter((q) => q !== query)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent))
  return recent
}

export function clearAllRecentSearches(): void {
  localStorage.removeItem(STORAGE_KEY)
}
