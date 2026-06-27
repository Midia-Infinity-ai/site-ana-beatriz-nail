import { useRef, useState } from 'react'
import { Reveal } from '../Reveal'
import { Icon } from '../Icon'
import { whatsappHref } from '../../lib/contact'

/** Style options (ids are mapped to art-direction prompts on the server). */
const STYLES = [
  { id: 'classico-real', label: 'Clássico Real' },
  { id: 'ouro-majestoso', label: 'Ouro Majestoso' },
  { id: 'minimalismo', label: 'Minimalismo Moderno' },
  { id: 'nail-art', label: 'Nail Art Autoral' },
  { id: 'francesinha', label: 'Francesinha Moderna' },
  { id: 'vermelho-couture', label: 'Vermelho Couture' },
] as const

const MAX_BYTES = 8 * 1024 * 1024

type Status = 'idle' | 'generating' | 'done' | 'error'

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function AiMirror() {
  const [photo, setPhoto] = useState<string>('')
  const [style, setStyle] = useState<string>(STYLES[0].id)
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const onPick = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Selecione uma imagem (JPG ou PNG).')
      setStatus('error')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('A imagem é muito grande. Use uma foto de até 8 MB.')
      setStatus('error')
      return
    }
    const dataUrl = await readAsDataUrl(file)
    setPhoto(dataUrl)
    setResult('')
    setStatus('idle')
    setError('')
  }

  const generate = async () => {
    if (!photo || status === 'generating') return
    setStatus('generating')
    setError('')
    try {
      const res = await fetch('/api/nail/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: photo, style }),
      })
      if (!res.ok) {
        const detail = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(detail.error ?? 'falha')
      }
      const data = (await res.json()) as { image?: string }
      if (!data.image) throw new Error('sem_imagem')
      setResult(data.image)
      setStatus('done')
    } catch (err) {
      const code = err instanceof Error ? err.message : 'falha'
      setError(
        code === 'ai_disabled'
          ? 'O provador virtual está sendo configurado. Tente novamente em breve.'
          : code === 'ai_limit_reached'
            ? 'Atingimos o limite de provas deste mês. Fale comigo no WhatsApp que eu te mostro pessoalmente!'
            : 'Não consegui gerar agora. Tente outra foto ou tente novamente em instantes.',
      )
      setStatus('error')
    }
  }

  const reset = () => {
    setPhoto('')
    setResult('')
    setStatus('idle')
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const styleLabel = STYLES.find((s) => s.id === style)?.label ?? ''

  return (
    <section
      id="espelho"
      className="py-section-gap px-safe-margin-mobile md:px-safe-margin bg-pearl-white relative scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Interactive panel */}
        <div className="order-2 md:order-1 relative">
          <div className="flex flex-col gap-8">
            {/* Upload / preview / result */}
            {status === 'done' && result ? (
              <div className="relative">
                <div className="aspect-square relative overflow-hidden layer-depth-1 bg-onyx-black">
                  <img
                    src={result}
                    alt={`Prévia das suas unhas no estilo ${styleLabel}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 left-4 bg-antique-gold text-onyx-black font-label-caps text-[10px] uppercase tracking-[0.2em] px-3 py-1.5">
                    {styleLabel}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mt-5">
                  <a
                    href={whatsappHref(
                      `Olá, Ana Beatriz! Provei o estilo "${styleLabel}" no Espelho do Futuro e amei. Gostaria de agendar um horário.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-deep-burgundy text-pearl-white px-6 py-3 font-label-caps text-[11px] uppercase tracking-[0.2em] hover:bg-onyx-black transition-colors"
                  >
                    <Icon name="event_available" className="text-base" /> Agendar este modelo
                  </a>
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 border border-onyx-black/30 text-onyx-black px-6 py-3 font-label-caps text-[11px] uppercase tracking-[0.2em] hover:border-onyx-black transition-colors"
                  >
                    <Icon name="restart_alt" className="text-base" /> Tentar outro
                  </button>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
                className="aspect-square relative overflow-hidden border-2 border-dashed border-antique-gold/40 bg-white/60 flex flex-col items-center justify-center text-center px-6 group cursor-pointer hover:bg-white transition-all duration-500 layer-depth-1"
              >
                {photo ? (
                  <>
                    <img
                      src={photo}
                      alt="Sua foto"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {status === 'generating' && (
                      <div className="absolute inset-0 bg-onyx-black/70 flex flex-col items-center justify-center text-pearl-white">
                        <Icon name="progress_activity" className="animate-spin text-4xl mb-3" />
                        <span className="font-label-caps text-[11px] uppercase tracking-[0.2em]">
                          Criando a sua arte...
                        </span>
                      </div>
                    )}
                    {status !== 'generating' && (
                      <span className="absolute bottom-4 right-4 bg-onyx-black/70 text-pearl-white font-label-caps text-[10px] uppercase tracking-[0.2em] px-3 py-1.5">
                        Trocar foto
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Icon
                      name="add_a_photo"
                      className="text-antique-gold text-5xl mb-4 group-hover:scale-110 transition-transform duration-500"
                    />
                    <p className="font-label-caps text-antique-gold tracking-[0.2em] text-[11px] uppercase">
                      Carregar foto da sua mão
                    </p>
                    <p className="text-xs text-ink-soft/60 mt-2">
                      Tire na hora ou escolha da galeria • JPG ou PNG
                    </p>
                  </>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => onPick(e.target.files?.[0])}
                />
              </div>
            )}

            {/* Style chooser */}
            <div className="flex flex-col gap-4">
              <span className="font-label-caps text-[10px] text-antique-gold uppercase tracking-[0.2em]">
                Escolha seu Estilo
              </span>
              <div className="flex flex-wrap gap-3">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`px-4 py-2 border font-label-caps text-[10px] uppercase tracking-[0.2em] transition-all ${
                      style === s.id
                        ? 'bg-antique-gold text-onyx-black border-antique-gold'
                        : 'border-antique-gold/30 text-onyx-black hover:bg-antique-gold hover:text-onyx-black'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action */}
            <button
              onClick={generate}
              disabled={!photo || status === 'generating'}
              className="inline-flex items-center justify-center gap-3 bg-onyx-black text-pearl-white px-8 py-4 font-label-caps text-[11px] uppercase tracking-[0.2em] hover:bg-deep-burgundy transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-fit"
            >
              <Icon name="auto_awesome" className="text-base" />
              {status === 'generating' ? 'Gerando...' : 'Gerar minha prévia'}
            </button>

            {error && (
              <p className="flex items-center gap-2 text-sm text-deep-burgundy" role="alert">
                <Icon name="error" className="text-base" /> {error}
              </p>
            )}
          </div>
          <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-antique-gold/10 rounded-full blur-3xl z-[-1]" />
        </div>

        {/* Copy */}
        <div className="order-1 md:order-2 flex flex-col">
          <Reveal>
            <span className="font-label-caps text-label-caps text-antique-gold tracking-[0.2em] uppercase mb-4 block">
              Espelho do Futuro
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-onyx-black mb-6">
              Sinta sua arte antes mesmo de chegar
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="font-body-lg text-body-lg text-ink-soft mb-4">
              Envie uma foto das suas mãos, escolha um estilo e veja, em segundos, uma prévia
              ultra-realista do resultado, fiel às suas unhas. Uma experiência sob medida,
              antes mesmo de sair de casa.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <p className="font-body-md text-body-md text-ink-soft/70">
              Sua foto é usada apenas para gerar a prévia e não é publicada.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
