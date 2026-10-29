export default function TestimonialsSection() {
  return (
    <section id="opiniones" className="w-full bg-surface-container py-space-3xl px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest">Opiniones</span>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary uppercase tracking-tight mt-1">Experiencias de clientas</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Las opiniones se compartirán con autorización de sus autoras.</p>
        </div>
        <div className="mt-space-2xl border-y border-outline-variant/50 py-space-xl text-center">
          <p className="font-editorial text-3xl sm:text-4xl italic text-primary">Espacio reservado para opiniones autorizadas</p>
        </div>
      </div>
    </section>
  )
}
