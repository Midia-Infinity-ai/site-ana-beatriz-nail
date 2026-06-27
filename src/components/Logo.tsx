type LogoProps = {
  className?: string
  title?: string
}

/**
 * Ana Beatriz wordmark. Text-based (EB Garamond) so it inherits the current
 * text color and scales cleanly. `className` is applied to the wrapper for
 * layout (the admin sidebar passes sizing/centering utilities).
 */
export function Logo({ className = '', title = 'Ana Beatriz' }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center font-headline-md text-2xl leading-none tracking-tight ${className}`}
      role="img"
      aria-label={title}
    >
      Ana Beatriz
    </span>
  )
}
