import { CalEmbed } from '../CalEmbed'

export function ContactSection() {
  return (
    <section
      id="agendar"
      data-nav-theme="dark"
      className="py-section-gap px-safe-margin-mobile md:px-safe-margin bg-deep-burgundy text-pearl-white relative scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-gutter items-start">
        <div className="flex flex-col lg:sticky lg:top-32">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-8">
            Sua experiência de luxo começa aqui.
          </h2>
          <p className="font-body-lg text-body-lg text-pearl-white/80 mb-8 max-w-md">
            Reserve seu momento e permita-se ser cuidada com a exclusividade que você merece.
          </p>
          <p className="font-body-md text-body-md text-pearl-white/60 max-w-md">
            Escolha o melhor dia e horário diretamente na agenda ao lado. A confirmação é
            instantânea.
          </p>
        </div>

        {/* Cal.com inline scheduling */}
        <div className="bg-pearl-white text-onyx-black p-3 md:p-5 layer-depth-1">
          <CalEmbed />
        </div>
      </div>
    </section>
  )
}
