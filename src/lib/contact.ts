/**
 * Central business contact data. These are placeholders until the real
 * briefing is provided; update here (single source of truth) before launch.
 */
export const CONTACT = {
  brand: 'Ana Beatriz',
  legalName: 'Ana Beatriz Nail Artistry',
  whatsappNumber: '5500000000000', // DDI 55 + DDD + número, só dígitos
  whatsappMessage: 'Olá, Ana Beatriz! Gostaria de reservar um momento e solicitar um horário.',
  email: 'contato@anabeatriznail.com.br',
  cnpj: '00.000.000/0001-00',
  address: 'A definir',
  hours: 'Ter a Sáb, 9h às 19h (com hora marcada)',
  social: {
    instagram: 'https://instagram.com/',
    pinterest: 'https://br.pinterest.com/',
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
