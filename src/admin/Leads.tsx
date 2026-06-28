import { useEffect, useState } from 'react'
import { adminApi, type Lead } from './api'
import { Icon } from '../components/Icon'

export function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    adminApi
      .listLeads()
      .then(setLeads)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const remove = async (lead: Lead) => {
    if (!window.confirm(`Excluir o lead de "${lead.name || lead.email}"?`)) return
    setRemoving(lead.id)
    try {
      await adminApi.deleteLead(lead.id)
      setLeads((prev) => prev.filter((l) => l.id !== lead.id))
    } finally {
      setRemoving(null)
    }
  }

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary">Leads</h1>
          <p className="text-silver-gray font-body-md mt-1">
            {leads.length} solicitação{leads.length !== 1 ? 'ões' : ''} recebida{leads.length !== 1 ? 's' : ''}
          </p>
        </div>
        {leads.length > 0 && (
          <a
            href={adminApi.exportLeads()}
            download
            className="btn-shine bg-primary text-on-primary px-5 py-3 font-label-sm text-label-sm uppercase tracking-widest hover:bg-status-gold transition-colors inline-flex items-center gap-2"
          >
            <Icon name="download" className="text-lg" /> Exportar CSV
          </a>
        )}
      </div>

      {loading ? (
        <p className="text-silver-gray">Carregando...</p>
      ) : leads.length === 0 ? (
        <div className="border border-outline-variant/30 p-16 text-center">
          <Icon name="inbox" className="text-silver-gray/40 text-5xl mb-4" />
          <p className="text-silver-gray">Nenhuma solicitação recebida ainda.</p>
          <p className="text-silver-gray/60 text-sm mt-2">
            Os dados do formulário de orçamento do site aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="border border-outline-variant/30 divide-y divide-outline-variant/20">
          {leads.map((lead) => (
            <div key={lead.id} className="p-6 hover:bg-black/[0.03] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-silver-gray/60 text-xs font-label-sm uppercase mb-1">Nome</p>
                    <p className="text-primary font-body-md truncate">{lead.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-silver-gray/60 text-xs font-label-sm uppercase mb-1">E-mail</p>
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-status-gold font-body-md hover:underline truncate block"
                    >
                      {lead.email || '—'}
                    </a>
                  </div>
                  <div>
                    <p className="text-silver-gray/60 text-xs font-label-sm uppercase mb-1">Telefone</p>
                    <p className="text-primary font-body-md">{lead.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-silver-gray/60 text-xs font-label-sm uppercase mb-1">Serviço</p>
                    <span className="px-2 py-0.5 bg-surface-container-highest text-[10px] font-label-sm uppercase text-silver-gray">
                      {lead.service || '—'}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-silver-gray/60 text-xs font-label-sm uppercase mb-1">Detalhes</p>
                    <p className="text-silver-gray text-sm line-clamp-2">{lead.details || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-silver-gray/40 text-xs font-label-sm hidden md:block">
                    {formatDate(lead.created_at)}
                  </p>
                  <button
                    onClick={() => remove(lead)}
                    disabled={removing === lead.id}
                    className="text-silver-gray hover:text-error transition-colors p-2 disabled:opacity-50"
                    aria-label="Excluir"
                  >
                    <Icon name="delete" />
                  </button>
                </div>
              </div>
              <p className="text-silver-gray/40 text-xs font-label-sm mt-3 md:hidden">
                {formatDate(lead.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
