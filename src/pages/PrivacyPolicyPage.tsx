import PageShell from '../components/layout/PageShell'
import {
  privacyPolicyIntro,
  privacyPolicySections,
  privacyPolicyUpdated,
  privacyPolicyVersion,
} from '../data/privacy'

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <article className="mx-auto w-full max-w-4xl px-margin py-space-3xl md:px-margin-tablet lg:px-margin-desktop">
        <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">Información legal</span>
        <h1 className="mt-space-sm max-w-3xl font-headline-lg text-headline-lg-mobile uppercase leading-tight tracking-tight text-primary md:text-headline-lg">
          Política de Privacidad y Tratamiento de Datos Personales
        </h1>
        <p className="mt-space-md font-body-sm text-body-sm text-on-surface-variant">
          Última actualización: {privacyPolicyUpdated} · Versión {privacyPolicyVersion}
        </p>
        <p className="mt-space-lg font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
          {privacyPolicyIntro}
        </p>

        <nav className="mt-space-2xl border-y border-surface-container py-space-lg" aria-label="Contenido de la política">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-primary">Contenido</p>
          <ol className="mt-space-sm grid grid-cols-1 gap-x-space-lg gap-y-2 sm:grid-cols-2">
            {privacyPolicySections.map((section) => (
              <li key={section.id}>
                <a
                  className="font-body-sm text-body-sm text-on-surface-variant underline decoration-secondary/30 underline-offset-2 transition-colors hover:text-primary"
                  href={`#${section.id}`}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-space-2xl space-y-space-2xl">
          {privacyPolicySections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="font-title-lg text-title-lg uppercase text-primary">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-space-sm font-body-md text-body-md leading-relaxed text-on-surface-variant">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="mt-space-sm list-disc space-y-2 pl-5 font-body-md text-body-md leading-relaxed text-on-surface-variant">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.paragraphsAfter?.map((paragraph) => (
                <p key={paragraph} className="mt-space-sm font-body-md text-body-md leading-relaxed text-on-surface-variant">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-space-2xl border-l-2 border-brand-pink bg-surface-container p-space-lg">
          <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
            Documento preliminar. La razón social y el NIT se incorporarán cuando estén disponibles. Esta política debe
            revisarse jurídicamente antes de su publicación definitiva.
          </p>
        </div>
      </article>
    </PageShell>
  )
}
