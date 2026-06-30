import { useEffect, useState } from 'react'
import { adminApi } from './api'
import { Icon } from '../components/Icon'

type Hero = { kicker: string; title: string }

const DEFAULT_HERO: Hero = {
  kicker: 'Sinta-se Poderosa',
  title: 'A Arte de se Amar através do Detalhe.',
}

export function AdminSiteContent() {
  const [hero, setHero] = useState<Hero>(DEFAULT_HERO)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminApi
      .getSiteContent()
      .then((data) => {
        if (data.hero) setHero({ ...DEFAULT_HERO, ...(data.hero as Partial<Hero>) })
      })
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await adminApi.setSiteContent('hero', hero)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-silver-gray">Carregando...</p>

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline-md text-headline-md text-primary mb-2">Conteúdo do Site</h1>
      <p className="text-silver-gray font-body-md mb-10">
        Os textos do topo da página (hero). O restante da copy fica no design; fale com o
        desenvolvedor para ajustes maiores.
      </p>

      <div className="space-y-6 mb-8">
        <div>
          <label className="font-label-sm text-label-sm text-silver-gray uppercase block mb-2">
            Selo (kicker)
          </label>
          <input
            type="text"
            value={hero.kicker}
            onChange={(e) => setHero((prev) => ({ ...prev, kicker: e.target.value }))}
            className="w-full bg-surface-container-low border-b border-outline-variant focus:border-status-gold p-3 text-primary outline-none transition-all"
          />
          <p className="text-silver-gray/60 text-xs mt-1">
            Texto pequeno em maiúsculas acima do título (ex: "Sinta-se Poderosa").
          </p>
        </div>
        <div>
          <label className="font-label-sm text-label-sm text-silver-gray uppercase block mb-2">
            Título principal
          </label>
          <textarea
            value={hero.title}
            rows={2}
            onChange={(e) => setHero((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full bg-surface-container-low border-b border-outline-variant focus:border-status-gold p-3 text-primary outline-none transition-all resize-none"
          />
          <p className="text-silver-gray/60 text-xs mt-1">
            A frase de impacto exibida em destaque sobre a imagem do topo.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="bg-primary text-on-primary px-8 py-3 font-label-sm text-label-sm uppercase tracking-widest hover:bg-status-gold transition-colors disabled:opacity-50 w-full sm:w-auto text-center"
        >
          {saving ? 'Salvando...' : 'Salvar'}
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
