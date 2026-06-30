import { useEffect, useRef, useState } from 'react'
import { adminApi } from './api'
import { Icon } from '../components/Icon'

type CoverKey = 'hero' | 'criadora' | 'sensorial' | 'beforeBefore' | 'beforeAfter' | 'contact'

type CoversConfig = Record<CoverKey, string>

const DEFAULT_COVERS: CoversConfig = {
  hero: '',
  criadora: '',
  sensorial: '',
  beforeBefore: '',
  beforeAfter: '',
  contact: '',
}

const COVER_META: { key: CoverKey; label: string; page: string; spec: string }[] = [
  {
    key: 'hero',
    label: 'Hero — Capa Principal',
    page: 'Topo da página (tela cheia, com leve zoom)',
    spec: '1920×1080px mínimo • WebP ou JPG • 16:9 • máx. 800 KB',
  },
  {
    key: 'criadora',
    label: 'A Criadora — Retrato',
    page: 'Seção "Um tempo só seu" (retrato vertical)',
    spec: '900×1200px mínimo • WebP ou JPG • 3:4 • máx. 600 KB',
  },
  {
    key: 'sensorial',
    label: 'Experiência — Detalhe',
    page: 'Seção escura "O toque de ouro" (macro do cuidado)',
    spec: '1600×900px mínimo • WebP ou JPG • 16:9 • máx. 600 KB',
  },
  {
    key: 'beforeBefore',
    label: 'Antes/Depois — Antes',
    page: 'Comparador "Desperte sua Beleza" (lado esquerdo: natural)',
    spec: '1280×720px mínimo • WebP ou JPG • 16:9 • máx. 500 KB',
  },
  {
    key: 'beforeAfter',
    label: 'Antes/Depois — Depois',
    page: 'Comparador "Desperte sua Beleza" (lado direito: nail art)',
    spec: '1280×720px mínimo • WebP ou JPG • 16:9 • máx. 500 KB',
  },
  {
    key: 'contact',
    label: 'Contato — Imagem',
    page: 'Seção final de agendamento (quadrada)',
    spec: '1000×1000px mínimo • WebP ou JPG • 1:1 • máx. 500 KB',
  },
]

