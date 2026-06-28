import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { whatsappHref } from '../lib/contact'

type NavItem = { label: string; id: string }

const NAV_ITEMS: NavItem[] = [
  { label: 'Portfólio', id: 'portfolio' },
  { label: 'Serviços', id: 'servicos' },
  { label: 'Espaço Ana Beatriz', id: 'experiencia' },
  { label: 'Sobre Mim', id: 'sobre' },
]

// Vertical point (px from top) used to sample which section sits under the bar.
const SAMPLE_Y = 44

export function Header() {
  const [open, setOpen] = useState(false)
  // Header text tone: 'light' = white text (over dark sections), 'dark' = black.
  const [tone, setTone] = useState<'light' | 'dark'>('light')
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Lock body scroll while the full-screen overlay is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Pick black/white based on the section currently under the header band.
  useEffect(() => {
    let frame = 0
    const compute = () => {
      frame = 0
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('[data-nav-theme]'),
      )
      let next: 'light' | 'dark' = 'dark' // default (light pages -> black text)
      for (const el of sections) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= SAMPLE_Y && rect.bottom > SAMPLE_Y) {
          next = el.dataset.navTheme === 'dark' ? 'light' : 'dark'
          break
        }
      }
      setTone(next)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [pathname])

  const goTo = (id: string) => {
    setOpen(false)
    const scroll = () => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    if (pathname !== '/') {
      navigate('/')
      window.setTimeout(scroll, 120)
    } else {
      scroll()
    }
  }

  // When the overlay is open the header sits over onyx -> always white.
  const headerColor = open ? 'text-pearl-white' : tone === 'light' ? 'text-white' : 'text-onyx-black'

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[60] flex justify-between items-center px-safe-margin-mobile md:px-safe-margin py-6 transition-colors duration-300 ${headerColor}`}
      >
        <button
          onClick={() => goTo('topo')}
          className="font-headline-md text-2xl sm:text-headline-md tracking-tight"
          aria-label="Ana Beatriz, ir ao topo"
        >
          Ana Beatriz
        </button>
        <button
          className="font-label-caps uppercase tracking-[0.2em] text-[11px] group flex items-center gap-2"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        >
          <span className="group-hover:opacity-60 transition-opacity">
            {open ? 'Fechar' : 'Menu'}
          </span>
          <span className="w-8 h-px bg-current group-hover:w-12 transition-all duration-300" />
        </button>
      </header>

      {/* Full-screen overlay navigation */}
      <div
        className={`nav-overlay fixed inset-0 z-50 bg-onyx-black flex flex-col md:flex-row ${
          open ? 'open' : ''
        }`}
      >
        <div className="w-full md:w-1/2 h-full px-safe-margin-mobile md:px-safe-margin flex flex-col justify-center bg-deep-burgundy/10">
          <nav className="flex flex-col gap-8 md:gap-10">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => goTo(item.id)}
                className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-pearl-white hover:text-antique-gold transition-colors w-fit text-left"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-16 flex flex-col gap-6">
            <button
              onClick={() => goTo('agendar')}
              className="inline-block w-fit border border-antique-gold text-antique-gold px-8 py-4 font-label-caps uppercase tracking-[0.2em] text-[11px] hover:bg-antique-gold hover:text-onyx-black transition-all duration-500"
            >
              Agendar Momento
            </button>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body-md text-pearl-white/50 hover:text-pearl-white transition-colors w-fit text-sm tracking-wide"
            >
              WhatsApp
            </a>
          </div>
        </div>
        <div className="hidden md:block w-1/2 h-full relative overflow-hidden bg-onyx-black">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="vertical-text font-headline-lg text-[12vh] text-white/[0.04] select-none">
              ATELIER
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
