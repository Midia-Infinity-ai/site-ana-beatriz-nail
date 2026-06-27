import { useEffect, useRef, useState } from 'react'
import { adminApi, type UploadItem } from './api'
import { Icon } from '../components/Icon'

type ImagePickerProps = {
  value: string
  onChange: (url: string) => void
}

/** Cover-image field: preview + URL input + gallery of uploads + upload button. */
export function ImagePicker({ value, onChange }: ImagePickerProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<UploadItem[]>([])
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) adminApi.listUploads().then(setItems).catch(() => undefined)
  }, [open])

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      const { url } = await adminApi.upload(file)
      onChange(url)
      setItems((prev) => [{ name: url, url, mtime: Date.now() }, ...prev])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex items-start gap-4">
        <div className="w-28 h-20 bg-surface-container-low border border-outline-variant/30 overflow-hidden shrink-0">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-silver-gray">
              <Icon name="image" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/img/exemplo.webp ou /uploads/..."
            className="w-full bg-surface-container-low border-b border-outline-variant focus:border-status-gold p-2 text-primary outline-none text-body-md"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="text-status-gold font-label-sm text-label-sm uppercase tracking-widest inline-flex items-center gap-1"
            >
              <Icon name="collections" className="text-base" /> Galeria
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="text-status-gold font-label-sm text-label-sm uppercase tracking-widest inline-flex items-center gap-1 disabled:opacity-50"
            >
              <Icon name="upload" className="text-base" /> {busy ? 'Enviando...' : 'Enviar'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>
        </div>
      </div>

      {open && (
        <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-2 p-3 bg-surface-container-low border border-outline-variant/30 max-h-56 overflow-y-auto">
          {items.length === 0 && (
            <p className="col-span-full text-silver-gray text-xs py-4 text-center">
              Nenhuma imagem enviada ainda.
            </p>
          )}
          {items.map((item) => (
            <button
              key={item.url}
              type="button"
              onClick={() => {
                onChange(item.url)
                setOpen(false)
              }}
              className="aspect-square overflow-hidden border border-outline-variant/30 hover:border-status-gold transition-colors"
            >
              <img src={item.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
