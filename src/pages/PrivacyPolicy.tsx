import { Seo } from '../components/Seo'
import { CONTACT, mailHref } from '../lib/contact'

type Section = { title: string; body: React.ReactNode }

export function PrivacyPolicy() {
  const sections: Section[] = [
    {
      title: '1. Quem é a controladora dos seus dados',
      body: (
        <>
          {CONTACT.legalName} é a responsável pelo tratamento dos dados
          pessoais coletados neste site, em conformidade com a Lei Geral de Proteção de Dados
          (Lei nº 13.709/2018 — LGPD). Para qualquer questão relativa à privacidade, fale com
          a gente pelo e-mail{' '}
          <a href={mailHref('Privacidade')} className="text-antique-gold underline underline-offset-2">
            {CONTACT.email}
          </a>
          .
        </>
      ),
    },
    {
      title: '2. Quais dados coletamos',
      body: (
        <>
          <strong>Dados de agendamento:</strong> nome, contato e demais informações que você
          informa ao reservar um horário pelo nosso sistema de agendamento (Cal.com), exibido
          na seção final do site.
          <br />
          <strong>Foto do provador virtual:</strong> a imagem que você envia na ferramenta
          "Espelho do Futuro" para gerar a prévia das suas unhas.
          <br />
          <strong>Dados de navegação:</strong> informações anônimas de acesso (páginas
          visitadas e um identificador aleatório) usadas apenas para métricas internas, e,
          mediante o seu consentimento, dados de cookies de medição/marketing.
        </>
      ),
    },
    {
      title: '3. Como usamos a sua foto no provador virtual',
      body: (
        <>
          A foto enviada é utilizada exclusivamente para gerar, por inteligência artificial,
          uma prévia ultra-realista do resultado das unhas no estilo que você escolher. A
          imagem é processada para essa finalidade e a prévia é exibida apenas para você.
          Não publicamos a sua foto, não a usamos para identificar você e não a
          compartilhamos para fins de marketing.
        </>
      ),
    },
    {
      title: '4. Finalidades e base legal',
      body: (
        <>
          Tratamos os seus dados para responder à sua solicitação de horário e contato
          (execução de procedimentos preliminares a seu pedido), gerar a prévia do provador
          virtual (mediante o seu consentimento ao enviar a foto) e mensurar o desempenho do
          site (legítimo interesse para métricas anônimas e consentimento para cookies de
          marketing).
        </>
      ),
    },
    {
      title: '5. Compartilhamento com terceiros',
      body: (
        <>
          O agendamento de horários é operado pela plataforma Cal.com, que coleta e processa os
          dados que você informa ao reservar. A geração de imagem por IA é processada por
          provedores de tecnologia (OpenRouter e modelos Google Gemini), estritamente para
          produzir a sua prévia. Ferramentas de medição (como Meta e Google), quando ativadas,
          só são carregadas após o seu consentimento no banner de cookies. Não vendemos os seus
          dados pessoais.
        </>
      ),
    },
    {
      title: '6. Por quanto tempo guardamos',
      body: (
        <>
          Os dados de contato são mantidos enquanto necessários para o atendimento e a relação
          com você. As fotos do provador virtual não são retidas para outras finalidades além
          de gerar a prévia. Você pode solicitar a exclusão dos seus dados a qualquer momento.
        </>
      ),
    },
    {
      title: '7. Seus direitos',
      body: (
        <>
          Você pode confirmar a existência de tratamento, acessar, corrigir, anonimizar,
          eliminar ou solicitar a portabilidade dos seus dados, além de revogar o
          consentimento. Para exercer esses direitos, escreva para{' '}
          <a href={mailHref('Direitos do titular')} className="text-antique-gold underline underline-offset-2">
            {CONTACT.email}
          </a>
          .
        </>
      ),
    },
    {
      title: '8. Cookies',
      body: (
        <>
          Utilizamos cookies essenciais ao funcionamento do site e, mediante consentimento,
          cookies de medição e marketing. Você pode aceitar ou recusar pelo banner exibido na
          sua primeira visita.
        </>
      ),
    },
  ]

  return (
    <div className="bg-pearl-white text-onyx-black">
      <Seo
        title="Política de Privacidade | Ana Beatriz"
        description="Como a Ana Beatriz Nail Artistry trata os seus dados pessoais, incluindo a foto enviada ao provador virtual, em conformidade com a LGPD."
      />
      <div className="max-w-3xl mx-auto px-safe-margin-mobile md:px-safe-margin pt-40 pb-section-gap">
        <span className="font-label-caps text-label-caps text-antique-gold uppercase tracking-[0.2em] mb-4 block">
          LGPD
        </span>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-6">
          Política de Privacidade
        </h1>
        <p className="font-body-md text-body-md text-ink-soft mb-16">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}.
        </p>

        <div className="flex flex-col gap-12">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-headline-md text-2xl text-onyx-black mb-3">{s.title}</h2>
              <p className="font-body-lg text-body-lg text-ink-soft leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
