import { Seo } from '../components/Seo'
import { Hero } from '../components/sections/Hero'
import { Criadora } from '../components/sections/Criadora'
import { Sensorial } from '../components/sections/Sensorial'
import { Services } from '../components/sections/Services'
import { BeforeAfter } from '../components/sections/BeforeAfter'
import { AiMirror } from '../components/sections/AiMirror'
import { ContactSection } from '../components/sections/ContactSection'

export function Home() {
  return (
    <>
      <Seo
        title="Ana Beatriz | Nail Artistry"
        description="A arte de se amar através do detalhe. Nail design autoral, uma experiência sensorial de cuidado e um provador virtual que mostra a sua arte antes mesmo de chegar."
      />
      <Hero />
      <Criadora />
      <Sensorial />
      <Services />
      <BeforeAfter />
      <AiMirror />
      <ContactSection />
    </>
  )
}
