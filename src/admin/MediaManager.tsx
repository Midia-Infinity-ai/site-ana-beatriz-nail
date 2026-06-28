import { useEffect, useRef, useState } from 'react'
import { adminApi, type UploadItem } from './api'
import { Icon } from '../components/Icon'

export function AdminMedia() {
  const [items, setItems] = useState<UploadItem[]>([])
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState('')
  const [removing, setRemoving] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => adminApi.listUploads().then(setItems).catch(() => undefined)
  useEffect(() => { load() }, [])

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      await adminApi.upload(file)
      await load()
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const copy = (url: string) => {
    navigator.clipboard?.writeText(url)
    setCopied(url)
    window.setTimeout(() => setCopied(''), 1500)
  }

  const download = (item: UploadItem) => {
    const a = document.createElement('a')
    a.href = item.url
    a.download = item.name
    a.click()
  }

  const remove = async (item: UploadItem) => {
    if (!window.confirm(`Excluir "${item.name}"? Esta ação não pode ser desfeita.`)) return
    setRemoving(item.url)
    try {
      await adminApi.deleteUpload(item.name)
      setItems((prev) => prev.filter((i) => i.url !== item.url))
    } catch {
      window.alert('Erro ao excluir a imagem.')
    } finally {
      setRemoving('')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary">Mídia</h1>
          {items.length > 0 && (
            <p className="text-silver-gray/60 text-sm mt-1">{items.length} imagens</p>
          )}
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="btn-shine bg-primary text-on-primary px-5 py-3 font-label-sm text-label-sm uppercase tracking-widest hover:bg-status-gold transition-colors inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Icon name="upload" className="text-lg" /> {busy ? 'Enviando...' : 'Enviar Imagem'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>

      {items.length === 0 ? (
        <div className="border border-outline-variant/30 border-dashed p-16 text-center">
          <Icon name="image" className="text-silver-gray/30 text-5xl mb-4" />
          <p className="text-silver-gray">Nenhuma imagem enviada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.url}
              className={`bg-surface-container border border-outline-variant/30 overflow-hidden group transition-opacity ${
                removing === item.url ? 'opacity-40' : ''
              }`}
            >
              <div className="aspect-[4/3] overflow-hidden bg-surface-container-low relative">
                <img src={item.url} alt="" className="w-full h-full object-cover" />
                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => download(item)}
                    title="Download"
                    className="w-9 h-9 bg-white/20 hover:bg-status-gold hover:text-pure-black text-white flex items-center justify-center transition-colors"
                  >
                    <Icon name="download" className="text-base" />
                  </button>
                  <button
                    type="button"
                    onClick={() => copy(item.url)}
                    title="Copiar URL"
                    className="w-9 h-9 bg-white/20 hover:bg-white hover:text-pure-black text-white flex items-center justify-center transition-colors"
                  >
                    <Icon name={copied === item.url ? 'check' : 'content_copy'} className="text-base" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    disabled={removing === item.url}
                    title="Excluir"
                    className="w-9 h-9 bg-white/20 hover:bg-error hover:text-white text-white flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <Icon name="delete" className="text-base" />
                  </button>
                </div>
              </div>
              <p className="px-3 py-2 text-silver-gray/60 text-[10px] font-mono truncate">{item.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
