import { useContent } from '../../content/ContentProvider'
import type { ServicePackage } from '../../content/siteContent'
import { Reveal } from '../Reveal'
import { SectionImage } from '../SectionImage'

/** Shown until the admin defines its own list under "Serviços". */
const DEFAULT_SERVICES: ServicePackage[] = [
  {
    id: 'svc-1',
    title: 'Alongamento em Gel',
    text: 'Estrutura, resistência e um acabamento impecável, desenhados para a forma das suas mãos.',
    badge: 'Mais procurado',
    image: '',
    active: true,
  },
  {
    id: 'svc-2',
    title: 'Nail Art Autoral',
    text: 'Peças únicas, pintadas à mão. Da delicadeza minimalista à obra de arte mais elaborada.',
    badge: 'Exclusivo',
    image: '',
    active: true,
  },
  {
    id: 'svc-3',
    title: 'Manicure Russa',
    text: 'Precisão milimétrica de cutícula e uma esmaltação de longa duração com aspecto natural.',
    badge: '',
    image: '',
    active: true,
  },
]

export function Services() {
  const { packages } = useContent()
  const active = packages.filter((p) => p.active)
  const list = active.length ? active : DEFAULT_SERVICES

  return (
    <section
      id="servicos"
      data-nav-theme="light"
      className="py-20 sm:py-28 md:py-section-gap px-safe-margin-mobile md:px-safe-margin bg-canvas relative scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <Reveal>
            <span className="font-label-caps text-label-caps text-antique-gold tracking-[0.2em] uppercase mb-4 block">
              O Repertório
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-onyx-black">
              Serviços que viram assinatura.
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-gutter gap-y-16">
          {list.map((svc, i) => (
            <Reveal as="article" key={svc.id} delay={i * 100} className="group flex flex-col">
              <div className="aspect-[4/5] relative overflow-hidden mb-6">
                <SectionImage
                  src={svc.image}
                  alt={svc.title}
                  reveal={false}
                  imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
                />
                {svc.badge ? (
                  <span className="absolute top-4 left-4 bg-onyx-black/80 text-pearl-white font-label-caps text-[10px] uppercase tracking-[0.2em] px-3 py-1.5">
                    {svc.badge}
                  </span>
                ) : null}
              </div>
              <h3 className="font-headline-md text-2xl text-onyx-black mb-3">{svc.title}</h3>
              <p className="font-body-md text-body-md text-ink-soft leading-relaxed">{svc.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
