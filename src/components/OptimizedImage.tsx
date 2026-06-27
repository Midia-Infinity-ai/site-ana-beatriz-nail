import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'

type OptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** Eager-load + high priority for above-the-fold hero images. */
  priority?: boolean
}

/**
 * Image with built-in performance defaults:
 * - lazy loading + async decoding (eager/high-priority for heroes)
 * - a soft fade-in once decoded, so images "develop" into place instead of
 *   popping in. The fade uses a CSS animation (not a transition) so it never
 *   clashes with hover transforms declared in the className.
 *
 * We also check `complete` on mount: a cached image can finish loading before
 * React attaches the onLoad handler, which would otherwise leave it stuck at
 * opacity 0.
 */
export function OptimizedImage({
  priority = false,
  className = '',
  onLoad,
  ...rest
}: OptimizedImageProps) {
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (ref.current?.complete) setLoaded(true)
  }, [])

  return (
    <img
      {...rest}
      ref={ref}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...(priority ? { fetchPriority: 'high' } : {})}
      onLoad={(event) => {
        setLoaded(true)
        onLoad?.(event)
      }}
      className={`${className} ${loaded ? 'img-fade-in' : 'opacity-0'}`}
    />
  )
}
