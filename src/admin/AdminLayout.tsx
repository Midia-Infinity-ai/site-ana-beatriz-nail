import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { adminApi } from './api'
import { Logo } from '../components/Logo'
import { Icon } from '../components/Icon'

type NavEntry = { to: string; end?: boolean; icon: string; label: string }

// Full list (desktop sidebar + mobile "Mais" sheet).
const NAV: NavEntry[] = [
  { to: '/admin', end: true, icon: 'dashboard', label: 'Painel' },
  { to: '/admin/covers', end: true, icon: 'wallpaper', label: 'Capas' },
  { to: '/admin/packages', end: true, icon: 'spa', label: 'Serviços' },
  { to: '/admin/site-content', end: true, icon: 'tune', label: 'Conteúdo' },
  { to: '/admin/media', end: true, icon: 'image', label: 'Mídia' },
  { to: '/admin/tracking', end: true, icon: 'analytics', label: 'Rastreamento' },
]

// Primary destinations shown as bottom tabs on mobile.
const TABS = NAV.slice(0, 4)
// Secondary destinations shown in the "Mais" bottom sheet.
const MORE = NAV.slice(4)

export function AdminLayout() {
  const navigate = useNavigate()
  const [state, setState] = useState<'loading' | 'ready'>('loading')
  const [email, setEmail] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    adminApi
      .me()
      .then((user) => {
        setEmail(user.email)
        setState('ready')
      })
      .catch(() => navigate('/admin/login', { replace: true }))
  }, [navigate])

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [sheetOpen])

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center text-silver-gray">
        <Icon name="progress_activity" className="animate-spin text-3xl" />
      </div>
    )
  }

  const logout = async () => {
    await adminApi.logout().catch(() => undefined)
    navigate('/admin/login', { replace: true })
  }

  const sideLink = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-6 py-3 font-body-md text-body-md transition-colors ${
      isActive
        ? 'bg-status-gold/10 text-status-gold border-l-2 border-status-gold'
        : 'text-silver-gray hover:text-primary hover:bg-black/[0.04] border-l-2 border-transparent'
    }`

  const tabLink = ({ isActive }: { isActive: boolean }) =>
    `flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors ${
      isActive ? 'text-status-gold' : 'text-silver-gray'
    }`

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-background">
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 h-16 px-5 flex items-center justify-center bg-surface-container/95 backdrop-blur border-b border-outline-variant/40">
        <span className="text-primary">
          <Logo className="text-xl" />
        </span>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-64 border-r border-outline-variant/40 bg-surface-container flex-col">
        <div className="px-6 py-8 border-b border-outline-variant/40 text-primary flex flex-col items-center text-center">
          <Logo className="text-2xl" />
          <p className="font-label-sm text-[10px] text-status-gold uppercase tracking-[0.2em] mt-3">
            Painel Administrativo
          </p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={sideLink}>
              <Icon name={item.icon} className="text-xl" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-outline-variant/40">
          <p className="text-silver-gray text-xs mb-3 truncate px-2">{email}</p>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-silver-gray hover:text-error transition-colors font-label-sm text-label-sm uppercase"
          >
            <Icon name="logout" className="text-lg" /> Sair
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="md:ml-64 pt-16 md:pt-0 pb-28 md:pb-0 px-5 sm:px-8 md:p-12">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar (app-like) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-container/95 backdrop-blur border-t border-outline-variant/40 flex items-stretch pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className={tabLink}>
            <Icon name={tab.icon} className="text-2xl" />
            <span className="font-label-sm text-[10px] tracking-wide">{tab.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setSheetOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-silver-gray"
          aria-label="Mais opções"
        >
          <Icon name="more_horiz" className="text-2xl" />
          <span className="font-label-sm text-[10px] tracking-wide">Mais</span>
        </button>
      </nav>

      {/* "Mais" bottom sheet */}
      {sheetOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-onyx-black/40"
          onClick={() => setSheetOpen(false)}
        />
      )}
      <div
        className={`md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface-container rounded-t-3xl border-t border-outline-variant/40 shadow-[0_-12px_40px_-12px_rgba(26,26,26,0.3)] transition-transform duration-300 pb-[calc(env(safe-area-inset-bottom)+1rem)] ${
          sheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <span className="w-10 h-1 rounded-full bg-outline-variant" />
        </div>
        <div className="px-3 py-2">
          {MORE.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSheetOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-4 rounded-2xl transition-colors ${
                  isActive ? 'bg-status-gold/10 text-status-gold' : 'text-primary hover:bg-black/[0.04]'
                }`
              }
            >
              <Icon name={item.icon} className="text-2xl" />
              <span className="font-body-md text-body-md">{item.label}</span>
            </NavLink>
          ))}
          <div className="mt-2 pt-2 border-t border-outline-variant/40">
            <p className="text-silver-gray text-xs px-4 mb-1 truncate">{email}</p>
            <button
              onClick={logout}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-silver-gray hover:text-error hover:bg-black/[0.04] transition-colors"
            >
              <Icon name="logout" className="text-2xl" />
              <span className="font-body-md text-body-md">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
