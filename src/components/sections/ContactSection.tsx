import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../../content/ContentProvider'
import { SectionImage } from '../SectionImage'
import { Icon } from '../Icon'

type Status = 'idle' | 'submitting' | 'sent' | 'error'

export function ContactSection() {
  const { covers } = useContent()
  const [status, setStatus] = useState<Status>('idle')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'submitting' || status === 'sent') return
    setStatus('submitting')

    const data = new FormData(event.currentTarget)
    const payload = {
      name: (data.get('name') as string) ?? '',
      phone: (data.get('phone') as string) ?? '',
      service: 'Reserva de horário',
      details: (data.get('details') as string) ?? '',
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('request_failed')
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const inputClass =
    'w-full bg-transparent border-0 border-b border-pearl-white/30 focus:border-antique-gold focus:outline-none text-pearl-white font-body-md py-2 px-0 transition-colors placeholder:text-pearl-white/40'

  return (
    <section
      id="agendar"
      className="py-section-gap px-safe-margin-mobile md:px-safe-margin bg-deep-burgundy text-pearl-white relative scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-gutter items-center">
        <div className="flex flex-col">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-8">
            Sua experiência de luxo começa aqui.
          </h2>
          <p className="font-body-lg text-body-lg text-pearl-white/80 mb-12 max-w-md">
            Reserve seu momento e permita-se ser cuidada com a exclusividade que você merece.
          </p>

          {status === 'sent' ? (
            <div className="border border-antique-gold/50 p-8 max-w-md">
              <Icon name="check_circle" className="text-antique-gold text-4xl mb-4" />
              <h3 className="font-headline-md text-2xl mb-2">Recebido com carinho.</h3>
              <p className="font-body-md text-body-md text-pearl-white/80">
                Em breve entrarei em contato pelo WhatsApp para encontrarmos o melhor horário
                para o seu momento.
              </p>
            </div>
          ) : (
            <form className="flex flex-col gap-8 w-full max-w-md" onSubmit={handleSubmit}>
              <div className="relative pt-4">
                <label className="font-label-caps text-[11px] text-pearl-white/70 uppercase tracking-[0.2em] absolute top-0 left-0">
                  Seu Nome
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className={inputClass}
                  placeholder="Como gosta de ser chamada?"
                  disabled={status === 'submitting'}
                />
              </div>
              <div className="relative pt-4">
                <label className="font-label-caps text-[11px] text-pearl-white/70 uppercase tracking-[0.2em] absolute top-0 left-0">
                  Telefone / WhatsApp
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  className={inputClass}
                  placeholder="(00) 00000-0000"
                  disabled={status === 'submitting'}
                />
              </div>
              <div className="relative pt-4">
                <label className="font-label-caps text-[11px] text-pearl-white/70 uppercase tracking-[0.2em] absolute top-0 left-0">
                  Mensagem (opcional)
                </label>
                <input
                  name="details"
                  type="text"
                  className={inputClass}
                  placeholder="Conte o que você imagina"
                  disabled={status === 'submitting'}
                />
              </div>

              {status === 'error' && (
                <p className="flex items-center gap-2 text-sm text-pearl-white" role="alert">
                  <Icon name="error" className="text-base" /> Não consegui enviar agora. Tente
                  novamente em instantes.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="mt-4 border border-pearl-white text-pearl-white px-8 py-4 font-label-caps uppercase tracking-[0.2em] text-[11px] hover:bg-pearl-white hover:text-deep-burgundy transition-all duration-500 w-fit disabled:opacity-50"
              >
                {status === 'submitting' ? 'Enviando...' : 'Solicitar Horário'}
              </button>

              <p className="text-pearl-white/50 text-xs leading-relaxed">
                Ao enviar, você concorda com o uso dos seus dados para retorno do contato,
                conforme a{' '}
                <Link
                  to="/politica-de-privacidade"
                  className="text-antique-gold underline underline-offset-2 hover:text-pearl-white"
                >
                  Política de Privacidade
                </Link>
                .
              </p>
            </form>
          )}
        </div>

        <div className="relative hidden md:block aspect-square">
          <div className="absolute inset-0 bg-onyx-black/10 z-10" />
          <SectionImage
            src={covers.contact}
            alt="A metamorfose: do natural à arte"
            className="w-full h-full"
            imgClassName="opacity-90"
          />
        </div>
      </div>
    </section>
  )
}
