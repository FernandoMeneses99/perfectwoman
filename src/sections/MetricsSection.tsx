import { useSiteContent } from '../lib/siteContentContext'

export default function MetricsSection() {
  const { content } = useSiteContent()

  return (
    <section className="w-full bg-primary text-on-primary py-space-xl px-margin md:px-margin-tablet lg:px-margin-desktop">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-gutter-desktop">
        {content.metrics.map((metric) => (
          <div className="flex flex-col items-start p-space-sm" key={`${metric.value}-${metric.label}`}>
            <span className="font-headline-lg text-headline-lg text-brand-pink leading-none">{metric.value}</span>
            <span className="font-label-caps text-label-caps uppercase text-primary-fixed-dim mt-2 tracking-widest">{metric.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
