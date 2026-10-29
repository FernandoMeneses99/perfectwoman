export default function MetricsSection() {
  return (
    <section className="w-full bg-primary text-on-primary py-space-xl px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-gutter-desktop">
        <div className="flex flex-col items-start p-space-sm">
          <span className="font-headline-lg text-headline-lg text-brand-pink leading-none">+5</span>
          <span className="font-label-caps text-label-caps uppercase text-primary-fixed-dim mt-2 tracking-widest">Años de experiencia</span>
        </div>
        <div className="flex flex-col items-start p-space-sm">
          <span className="font-headline-lg text-headline-lg text-brand-pink leading-none">Bogotá</span>
          <span className="font-label-caps text-label-caps uppercase text-primary-fixed-dim mt-2 tracking-widest">Colombia</span>
        </div>
      </div>
    </section>
  )
}
