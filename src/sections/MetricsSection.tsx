export default function MetricsSection() {
  return (
    <section className="w-full bg-primary text-on-primary py-space-xl px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-gutter-desktop">
        <div className="flex flex-col items-start p-space-sm">
          <span className="font-headline-lg text-headline-lg text-secondary-fixed leading-none">+5</span>
          <span className="font-label-caps text-label-caps uppercase text-primary-fixed-dim mt-2 tracking-widest">Años de Trayectoria</span>
          <p className="font-body-sm text-body-sm text-on-primary-container mt-1">Especialización continua en Bogotá</p>
        </div>
        <div className="flex flex-col items-start p-space-sm">
          <span className="font-headline-lg text-headline-lg text-secondary-fixed leading-none">100%</span>
          <span className="font-label-caps text-label-caps uppercase text-primary-fixed-dim mt-2 tracking-widest">Cuidado Ocular</span>
          <p className="font-body-sm text-body-sm text-on-primary-container mt-1">Aislamiento y adhesivos hipoalergénicos</p>
        </div>
        <div className="flex flex-col items-start p-space-sm">
          <span className="font-headline-lg text-headline-lg text-secondary-fixed leading-none">Intl.</span>
          <span className="font-label-caps text-label-caps uppercase text-primary-fixed-dim mt-2 tracking-widest">Técnicas Globales</span>
          <p className="font-body-sm text-body-sm text-on-primary-container mt-1">Volumen ruso y visagismo eslavo</p>
        </div>
        <div className="flex flex-col items-start p-space-sm">
          <span className="font-headline-lg text-headline-lg text-secondary-fixed leading-none">0.02</span>
          <span className="font-label-caps text-label-caps uppercase text-primary-fixed-dim mt-2 tracking-widest">Protocolo Clean</span>
          <p className="font-body-sm text-body-sm text-on-primary-container mt-1">Bioseguridad y esterilización médica</p>
        </div>
      </div>
    </section>
  )
}
