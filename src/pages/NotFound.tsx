import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 bg-pearl-white">
      <span className="font-display-xl text-[120px] leading-none text-antique-gold/30">404</span>
      <h1 className="font-headline-md text-headline-md text-onyx-black mt-4 mb-4">
        Esta página não foi encontrada.
      </h1>
      <p className="font-body-lg text-body-lg text-ink-soft max-w-md mb-10">
        O endereço que você procura não existe ou foi movido. Vamos voltar ao começo.
      </p>
      <Link
        to="/"
        className="border border-onyx-black text-onyx-black px-10 py-4 font-label-caps text-[11px] uppercase tracking-[0.2em] hover:bg-onyx-black hover:text-pearl-white transition-colors"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
