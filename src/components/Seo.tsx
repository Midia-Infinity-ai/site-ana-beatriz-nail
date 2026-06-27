import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://www.anabeatriznail.com.br'

type SeoProps = {
  title: string
  description: string
  image?: string
}

/** Per-route document head: title, description, canonical and Open Graph (PT-BR). */
export function Seo({ title, description, image = '/img/hero.webp' }: SeoProps) {
  const { pathname } = useLocation()
  const url = SITE_URL + (pathname === '/' ? '' : pathname)
  const ogImage = image.startsWith('http') ? image : SITE_URL + image

  return (
    <Helmet>
      <html lang="pt-BR" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="pt_BR" />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  )
}
