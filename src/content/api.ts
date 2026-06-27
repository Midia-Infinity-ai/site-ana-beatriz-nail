import type { SiteContent } from './siteContent'

export async function fetchSiteContent(
  signal?: AbortSignal,
): Promise<Partial<SiteContent> | null> {
  try {
    const res = await fetch('/api/site-content', { signal })
    if (!res.ok) return null
    const data = (await res.json()) as Partial<SiteContent>
    const result: Partial<SiteContent> = {}
    if (data.hero) result.hero = data.hero
    if (data.covers) result.covers = data.covers
    if (data.tracking) result.tracking = data.tracking
    if (Array.isArray(data.packages)) result.packages = data.packages
    return Object.keys(result).length ? result : null
  } catch {
    return null
  }
}
