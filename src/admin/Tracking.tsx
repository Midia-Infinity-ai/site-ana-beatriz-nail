import { useEffect, useState } from 'react'
import { adminApi } from './api'
import { Icon } from '../components/Icon'

type TrackingConfig = {
  metaPixelId: string
  googleAnalyticsId: string
  googleTagManagerId: string
  googleAdsId: string
}

const EMPTY: TrackingConfig = {
  metaPixelId: '',
  googleAnalyticsId: '',
  googleTagManagerId: '',
  googleAdsId: '',
}

type Field = { key: keyof TrackingConfig; label: string; hint: string; placeholder: string }

const FIELDS: Field[] = [
  {
    key: 'metaPixelId',
    label: 'Meta Pixel (Facebook)',
    hint: 'Encontre em Gerenciador de Eventos → Pixel → Configurações',
    placeholder: '123456789012345',
  },
  {
    key: 'googleAnalyticsId',
    label: 'Google Analytics 4',
    hint: 'Measurement ID — começa com "G-"',
    placeholder: 'G-XXXXXXXXXX',
  },
  {
    key: 'googleTagManagerId',
    label: 'Google Tag Manager',
    hint: 'Container ID — começa com "GTM-"',
    placeholder: 'GTM-XXXXXXX',
  },
  {
    key: 'googleAdsId',
    label: 'Google Ads (Conversão)',
    hint: 'Conversion ID — começa com "AW-"',
    placeholder: 'AW-XXXXXXXXXX',
  },
]

export function AdminTracking() {
  const [config, setConfig] = useState<TrackingConfig>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    adminApi
      .getSiteContent()
      .then((data) => {
        if (data.tracking) setConfig({ ...EMPTY, ...(data.tracking as Partial<TrackingConfig>) })
      })
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await adminApi.setSiteContent('tracking', config)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-silver-gray">Carregando...</p>

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline-md text-headline-md text-primary mb-2">Rastreamento & Analytics</h1>
      <p className="text-silver-gray font-body-md mb-2">
        Cole os IDs abaixo para ativar os pixels de rastreamento no site. As tags são injetadas automaticamente
        em todas as páginas.
      </p>
      <div className="bg-surface-container-low border border-outline-variant/20 p-4 mb-10 flex gap-3">
        <Icon name="info" className="text-status-gold text-lg shrink-0 mt-0.5" />
        <p className="text-silver-gray text-sm">
          Deixe o campo em branco para desativar um pixel. As mudanças ficam ativas após salvar e recarregar o site.
        </p>
      </div>

      <div className="space-y-8 mb-8">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="font-label-sm text-label-sm text-silver-gray uppercase block mb-2">
              {field.label}
            </label>
            <input
              type="text"
              value={config[field.key]}
              onChange={(e) => setConfig((prev) => ({ ...prev, [field.key]: e.target.value.trim() }))}
              placeholder={field.placeholder}
              className="w-full bg-surface-container-low border-b border-outline-variant focus:border-status-gold p-3 text-primary font-mono outline-none transition-all placeholder:text-silver-gray/30"
            />
            <p className="text-silver-gray/60 text-xs mt-1">{field.hint}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="btn-shine bg-primary text-on-primary px-8 py-3 font-label-sm text-label-sm uppercase tracking-widest hover:bg-status-gold transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
        {saved && (
          <span className="text-status-gold font-body-md flex items-center gap-2">
            <Icon name="check_circle" className="text-base" /> Salvo — recarregue o site para ativar
          </span>
        )}
      </div>
    </div>
  )
}
