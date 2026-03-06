const STORAGE_KEY = 'search_recent'
const MAX_ITEMS = 8

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : []
  } catch {
    return []
  }
}

export function addRecentSearch(query: string): void {
  if (!query.trim()) return
  const recent = getRecentSearches().filter((q) => q !== query)
  recent.unshift(query.trim())
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_ITEMS)))
}

export function removeRecentSearch(query: string): string[] {
  const recent = getRecentSearches().filter((q) => q !== query)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent))
  return recent
}

export function clearAllRecentSearches(): void {
  localStorage.removeItem(STORAGE_KEY)
}
