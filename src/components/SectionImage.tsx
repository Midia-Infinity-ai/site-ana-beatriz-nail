import { OptimizedImage } from './OptimizedImage'
import { Icon } from './Icon'

type SectionImageProps = {
  src?: string
  alt: string
  className?: string
  imgClassName?: string
  priority?: boolean
}

/**
 * Renders an uploaded image, or a tasteful neutral placeholder when the cover
 * has not been set yet in the admin panel. Keeps the layout intact pre-launch.
 */
export function SectionImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  priority = false,
}: SectionImageProps) {
  if (!src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#e9e4df] text-line-strong/60 ${className}`}
        aria-label={alt}
        role="img"
      >
        <Icon name="image" className="text-4xl mb-2" />
        <span className="font-label-caps text-[10px] uppercase tracking-[0.2em]">
          Imagem em breve
        </span>
      </div>
    )
  }
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={priority}
      className={`w-full h-full object-cover ${imgClassName}`}
    />
  )
}