export function AdminCovers() {
  const [covers, setCovers] = useState<CoversConfig>(DEFAULT_COVERS)
  const [loading, setLoading] = useState(true)
  const [uploads, setUploads] = useState<{ name: string; url: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<CoverKey | null>(null)
  const coversRef = useRef<CoversConfig>(DEFAULT_COVERS)
  const fileRefs = useRef<Record<CoverKey, HTMLInputElement | null>>({
    hero: null,
    criadora: null,
    sensorial: null,
    beforeBefore: null,
    beforeAfter: null,
    contact: null,
  })

  useEffect(() => {
    Promise.all([
      adminApi.getSiteContent().then((data) => {
        if (data.covers) {
          const merged = { ...DEFAULT_COVERS, ...(data.covers as Partial<CoversConfig>) }
          setCovers(merged)
          coversRef.current = merged
        }
      }),
      adminApi.listUploads().then(setUploads),
    ]).finally(() => setLoading(false))
  }, [])

  // Update one cover AND persist immediately, so a change is never lost by
  // forgetting to press "Salvar".
  const applyCover = async (key: CoverKey, url: string) => {
    const next = { ...coversRef.current, [key]: url }
    coversRef.current = next
    setCovers(next)
    setError('')
    try {
      await adminApi.setSiteContent('covers', next)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Não foi possível salvar a capa. Verifique a conexão e tente novamente.')
    }
  }

  const save = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      await adminApi.setSiteContent('covers', coversRef.current)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Não foi possível salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const uploadFile = async (key: CoverKey, file: File) => {
    setBusy(key)
    setError('')
    try {
      const result = await adminApi.upload(file)
      setUploads((prev) => [{ name: result.name, url: result.url }, ...prev])
      await applyCover(key, result.url)
    } catch {
      setError('Falha no upload da imagem. Tente uma foto menor ou tente novamente.')
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <p className="text-silver-gray">Carregando...</p>

  return (
    <div>
      <h1 className="font-headline-md text-headline-md text-primary mb-2">Capas das Seções</h1>
      <p className="text-silver-gray font-body-md mb-10">
        Gerencie as imagens de cada seção do site. Faça upload de uma nova ou selecione da
        Mídia. Seções sem imagem mostram um marcador neutro no site.
      </p>

      <div className="space-y-8 mb-10">
        {COVER_META.map(({ key, label, page, spec }) => (
          <div
            key={key}
            className="border border-outline-variant/30 bg-surface-container p-6 flex flex-col md:flex-row gap-6"
          >
            <div className="md:w-64 shrink-0">
              <div className="relative aspect-video overflow-hidden bg-surface-container-low group flex items-center justify-center">
                {covers[key] ? (
                  <img src={covers[key]} alt={label} className="w-full h-full object-cover" />
                ) : (
                  <Icon name="image" className="text-silver-gray/30 text-4xl" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileRefs.current[key]?.click()}
                    disabled={busy === key}
                    className="bg-status-gold text-pure-black px-3 py-1.5 text-xs font-label-sm uppercase tracking-wider"
                  >
                    {busy === key ? 'Enviando...' : 'Upload'}
                  </button>
                </div>
              </div>
              <input
                ref={(el) => { fileRefs.current[key] = el }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadFile(key, file)
                  e.target.value = ''
                }}
              />
            </div>

            <div className="flex-1">
              <h3 className="font-headline-md text-body-lg text-primary mb-1">{label}</h3>
              <p className="text-silver-gray/60 text-sm mb-3">{page}</p>
              <div className="bg-surface-container-lowest p-3 mb-4 text-xs font-mono text-status-gold border border-outline-variant/20">
                {spec}
              </div>

              {covers[key] && (
                <button
                  type="button"
                  onClick={() => applyCover(key, '')}
                  className="text-silver-gray text-xs hover:text-error transition-colors font-label-sm uppercase mb-3 inline-flex items-center gap-1"
                >
                  <Icon name="close" className="text-sm" /> Remover imagem
                </button>
              )}

              {uploads.length > 0 && (
                <details className="group">
                  <summary className="text-silver-gray text-xs cursor-pointer hover:text-primary transition-colors font-label-sm uppercase">
                    Selecionar da Mídia ({uploads.length} imagens)
                  </summary>
                  <div className="grid grid-cols-4 gap-2 mt-3 max-h-40 overflow-y-auto">
                    {uploads.map((u) => (
                      <button
                        key={u.url}
                        type="button"
                        onClick={() => applyCover(key, u.url)}
                        className={`aspect-video overflow-hidden border-2 transition-colors ${
                          covers[key] === u.url
                            ? 'border-status-gold'
                            : 'border-transparent hover:border-outline-variant'
                        }`}
                        title={u.name}
                      >
                        <img src={u.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
        <button
          onClick={save}
          disabled={saving}
          className="bg-primary text-on-primary px-8 py-3 font-label-sm text-label-sm uppercase tracking-widest hover:bg-status-gold transition-colors disabled:opacity-50 w-full sm:w-auto text-center"
        >
          {saving ? 'Salvando...' : 'Salvar Capas'}
        </button>
        {saved && (
          <span className="text-status-gold font-body-md flex items-center gap-2">
            <Icon name="check_circle" className="text-base" /> Salvo
          </span>
        )}
        {error && (
          <span className="text-error font-body-md flex items-center gap-2">
            <Icon name="error" className="text-base" /> {error}
          </span>
        )}
      </div>

      <div className="mt-6 p-4 bg-surface-container-low border border-outline-variant/20">
        <p className="text-silver-gray/60 text-xs flex gap-2">
          <Icon name="info" className="text-xs shrink-0" />
          Cada imagem é salva automaticamente ao enviar ou selecionar; o botão "Salvar Capas"
          apenas reforça. As mudanças aparecem ao vivo no site (pode levar alguns minutos pelo
          cache do navegador).
        </p>
      </div>
    </div>
  )
}
