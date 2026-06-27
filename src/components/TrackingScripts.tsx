import { Helmet } from 'react-helmet-async'
import { useContent } from '../content/ContentProvider'
import { useConsent } from './CookieConsent'

// Allow only the characters real pixel/measurement IDs use, so a stray or
// malicious value can never break out of the inline script string.
const safeId = (id: string) => (/^[A-Za-z0-9-]{1,40}$/.test(id) ? id : '')

export function TrackingScripts() {
  const { tracking } = useContent()
  const consent = useConsent()
  const metaPixelId = safeId(tracking.metaPixelId)
  const googleAnalyticsId = safeId(tracking.googleAnalyticsId)
  const googleTagManagerId = safeId(tracking.googleTagManagerId)
  const googleAdsId = safeId(tracking.googleAdsId)

  // LGPD: only load third-party marketing/analytics pixels after consent.
  if (consent !== 'granted') return null
  if (!metaPixelId && !googleAnalyticsId && !googleTagManagerId && !googleAdsId) return null

  // Primary gtag ID: prefer GA4, fall back to Google Ads
  const gtagPrimary = googleAnalyticsId || googleAdsId

  return (
    <Helmet>
      {/* Google Tag Manager */}
      {googleTagManagerId ? (
        <script>{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${googleTagManagerId}');`}</script>
      ) : null}

      {/* Google Analytics 4 / Google Ads — load gtag.js once */}
      {gtagPrimary ? (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gtagPrimary}`} />
      ) : null}
      {gtagPrimary ? (
        <script>{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${googleAnalyticsId ? `gtag('config','${googleAnalyticsId}');` : ''}${googleAdsId ? `gtag('config','${googleAdsId}');` : ''}`}</script>
      ) : null}

      {/* Meta Pixel */}
      {metaPixelId ? (
        <script>{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}</script>
      ) : null}
    </Helmet>
  )
}
