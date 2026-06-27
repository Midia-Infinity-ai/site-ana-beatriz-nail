import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

type RevealProps = {
  children: ReactNode
  className?: string
  as?: ElementType
  id?: string
  /** Stagger delay in milliseconds. */
  delay?: number
  style?: CSSProperties
}

/**
 * Wraps content in a scroll-triggered editorial reveal (fade + rise). Adds the
 * `is-visible` class once the element enters the viewport (see useScrollReveal).
 */
export function Reveal({
  children,
  className = '',
  as: Tag = 'div',
  id,
  delay = 0,
  style,
}: RevealProps) {
  const ref = useScrollReveal<HTMLElement>()
  return (
    <Tag
      ref={ref}
      id={id}
      className={`editorial-reveal ${className}`}
      style={{ ...style, ['--reveal-delay' as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
