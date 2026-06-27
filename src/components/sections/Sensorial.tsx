import { useContent } from '../../content/ContentProvider'
import { Reveal } from '../Reveal'
import { SectionImage } from '../SectionImage'

export function Sensorial() {
  const { covers } = useContent()

  return (
    <section
      id="experiencia"
      className="py-section-gap px-safe-margin-mobile md:px-safe-margin bg-onyx-black text-pearl-white relative overflow-hidden scroll-mt-24"
    >
      {/* Decorative oversized background word */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-headline-lg text-white/[0.02] whitespace-nowrap pointer-events-none select-none z-0">
        SENSORIAL
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter relative z-10">
        <div className="md:col-span-4 flex flex-col justify-center mb-12 md:mb-0">
          <Reveal>
            <span className="font-label-caps text-label-caps text-antique-gold tracking-[0.2em] uppercase mb-6 block">
              O Momento de Cuidado
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-8">
              O toque de ouro nas suas mãos.
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="font-body-lg text-body-lg text-pearl-white/70 mb-12">
              Mime-se com uma experiência que vai além. Desfrute de momentos relaxantes que
              preparam suas mãos para receberem a arte, em um ambiente pensado para o seu
              bem-estar.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <a
              href="#agendar"
              className="group flex items-center gap-4 w-fit"
            >
              <span className="font-label-caps uppercase tracking-[0.2em] text-[11px] group-hover:text-antique-gold transition-colors">
                Viva a Experiência
              </span>
              <span className="w-12 h-px bg-pearl-white group-hover:bg-antique-gold group-hover:w-16 transition-all duration-300" />
            </a>
          </Reveal>
        </div>

        <div className="md:col-span-7 md:col-start-6 relative">
          <div className="aspect-[4/5] md:aspect-[16/9] relative overflow-hidden">
            <SectionImage
              src={covers.sensorial}
              alt="Detalhe macro de um cuidado de luxo nas unhas"
              className="w-full h-full clip-image grayscale hover:grayscale-0 transition-all duration-1000"
              imgClassName="clip-image grayscale hover:grayscale-0 transition-all duration-1000"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
