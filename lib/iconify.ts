const CACHE_PREFIX = "iconify_cache_"
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

interface CacheEntry {
  data: any
  timestamp: number
}

function getCacheKey(prefix: string, iconName?: string): string {
  if (iconName) {
    return `${CACHE_PREFIX}${prefix}_${iconName}`
  }
  return `${CACHE_PREFIX}list_${prefix}`
}

function getCached<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null

    const entry: CacheEntry = JSON.parse(cached)
    const now = Date.now()

    if (now - entry.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key)
      return null
    }

    return entry.data as T
  } catch {
    return null
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // Ignore cache errors
  }
}

export function normalizeIconName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-")
}

export function joinIconId(prefix: string, name: string): string {
  return `${prefix}:${name}`
}

export function parseIconId(id: string): { prefix: string; name: string } {
  const [prefix, ...rest] = id.split(":")
  return { prefix, name: rest.join(":") }
}

export async function fetchIconList(prefix: string): Promise<string[]> {
  const cacheKey = getCacheKey(prefix)
  const cached = getCached<string[]>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(`https://api.iconify.design/collection?prefix=${prefix}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch icon list: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data || !data.uncategorized) {
      return []
    }

    const icons = data.uncategorized as string[]
    setCache(cacheKey, icons)
    return icons
  } catch (error) {
    console.error(`Error fetching icon list for ${prefix}:`, error)
    throw error
  }
}

export async function getIconSVG(prefix: string, iconName: string): Promise<string> {
  const cacheKey = getCacheKey(prefix, iconName)
  const cached = getCached<string>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const normalizedName = normalizeIconName(iconName)
    const response = await fetch(`https://api.iconify.design/${prefix}/${normalizedName}.svg`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch icon SVG: ${response.statusText}`)
    }

    const svg = await response.text()
    setCache(cacheKey, svg)
    return svg
  } catch (error) {
    console.error(`Error fetching icon SVG for ${prefix}:${iconName}:`, error)
    throw error
  }
}

