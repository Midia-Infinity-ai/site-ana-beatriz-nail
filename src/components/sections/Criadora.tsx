import { useContent } from '../../content/ContentProvider'
import { Reveal } from '../Reveal'
import { SectionImage } from '../SectionImage'

export function Criadora() {
  const { covers } = useContent()

  return (
    <section
      id="sobre"
      data-nav-theme="light"
      className="py-20 sm:py-28 md:py-section-gap px-safe-margin-mobile md:px-safe-margin bg-pearl-white relative scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-gutter items-center">
        <div className="md:col-span-5 relative mx-auto w-full max-w-sm md:max-w-none">
          <div className="aspect-[3/4] relative overflow-hidden mask-arch ring-soft">
            <SectionImage
              src={covers.criadora}
              alt="Retrato de Ana Beatriz em seu atelier"
              imgClassName="transition-transform duration-[1.4s] ease-out hover:scale-[1.05]"
            />
          </div>
          {/* Arched gold echo, offset for a delicate layered feel */}
          <div className="absolute -bottom-5 -right-5 md:-bottom-8 md:-right-8 w-full h-full border border-antique-gold/30 mask-arch z-[-1]" />
        </div>

        <div className="md:col-span-6 md:col-start-7 flex flex-col md:pt-0">
          <Reveal>
            <span className="font-label-caps text-label-caps text-antique-gold tracking-[0.2em] uppercase mb-6 block">
              A Criadora
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-onyx-black mb-8">
              Um tempo só seu, guiado com paixão.
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="font-body-lg text-body-lg text-ink-soft mb-8 max-w-xl">
              Acredito que o verdadeiro luxo mora na pausa. Meu propósito não é apenas
              adornar suas mãos, mas criar um refúgio onde você se reconecta consigo mesma.
              Cada traço é pensado para refletir a sua essência e elevar a sua autoestima,
              transformando um cuidado habitual em um ritual de amor próprio.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <span className="font-headline-md text-2xl text-onyx-black/80 italic">
              Ana Beatriz
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
