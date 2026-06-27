import { useCallback, useRef, useState } from 'react'
import { useContent } from '../../content/ContentProvider'
import { Reveal } from '../Reveal'
import { SectionImage } from '../SectionImage'
import { Icon } from '../Icon'

export function BeforeAfter() {
  const { covers } = useContent()
  const [pos, setPos] = useState(50)
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updateFromClientX = useCallback((clientX: number) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const next = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.max(0, Math.min(100, next)))
  }, [])

  const onDown = (clientX: number) => {
    dragging.current = true
    updateFromClientX(clientX)
  }
  const onMove = (clientX: number) => {
    if (dragging.current) updateFromClientX(clientX)
  }
  const stop = () => {
    dragging.current = false
  }

  return (
    <section
      id="portfolio"
      data-nav-theme="light"
      className="py-section-gap px-safe-margin-mobile md:px-safe-margin bg-pearl-white relative scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto text-center mb-16">
        <Reveal>
          <span className="font-label-caps text-label-caps text-antique-gold tracking-[0.2em] uppercase mb-4 block">
            A Transformação
          </span>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-onyx-black mx-auto">
            Desperte sua Beleza
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="font-body-md text-body-md text-ink-soft mt-6 max-w-2xl mx-auto">
            Acompanhe a jornada de um cuidado essencial até uma obra de arte única.
          </p>
        </Reveal>
      </div>

      <Reveal delay={100} className="max-w-5xl mx-auto">
        <div
          ref={ref}
          className="aspect-video before-after-slider layer-depth-1 select-none"
          onMouseDown={(e) => onDown(e.clientX)}
          onMouseMove={(e) => onMove(e.clientX)}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={(e) => onDown(e.touches[0].clientX)}
          onTouchMove={(e) => onMove(e.touches[0].clientX)}
          onTouchEnd={stop}
        >
          {/* After (full, underneath) */}
          <SectionImage
            src={covers.beforeAfter}
            alt="Resultado: nail art autoral"
            className="absolute inset-0 w-full h-full pointer-events-none"
            imgClassName="pointer-events-none"
          />
          {/* Before (clipped overlay) */}
          <div
            className="before-image pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          >
            <SectionImage
              src={covers.beforeBefore}
              alt="Antes: elegância natural"
              className="w-full h-full"
            />
          </div>
          <div className="slider-handle" style={{ left: `${pos}%` }}>
            <div className="slider-button">
              <Icon name="sync_alt" className="text-onyx-black text-sm" />
            </div>
          </div>
        </div>
      </Reveal>

      <div className="max-w-5xl mx-auto flex justify-between mt-4 px-1 font-label-caps text-[11px] text-ink-soft uppercase tracking-[0.2em]">
        <span>Natural Elegance</span>
        <span>Artistic Masterpiece</span>
      </div>
    </section>
  )
}
