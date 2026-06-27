import { useEffect, useRef, useState } from 'react'
import { adminApi } from './api'
import { Icon } from '../components/Icon'
import type { ServicePackage } from '../content/siteContent'

const newPackage = (): ServicePackage => ({
  id: `pkg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: '',
  text: '',
  badge: '',
  image: '',
  active: true,
})

export function AdminPackages() {
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [uploads, setUploads] = useState<{ name: string; url: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    Promise.all([
      adminApi.getSiteContent().then((data) => {
        if (Array.isArray(data.packages)) setPackages(data.packages as ServicePackage[])
      }),
      adminApi.listUploads().then(setUploads),
    ]).finally(() => setLoading(false))
  }, [])

  const update = (id: string, patch: Partial<ServicePackage>) =>
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  const remove = (id: string) => {
    if (!window.confirm('Excluir este pacote?')) return
    setPackages((prev) => prev.filter((p) => p.id !== id))
  }

  const add = () => setPackages((prev) => [...prev, newPackage()])

  const move = (id: string, dir: -1 | 1) =>
    setPackages((prev) => {
      const i = prev.findIndex((p) => p.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  const uploadFile = async (id: string, file: File) => {
    setUploadingId(id)
    try {
      const result = await adminApi.upload(file)
      update(id, { image: result.url })
      setUploads((prev) => [{ name: result.name, url: result.url }, ...prev])
    } finally {
      setUploadingId(null)
    }
  }

  const save = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await adminApi.setSiteContent('packages', packages)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-silver-gray">Carregando...</p>

  const activeCount = packages.filter((p) => p.active).length

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary mb-2">Serviços</h1>
          <p className="text-silver-gray font-body-md max-w-2xl">
            Gerencie os serviços exibidos na seção "O Repertório" do site. Ative, desative e
            reordene. Sem serviços ativos aqui, o site mostra a lista padrão.
          </p>
        </div>
        <button
          onClick={add}
          className="bg-surface-container border border-outline-variant/40 text-primary px-5 py-3 font-label-sm text-label-sm uppercase tracking-widest hover:border-status-gold transition-colors inline-flex items-center gap-2 shrink-0"
        >
          <Icon name="add" className="text-lg" /> Novo Pacote
        </button>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/20 p-4 mb-8 inline-flex items-center gap-2 text-sm text-silver-gray">
        <Icon name="info" className="text-status-gold text-base" />
        {activeCount} pacote{activeCount !== 1 ? 's' : ''} ativo{activeCount !== 1 ? 's' : ''}
        {activeCount > 3 && ' — carrossel ativado no site'}
      </div>

      {packages.length === 0 ? (
        <div className="border border-outline-variant/30 border-dashed p-16 text-center">
          <Icon name="spa" className="text-silver-gray/30 text-5xl mb-4" />
          <p className="text-silver-gray">Nenhum serviço definido.</p>
          <p className="text-silver-gray/60 text-sm mt-2">
            Enquanto não houver serviços aqui, o site usa a lista padrão.
          </p>
        </div>
      ) : (
        <div className="space-y-6 mb-10">
          {packages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`border bg-surface-container p-6 flex flex-col md:flex-row gap-6 transition-opacity ${
                pkg.active ? 'border-outline-variant/30' : 'border-outline-variant/10 opacity-60'
              }`}
            >
              {/* Image */}
              <div className="md:w-56 shrink-0">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-low group">
                  {pkg.image ? (
                    <img src={pkg.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-silver-gray/40">
                      <Icon name="image" className="text-4xl" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => fileInputs.current[pkg.id]?.click()}
                      disabled={uploadingId === pkg.id}
                      className="bg-status-gold text-pure-black px-3 py-1.5 text-xs font-label-sm uppercase tracking-wider"
                    >
                      {uploadingId === pkg.id ? 'Enviando...' : 'Trocar imagem'}
                    </button>
                  </div>
                </div>
                <input
                  ref={(el) => { fileInputs.current[pkg.id] = el }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadFile(pkg.id, file)
                    e.target.value = ''
                  }}
                />
                {uploads.length > 0 && (
                  <details className="group mt-2">
                    <summary className="text-silver-gray text-xs cursor-pointer hover:text-primary transition-colors font-label-sm uppercase">
                      Selecionar da Mídia
                    </summary>
                    <div className="grid grid-cols-4 gap-1.5 mt-2 max-h-32 overflow-y-auto">
                      {uploads.map((u) => (
                        <button
                          key={u.url}
                          type="button"
                          onClick={() => update(pkg.id, { image: u.url })}
                          className={`aspect-square overflow-hidden border-2 ${
                            pkg.image === u.url ? 'border-status-gold' : 'border-transparent hover:border-outline-variant'
                          }`}
                        >
                          <img src={u.url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </details>
                )}
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={pkg.title}
                  onChange={(e) => update(pkg.id, { title: e.target.value })}
                  placeholder="Nome do serviço"
                  className="w-full bg-surface-container-low border-b border-outline-variant focus:border-status-gold p-3 text-primary font-headline-md text-lg outline-none"
                />
                <textarea
                  value={pkg.text}
                  onChange={(e) => update(pkg.id, { text: e.target.value })}
                  placeholder="Descrição (ex: Estrutura e acabamento impecável para as suas mãos.)"
                  rows={2}
                  className="w-full bg-surface-container-low border-b border-outline-variant focus:border-status-gold p-3 text-silver-gray text-sm outline-none resize-none"
                />
                <div className="flex flex-wrap items-center gap-4">
                  <input
                    type="text"
                    value={pkg.badge ?? ''}
                    onChange={(e) => update(pkg.id, { badge: e.target.value })}
                    placeholder="Selo (opcional, ex: POPULAR)"
                    className="flex-1 min-w-[160px] bg-surface-container-low border-b border-outline-variant focus:border-status-gold p-2 text-primary text-sm outline-none"
                  />
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={pkg.active}
                      onChange={(e) => update(pkg.id, { active: e.target.checked })}
                      className="accent-status-gold w-4 h-4"
                    />
                    <span className="text-sm text-silver-gray">{pkg.active ? 'Ativo' : 'Inativo'}</span>
                  </label>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => move(pkg.id, -1)}
                    disabled={index === 0}
                    aria-label="Subir"
                    className="p-2 text-silver-gray hover:text-primary disabled:opacity-30 transition-colors"
                  >
                    <Icon name="arrow_upward" className="text-base" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(pkg.id, 1)}
                    disabled={index === packages.length - 1}
                    aria-label="Descer"
                    className="p-2 text-silver-gray hover:text-primary disabled:opacity-30 transition-colors"
                  >
                    <Icon name="arrow_downward" className="text-base" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(pkg.id)}
                    aria-label="Excluir"
                    className="p-2 text-silver-gray hover:text-error transition-colors ml-auto"
                  >
                    <Icon name="delete" className="text-base" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="btn-shine bg-primary text-pure-black px-8 py-3 font-label-sm text-label-sm uppercase tracking-widest hover:bg-status-gold transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar Serviços'}
        </button>
        {saved && (
          <span className="text-status-gold font-body-md flex items-center gap-2">
            <Icon name="check_circle" className="text-base" /> Salvo
          </span>
        )}
      </div>
    </div>
  )
}
