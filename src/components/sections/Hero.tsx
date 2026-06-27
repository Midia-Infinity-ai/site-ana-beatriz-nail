import { useContent } from '../../content/ContentProvider'
import { OptimizedImage } from '../OptimizedImage'

export function Hero() {
  const { hero, covers } = useContent()

  return (
    <section
      id="topo"
      data-nav-theme="dark"
      className="relative min-h-screen flex items-center justify-center px-safe-margin-mobile md:px-safe-margin pt-32 pb-16 overflow-hidden"
    >
      <div className="absolute inset-0 z-0 bg-onyx-black">
        {covers.hero ? (
          <OptimizedImage
            src={covers.hero}
            alt="Atelier de Ana Beatriz em luz dourada"
            priority
            className="w-full h-full object-cover animate-ken-burns"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-deep-burgundy via-onyx-black to-onyx-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-onyx-black/30 via-transparent to-onyx-black/80" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
        <span className="font-label-caps text-label-caps text-antique-gold tracking-[0.3em] uppercase mb-8 animate-rise">
          {hero.kicker}
        </span>
        <h1
          className="font-display-xl text-[15vw] leading-[0.95] sm:text-[60px] sm:leading-[60px] md:text-display-xl text-pearl-white animate-rise"
          style={{ ['--rise-delay' as string]: '200ms' }}
        >
          {hero.title}
        </h1>
        <div
          className="mt-16 flex flex-col items-center gap-4 animate-rise"
          style={{ ['--rise-delay' as string]: '400ms' }}
        >
          <span className="w-px h-24 bg-pearl-white/50" />
          <span className="font-label-caps text-[10px] uppercase tracking-[0.3em] text-pearl-white/50">
            Descubra
          </span>
        </div>
      </div>
    </section>
  )
}
