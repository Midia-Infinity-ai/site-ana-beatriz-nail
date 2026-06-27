import { Link } from 'react-router-dom'
import { SocialIcon } from './SocialIcon'
import { CONTACT, whatsappHref } from '../lib/contact'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full px-safe-margin-mobile md:px-safe-margin py-20 bg-surface-container-low/0 bg-[#f0eded] flex flex-col md:flex-row justify-between items-start gap-10 relative z-10">
      <div className="flex flex-col gap-4">
        <span className="font-headline-md text-headline-md text-onyx-black">Ana Beatriz</span>
        <p className="font-body-md text-body-md text-ink-soft max-w-xs">
          © {year} {CONTACT.legalName}. Todos os direitos reservados.
        </p>
      </div>

      <nav className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <a
          href={CONTACT.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body-md text-body-md text-ink-soft hover:text-onyx-black transition-colors inline-flex items-center gap-2"
        >
          <SocialIcon name="instagram" className="w-4 h-4" /> Instagram
        </a>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body-md text-body-md text-ink-soft hover:text-onyx-black transition-colors inline-flex items-center gap-2"
        >
          <SocialIcon name="whatsapp" className="w-4 h-4" /> WhatsApp
        </a>
        <Link
          to="/politica-de-privacidade"
          className="font-body-md text-body-md text-ink-soft hover:text-onyx-black transition-colors"
        >
          Privacidade
        </Link>
      </nav>
    </footer>
  )
}
