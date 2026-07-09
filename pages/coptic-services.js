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
            Deep dive into the full Coptic Divine Liturgy of St. Basil. This page focuses exclusively on the St. Basil order, prayers, and structure.
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
              View St. Basil Order
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950/70 border border-slate-700 p-5">
              <h3 className="text-xl font-semibold text-white">Full Order</h3>
              <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                The full St. Basil liturgy order is rendered in detail on the service page. It includes the Offeratory, Liturgy of the Faithful, Communion, and Thanksgiving.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-950/70 border border-slate-700 p-5">
              <h3 className="text-xl font-semibold text-white">Focused Content</h3>
              <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                This app no longer includes other Coptic liturgies or Agpeya hours. The experience is narrowed to St. Basil only, as requested.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
