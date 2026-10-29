import { testimonials } from '../data/testimonials'

export default function TestimonialsSection() {
  return (
    <section id="contacto" className="w-full bg-surface-container py-space-3xl px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest">Testimonios</span>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-tight mt-1">Voces de Nuestras Clientas</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">La confianza de quienes visitan nuestro estudio en Bogota avala cada trazo, cada fibra y cada protocolo de cuidado.</p>
        </div>
        <div className="mt-space-2xl grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {testimonials.map((t) => (
            <article key={t.id} className="bg-surface-container-lowest p-space-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-md">
                  <div className="flex text-secondary">
                    {[1,2,3,4,5].map((n)=>(<span key={n} className="material-symbols-outlined text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>star</span>))}
                  </div>
                  <span className="font-label-caps text-[10px] uppercase text-on-surface-variant bg-surface-container px-2 py-0.5">Placeholder</span>
                </div>
                <p className="font-body-lg text-body-lg text-primary italic leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </div>
              <div className="mt-space-lg pt-space-md bg-surface-container-low p-space-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-secondary text-sm">{t.initials}</div>
                <div>
                  <h5 className="font-title-lg text-[15px] font-semibold text-primary leading-tight">{t.name}</h5>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{t.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-space-lg text-center">
          <span className="font-label-caps text-body-sm text-on-surface-variant uppercase tracking-wider">[Resenas en fase de validacion / placeholders]</span>
        </div>
      </div>
    </section>
  )
}
