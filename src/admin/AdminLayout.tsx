import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { adminApi } from './api'
import { Logo } from '../components/Logo'
import { Icon } from '../components/Icon'

const NAV = [
  { to: '/admin', end: true, icon: 'dashboard', label: 'Painel' },
  { to: '/admin/leads', end: true, icon: 'contact_mail', label: 'Leads' },
  { to: '/admin/site-content', end: true, icon: 'tune', label: 'Conteúdo' },
  { to: '/admin/covers', end: true, icon: 'wallpaper', label: 'Capas' },
  { to: '/admin/packages', end: true, icon: 'spa', label: 'Serviços' },
  { to: '/admin/media', end: true, icon: 'image', label: 'Mídia' },
  { to: '/admin/tracking', end: true, icon: 'analytics', label: 'Rastreamento' },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const [state, setState] = useState<'loading' | 'ready'>('loading')
  const [email, setEmail] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    adminApi
      .me()
      .then((user) => {
        setEmail(user.email)
        setState('ready')
      })
      .catch(() => navigate('/admin/login', { replace: true }))
  }, [navigate])

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

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-6 py-3 font-body-md text-body-md transition-colors ${
      isActive
        ? 'bg-status-gold/10 text-status-gold border-l-2 border-status-gold'
        : 'text-silver-gray hover:text-primary hover:bg-black/[0.04] border-l-2 border-transparent'
    }`

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-background">
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 h-16 px-5 flex items-center justify-between bg-surface-container border-b border-outline-variant/40">
        <span className="text-primary">
          <Logo className="text-xl" />
        </span>
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          className="text-primary p-2 -mr-2"
        >
          <Icon name="menu" className="text-2xl" />
        </button>
      </header>

      {/* Backdrop (mobile) */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-onyx-black/40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-outline-variant/40 bg-surface-container flex flex-col transition-transform duration-300 md:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 py-8 border-b border-outline-variant/40 text-primary flex flex-col items-center text-center relative">
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
            className="md:hidden absolute top-4 right-4 text-silver-gray hover:text-primary"
          >
            <Icon name="close" className="text-xl" />
          </button>
          <Logo className="text-2xl" />
          <p className="font-label-sm text-[10px] text-status-gold uppercase tracking-[0.2em] mt-3">
            Painel Administrativo
          </p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
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

      <main className="md:ml-64 pt-16 md:pt-0 p-5 sm:p-8 md:p-12">
        <Outlet />
      </main>
    </div>
  )
}
