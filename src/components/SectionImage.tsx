import { OptimizedImage } from './OptimizedImage'
import { Icon } from './Icon'
import { useScrollReveal } from '../hooks/useScrollReveal'

type SectionImageProps = {
  src?: string
  alt: string
  /** Applied to the wrapper (aspect/size/position). */
  className?: string
  /** Applied to the <img> (e.g. grayscale, hover scale). */
  imgClassName?: string
  priority?: boolean
  /** Masked clip-path reveal on scroll. Default true. */
  reveal?: boolean
}

/**
 * Renders an uploaded image, or a tasteful neutral placeholder when the cover
 * has not been set yet. When `reveal` is on, the wrapper fades/rises in on
 * scroll via `editorial-reveal` (opacity based). We intentionally avoid a
 * clip-path mask here: a fully-clipped element reports zero visible area to the
 * IntersectionObserver, so it would never trigger its own reveal (and stay
 * invisible). Opacity does not blind the observer, so this is reliable.
 */
export function SectionImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  priority = false,
  reveal = true,
}: SectionImageProps) {
  const ref = useScrollReveal<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={`w-full h-full overflow-hidden ${reveal ? 'editorial-reveal' : ''} ${className}`}
    >
      {src ? (
        <OptimizedImage
          src={src}
          alt={alt}
          priority={priority}
          className={`w-full h-full object-cover ${imgClassName}`}
        />
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center bg-[#e9e4df] text-line-strong/60"
          aria-label={alt}
          role="img"
        >
          <Icon name="image" className="text-4xl mb-2" />
          <span className="font-label-caps text-[10px] uppercase tracking-[0.2em]">
            Imagem em breve
          </span>
        </div>
      )}
    </div>
  )
}
