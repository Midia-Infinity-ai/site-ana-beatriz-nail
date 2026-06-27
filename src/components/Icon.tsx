import type { CSSProperties } from 'react'

type IconProps = {
  name: string
  className?: string
  /** When true, renders the filled variant of the Material Symbol. */
  filled?: boolean
  style?: CSSProperties
}

/**
 * Thin wrapper around the Material Symbols Outlined icon font so usage
 * stays declarative across pages.
 */
export function Icon({ name, className = '', filled = false, style }: IconProps) {
  const fillStyle: CSSProperties = filled
    ? { fontVariationSettings: "'FILL' 1" }
    : {}
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ ...fillStyle, ...style }}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
