import { useEffect } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Cal.com inline embed (scheduling). Loads the Cal embed loader once and mounts
 * the "atendimento" event type into #my-cal-inline-atendimento. Guarded so React
 * StrictMode's double-effect in dev does not initialise it twice.
 */
let calInitialised = false

export function CalEmbed() {
  useEffect(() => {
    if (calInitialised) return
    calInitialised = true

    // Official Cal loader snippet (typed loosely).
    ;(function (C: any, A: string, L: string) {
      const p = function (a: any, ar: any) {
        a.q.push(ar)
      }
      const d = C.document
      C.Cal =
        C.Cal ||
        function () {
          // eslint-disable-next-line prefer-rest-params
          const cal = C.Cal
          // eslint-disable-next-line prefer-rest-params
          const ar = arguments as any
          if (!cal.loaded) {
            cal.ns = {}
            cal.q = cal.q || []
            d.head.appendChild(d.createElement('script')).src = A
            cal.loaded = true
          }
          if (ar[0] === L) {
            const api = function () {
              // eslint-disable-next-line prefer-rest-params
              p(api, arguments)
            }
            const namespace = ar[1]
            ;(api as any).q = (api as any).q || []
            if (typeof namespace === 'string') {
              cal.ns[namespace] = cal.ns[namespace] || api
              p(cal.ns[namespace], ar)
              p(cal, ['initNamespace', namespace])
            } else p(cal, ar)
            return
          }
          p(cal, ar)
        }
    })(window, 'https://app.cal.com/embed/embed.js', 'init')

    const Cal = (window as any).Cal
    Cal('init', 'atendimento', { origin: 'https://app.cal.com' })
    Cal.config = Cal.config || {}
    Cal.config.forwardQueryParams = true

    Cal.ns.atendimento('inline', {
      elementOrSelector: '#my-cal-inline-atendimento',
      config: { layout: 'month_view', useSlotsViewOnSmallScreen: 'true', theme: 'light' },
      calLink: 'ana.beatriz/atendimento',
    })

    Cal.ns.atendimento('ui', {
      cssVarsPerTheme: {
        light: { 'cal-brand': '#4A0404' },
        dark: { 'cal-brand': '#4A0404' },
      },
      hideEventTypeDetails: false,
      layout: 'month_view',
    })
  }, [])

  return (
    <div
      id="my-cal-inline-atendimento"
      style={{ width: '100%', height: '100%', minHeight: '620px', overflow: 'auto' }}
    />
  )
}
