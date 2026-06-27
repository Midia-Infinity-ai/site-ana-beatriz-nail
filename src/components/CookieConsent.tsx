import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const KEY = 'aba_consent'
const EVENT = 'aba-consent'
type Consent = 'granted' | 'denied' | null

function read(): Consent {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

function write(value: Exclude<Consent, null>) {
  try {
    localStorage.setItem(KEY, value)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT))
}

/** Non-reactive read for one-off checks. */
export function hasConsent(): boolean {
  return read() === 'granted'
}

/** Reactive consent state, updates when the choice changes. */
export function useConsent(): Consent {
  const [consent, setConsent] = useState<Consent>(() => read())
  useEffect(() => {
    const update = () => setConsent(read())
    window.addEventListener(EVENT, update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener(EVENT, update)
      window.removeEventListener('storage', update)
    }
  }, [])
  return consent
}

/** LGPD cookie/tracking consent banner, shown until the visitor decides. */
export function CookieConsent() {
  const consent = useConsent()
  if (consent !== null) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[70] p-4 md:p-6">
      <div className="max-w-5xl mx-auto bg-onyx-black text-pearl-white border border-antique-gold/40 p-6 md:p-7 flex flex-col lg:flex-row lg:items-center gap-5">
        <p className="font-body-md text-sm flex-1 text-pearl-white/80">
          Usamos cookies para entender como você navega e, com a sua autorização, para
          mensurar campanhas. Saiba mais na{' '}
          <Link
            to="/politica-de-privacidade"
            className="text-antique-gold underline underline-offset-2 hover:text-pearl-white transition-colors"
          >
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => write('denied')}
            className="border border-pearl-white/40 text-pearl-white px-6 py-3 font-label-caps text-[11px] uppercase tracking-[0.2em] hover:border-pearl-white transition-colors"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => write('granted')}
            className="bg-antique-gold text-onyx-black px-6 py-3 font-label-caps text-[11px] uppercase tracking-[0.2em] hover:bg-pearl-white transition-colors"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
