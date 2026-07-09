import Link from 'next/link'
import Header from '../components/Header'
import COPTIC_SERVICES from '../data/copticServices'

export default function CopticServicesPage() {
  const service = COPTIC_SERVICES[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1d232e] via-[#2c3142] to-[#141922] text-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">St. Basil Liturgy</h1>
          <p className="mt-3 text-slate-200 max-w-3xl">
            Deep dive into the complete Coptic Divine Liturgy of St. Basil. Tap any step below to open the full liturgy details.
          </p>
        </div>

        <section className="rounded-3xl bg-white/5 border border-white/10 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-white">{service.title}</h2>
              <p className="mt-2 text-slate-300 max-w-2xl">{service.description}</p>
            </div>
            <Link
              href={`/coptic-services/${service.id}`}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900/90 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 border border-slate-700"
            >
              View Full St. Basil Liturgy
            </Link>
          </div>

          <div className="mt-10">
            <h3 className="text-2xl font-semibold text-white mb-4">St. Basil Full Liturgy Order</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {service.order.map((item, index) => (
                <Link
                  key={item.title}
                  href={`/coptic-services/${service.id}`}
                  className="block rounded-3xl bg-slate-900/80 p-5 border border-slate-700 transition hover:bg-slate-800"
                >
                  <p className="font-semibold text-white">{index + 1}. {item.title}</p>
                  <p className="text-slate-300 mt-2 text-sm leading-relaxed">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
