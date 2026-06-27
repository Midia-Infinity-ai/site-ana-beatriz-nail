import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  getSiteContent,
  type CoversConfig,
  type TrackingConfig,
  type ServicePackage,
  type HeroContent,
} from './siteContent'
import { fetchSiteContent } from './api'

type ContentValue = {
  hero: HeroContent
  covers: CoversConfig
  tracking: TrackingConfig
  packages: ServicePackage[]
}

const ContentContext = createContext<ContentValue | null>(null)

/**
 * Serves editable site content to the public page.
 *
 * Initializes from the bundled defaults (instant first paint, works even if
 * the API is unreachable), then overrides with live data from the admin API.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const defaults = getSiteContent()
  const [hero, setHero] = useState<HeroContent>(() => defaults.hero)
  const [covers, setCovers] = useState<CoversConfig>(() => defaults.covers)
  const [tracking, setTracking] = useState<TrackingConfig>(() => defaults.tracking)
  const [packages, setPackages] = useState<ServicePackage[]>(() => defaults.packages)

  useEffect(() => {
    const controller = new AbortController()
    fetchSiteContent(controller.signal).then((live) => {
      if (!live) return
      if (live.hero) setHero((prev) => ({ ...prev, ...live.hero }))
      if (live.covers) setCovers((prev) => ({ ...prev, ...live.covers }))
      if (live.tracking) setTracking((prev) => ({ ...prev, ...live.tracking }))
      if (live.packages) setPackages(live.packages)
    })
    return () => controller.abort()
  }, [])

  return (
    <ContentContext.Provider value={{ hero, covers, tracking, packages }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent(): ContentValue {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used within ContentProvider')
  return ctx
}
