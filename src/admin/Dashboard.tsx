import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, type VisitStats } from './api'
import { Icon } from '../components/Icon'

const PERIODS = [
  { label: 'Hoje', days: 1 },
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
  { label: 'Tudo', days: 0 },
]

const PATH_LABELS: Record<string, string> = {
  '/': 'Início',
  '/politica-de-privacidade': 'Privacidade',
}

function VisitorAnalytics() {
  const [days, setDays] = useState(7)
  const [stats, setStats] = useState<VisitStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    adminApi
      .visitStats(days)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [days])

  const maxVisits = Math.max(1, ...(stats?.series.map((s) => s.visits) ?? [1]))
  const maxPath = Math.max(1, ...(stats?.topPaths.map((p) => p.visits) ?? [1]))

  const fmtDay = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

  return (
    <div className="bg-surface-container border border-outline-variant/30 p-6 mb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 className="font-headline-md text-xl text-primary flex items-center gap-2">
          <Icon name="monitoring" className="text-status-gold" /> Visitantes
        </h2>
        <div className="flex flex-wrap gap-1 bg-surface-container-low p-1 border border-outline-variant/20">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`px-3 py-1.5 text-xs font-label-sm uppercase tracking-wider transition-colors ${
                days === p.days
                  ? 'bg-status-gold text-pure-black'
                  : 'text-silver-gray hover:text-primary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-silver-gray py-12 text-center">Carregando...</p>
      ) : !stats ? (
        <p className="text-silver-gray py-12 text-center">Sem dados disponíveis.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div>
              <div className="text-4xl font-bold text-primary mb-1">{stats.totalVisits}</div>
              <div className="text-silver-gray font-label-sm text-label-sm uppercase">
                Visitas (page views)
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-status-gold mb-1">{stats.uniqueVisitors}</div>
              <div className="text-silver-gray font-label-sm text-label-sm uppercase">
                Visitantes únicos
              </div>
            </div>
          </div>

          {stats.series.length > 0 && (
            <div className="mb-10">
              <p className="text-silver-gray/60 text-xs font-label-sm uppercase mb-4">Por dia</p>
              <div className="flex items-end gap-1 h-40">
                {stats.series.map((s) => (
                  <div key={s.day} className="flex-1 flex flex-col items-center gap-2 group min-w-0">
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full bg-status-gold/30 group-hover:bg-status-gold transition-colors relative"
                        style={{ height: `${(s.visits / maxVisits) * 100}%` }}
                        title={`${s.day}: ${s.visits} visitas, ${s.visitors} únicos`}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          {s.visits}
                        </span>
                      </div>
                    </div>
                    {stats.series.length <= 31 && (
                      <span className="text-[9px] text-silver-gray/50 whitespace-nowrap">
                        {fmtDay(s.day)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.topPaths.length > 0 && (
            <div>
              <p className="text-silver-gray/60 text-xs font-label-sm uppercase mb-4">
                Páginas mais visitadas
              </p>
              <div className="space-y-2">
                {stats.topPaths.map((p) => (
                  <div key={p.path} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 truncate text-sm text-primary" title={p.path}>
                      {PATH_LABELS[p.path] ?? p.path}
                    </span>
                    <div className="flex-1 bg-surface-container-low h-5 overflow-hidden">
                      <div
                        className="h-full bg-status-gold/40"
                        style={{ width: `${(p.visits / maxPath) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm text-silver-gray">{p.visits}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function AdminDashboard() {
  return (
    <div>
      <h1 className="font-headline-md text-headline-md text-primary mb-2">Painel</h1>
      <p className="text-silver-gray font-body-md mb-10">
        Acompanhe o tráfego do site e gerencie os textos e as imagens. Os agendamentos ficam a
        cargo do Cal.com, na seção de contato do site.
      </p>

      <VisitorAnalytics />

      <div className="flex flex-wrap gap-4">
        <Link
          to="/admin/site-content"
          className="bg-primary text-on-primary px-6 py-3 font-label-sm text-label-sm uppercase tracking-widest hover:bg-status-gold transition-colors inline-flex items-center gap-2"
        >
          <Icon name="tune" className="text-lg" /> Editar Conteúdo
        </Link>
        <Link
          to="/admin/covers"
          className="border border-outline-variant px-6 py-3 font-label-sm text-label-sm uppercase tracking-widest text-primary hover:border-status-gold transition-colors inline-flex items-center gap-2"
        >
          <Icon name="wallpaper" className="text-lg" /> Trocar Capas
        </Link>
        <Link
          to="/admin/packages"
          className="border border-outline-variant px-6 py-3 font-label-sm text-label-sm uppercase tracking-widest text-primary hover:border-status-gold transition-colors inline-flex items-center gap-2"
        >
          <Icon name="spa" className="text-lg" /> Serviços
        </Link>
      </div>
    </div>
  )
}
