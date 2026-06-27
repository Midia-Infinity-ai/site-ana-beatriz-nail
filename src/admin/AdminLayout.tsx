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
    `flex items-center gap-3 px-4 py-3 font-body-md text-body-md transition-colors ${
      isActive
        ? 'bg-status-gold/10 text-status-gold border-l-2 border-status-gold'
        : 'text-silver-gray hover:text-primary hover:bg-white/5 border-l-2 border-transparent'
    }`

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-background flex">
      <aside className="w-64 shrink-0 border-r border-outline-variant/30 bg-surface-container-low flex flex-col fixed inset-y-0">
        <div className="px-6 py-8 border-b border-outline-variant/30 text-primary flex flex-col items-center text-center">
          <Logo className="h-16 w-auto" />
          <p className="font-label-sm text-[10px] text-status-gold uppercase tracking-widest mt-4">
            Painel Administrativo
          </p>
        </div>
        <nav className="flex-1 py-4">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              <Icon name={item.icon} className="text-xl" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-outline-variant/30">
          <p className="text-silver-gray text-xs mb-3 truncate px-2">{email}</p>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-silver-gray hover:text-error transition-colors font-label-sm text-label-sm uppercase"
          >
            <Icon name="logout" className="text-lg" /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 md:p-12">
        <Outlet />
      </main>
    </div>
  )
}
