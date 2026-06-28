import { useRef, useState } from 'react'
import { Reveal } from '../Reveal'
import { Icon } from '../Icon'
import { whatsappHref } from '../../lib/contact'
import { compressImageToDataUrl } from '../../lib/image'

/** Style options (ids are mapped to art-direction prompts on the server). */
const STYLES = [
  { id: 'molde-f1', label: 'Molde F1' },
  { id: 'cutilagem-russa', label: 'Cutilagem Russa' },
  { id: 'francesinha', label: 'Francesinha' },
] as const

const MAX_BYTES = 12 * 1024 * 1024
const VISITOR_KEY = 'aba_visitor'

type Status = 'idle' | 'generating' | 'done' | 'error'

/** Stable anonymous id (shared with the visit tracker) for the per-person cap. */
function getVisitorId(): string {
  try {
    let v = localStorage.getItem(VISITOR_KEY) ?? ''
    if (!v) {
      v = crypto.randomUUID?.() ?? `v-${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(VISITOR_KEY, v)
    }
    return v
  } catch {
    return ''
  }
}

export function AiMirror() {
  const [photo, setPhoto] = useState<string>('')
  const [reference, setReference] = useState<string>('')
  const [style, setStyle] = useState<string>(STYLES[0].id)
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const refInputRef = useRef<HTMLInputElement>(null)

  const validate = (file: File): string => {
    if (!file.type.startsWith('image/')) return 'Selecione uma imagem (JPG ou PNG).'
    if (file.size > MAX_BYTES) return 'A imagem é muito grande. Use uma foto de até 12 MB.'
    return ''
  }

  const onPick = async (file?: File) => {
    if (!file) return
    const msg = validate(file)
    if (msg) {
      setError(msg)
      setStatus('error')
      return
    }
    setPhoto(await compressImageToDataUrl(file))
    setResult('')
    setStatus('idle')
    setError('')
  }

  const onPickReference = async (file?: File) => {
    if (!file) return
    const msg = validate(file)
    if (msg) {
      setError(msg)
      setStatus('error')
      return
    }
    setReference(await compressImageToDataUrl(file))
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
        body: JSON.stringify({
          image: photo,
          style,
          reference: reference || undefined,
          visitor: getVisitorId(),
        }),
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
          : code === 'personal_limit'
            ? 'Você já experimentou alguns estilos por aqui. Para explorar mais possibilidades, me chame no WhatsApp!'
            : code === 'ai_limit_reached'
              ? 'Atingimos o limite de provas deste mês. Me chame no WhatsApp que eu te mostro pessoalmente!'
              : 'Não consegui gerar agora. Tente outra foto ou tente novamente em instantes.',
      )
      setStatus('error')
    }
  }

  const reset = () => {
    setPhoto('')
    setReference('')
    setResult('')
    setStatus('idle')
    setError('')
    if (inputRef.current) inputRef.current.value = ''
    if (refInputRef.current) refInputRef.current.value = ''
  }

  const styleLabel = STYLES.find((s) => s.id === style)?.label ?? ''

  return (
    <section
      id="espelho"
      data-nav-theme="light"
      className="py-20 sm:py-28 md:py-section-gap px-safe-margin-mobile md:px-safe-margin bg-pearl-white relative scroll-mt-24"
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

            {status !== 'done' && (
              <>
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

                {/* Optional reference image */}
                <div className="flex flex-col gap-3">
                  <span className="font-label-caps text-[10px] text-antique-gold uppercase tracking-[0.2em]">
                    Imagem de referência (opcional)
                  </span>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => refInputRef.current?.click()}
                      className="relative w-16 h-16 shrink-0 border border-antique-gold/40 bg-white/60 flex items-center justify-center hover:bg-white transition-colors overflow-hidden"
                      aria-label="Adicionar imagem de referência"
                    >
                      {reference ? (
                        <img src={reference} alt="Referência" className="w-full h-full object-cover" />
                      ) : (
                        <Icon name="add_photo_alternate" className="text-antique-gold text-2xl" />
                      )}
                    </button>
                    <div className="text-xs text-ink-soft/70 leading-relaxed">
                      {reference ? (
                        <button
                          type="button"
                          onClick={() => {
                            setReference('')
                            if (refInputRef.current) refInputRef.current.value = ''
                          }}
                          className="text-deep-burgundy underline underline-offset-2 hover:opacity-70"
                        >
                          Remover referência
                        </button>
                      ) : (
                        'Tem um modelo em mente? Envie uma foto e a IA replica esse desenho nas suas unhas.'
                      )}
                    </div>
                    <input
                      ref={refInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onPickReference(e.target.files?.[0])}
                    />
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
              </>
            )}

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
              Envie uma foto das suas mãos, escolha um estilo (ou anexe uma referência) e veja,
              em segundos, uma prévia ultra-realista do resultado, fiel às suas unhas. Uma
              experiência sob medida, antes mesmo de sair de casa.
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
