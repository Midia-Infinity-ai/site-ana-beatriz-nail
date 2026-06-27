/**
 * Central business contact data — single source of truth.
 */
export const CONTACT = {
  brand: 'Ana Beatriz',
  legalName: 'Ana Beatriz Nail Artistry',
  whatsappNumber: '5561994303143', // DDI 55 + DDD 61 + número, só dígitos
  whatsappMessage: 'Olá, Ana Beatriz! Gostaria de reservar um momento e solicitar um horário.',
  email: 'contato@anabeatriznail.com.br',
  hours: 'Ter a Sáb, 9h às 19h (com hora marcada)',
  social: {
    instagram: 'https://instagram.com/_anabeatriz.nail',
  },
} as const

/** Build a wa.me deep link with a prefilled message. */
export function whatsappHref(message: string = CONTACT.whatsappMessage): string {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`
}

/** Build a mailto link with an optional subject. */
export function mailHref(subject = 'Reserva de horário'): string {
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}`
}
