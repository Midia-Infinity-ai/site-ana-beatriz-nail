/** Background / feature images per section (managed via the admin "Capas"). */
export type CoversConfig = {
  hero: string
  criadora: string
  sensorial: string
  beforeBefore: string
  beforeAfter: string
}

export type TrackingConfig = {
  metaPixelId: string
  googleAnalyticsId: string
  googleTagManagerId: string
  googleAdsId: string
}

/** A service / experience shown on the site (managed via admin "Serviços"). */
export type ServicePackage = {
  id: string
  title: string
  text: string
  badge?: string
  image: string
  active: boolean
}

/** Editable hero copy (managed via admin "Conteúdo"). */
export type HeroContent = {
  kicker: string
  title: string
}

export type SiteContent = {
  hero: HeroContent
  covers: CoversConfig
  tracking: TrackingConfig
  packages: ServicePackage[]
}

const SITE_CONTENT: SiteContent = {
  hero: {
    kicker: 'Sinta-se Poderosa',
    title: 'A Arte de se Amar através do Detalhe.',
  },
  // Empty by default: each section falls back to a tasteful neutral
  // placeholder until real photography is uploaded in the admin panel.
  covers: {
    hero: '',
    criadora: '',
    sensorial: '',
    beforeBefore: '',
    beforeAfter: '',
  },
  tracking: {
    metaPixelId: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    googleAdsId: '',
  },
  packages: [],
}

export function getSiteContent(): SiteContent {
  return SITE_CONTENT
}
