import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { TrackingScripts } from './TrackingScripts'
import { CookieConsent } from './CookieConsent'

const VISITOR_KEY = 'aba_visitor'

/** On navigation: jump to the top (anchors are handled by the Header). */
function useScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])
}

/** Anonymous, best-effort page-view tracking for the admin dashboard. */
function useVisitTracking() {
  const { pathname } = useLocation()
  useEffect(() => {
    let visitor = ''
    try {
      visitor = localStorage.getItem(VISITOR_KEY) ?? ''
      if (!visitor) {
        visitor =
          crypto.randomUUID?.() ?? `v-${Date.now()}-${Math.random().toString(36).slice(2)}`
        localStorage.setItem(VISITOR_KEY, visitor)
      }
    } catch {
      /* private mode: count as anonymous */
    }
    fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, visitor }),
      keepalive: true,
    }).catch(() => undefined)
  }, [pathname])
}

export function Layout() {
  useScrollToTop()
  useVisitTracking()

  return (
    <div className="min-h-screen bg-pearl-white text-onyx-black overflow-x-hidden">
      <TrackingScripts />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  )
}
