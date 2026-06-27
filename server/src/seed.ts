import { db } from './db.js'

/**
 * Default editable content. Seeded once (idempotent). Everything here is
 * overridable from the admin panel. Images are intentionally empty until real
 * photography is uploaded under "Capas" / "Serviços".
 */
const DEFAULT_SITE_CONTENT: Record<string, unknown> = {
  hero: {
    kicker: 'Sinta-se Poderosa',
    title: 'A Arte de se Amar através do Detalhe.',
  },
  covers: {
    hero: '',
    criadora: '',
    sensorial: '',
    beforeBefore: '',
    beforeAfter: '',
    contact: '',
  },
  tracking: {
    metaPixelId: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    googleAdsId: '',
  },
  packages: [
    {
      id: 'svc-gel',
      title: 'Alongamento em Gel',
      text: 'Estrutura, resistência e um acabamento impecável, desenhados para a forma das suas mãos.',
      badge: 'Mais procurado',
      image: '',
      active: true,
    },
    {
      id: 'svc-nailart',
      title: 'Nail Art Autoral',
      text: 'Peças únicas, pintadas à mão. Da delicadeza minimalista à obra de arte mais elaborada.',
      badge: 'Exclusivo',
      image: '',
      active: true,
    },
    {
      id: 'svc-russa',
      title: 'Manicure Russa',
      text: 'Precisão milimétrica de cutícula e uma esmaltação de longa duração com aspecto natural.',
      badge: '',
      image: '',
      active: true,
    },
  ],
}

/** Idempotent seed: fills site_content only for keys that don't exist yet. */
export function seedDatabase() {
  const setContent = db.prepare(
    'INSERT OR IGNORE INTO site_content (key, value) VALUES (?, ?)',
  )
  for (const [key, value] of Object.entries(DEFAULT_SITE_CONTENT)) {
    setContent.run(key, JSON.stringify(value))
  }
}
