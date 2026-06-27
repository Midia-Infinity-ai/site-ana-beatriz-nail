import { useEffect, useRef } from 'react'

/**
 * Replicates the IntersectionObserver fade-in used across the original
 * Stitch export: elements start hidden (opacity 0, translated down) and
 * animate into place once 10% of them enters the viewport.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Respect the original threshold of 0.1.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return ref
}
