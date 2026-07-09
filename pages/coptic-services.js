import Link from 'next/link'
import Header from '../components/Header'
import COPTIC_SERVICES from '../data/copticServices'

export default function CopticServicesPage() {
  const grouped = COPTIC_SERVICES.reduce((acc, service) => {
    const category = service.category || 'Other'
    acc[category] = acc[category] || []
    acc[category].push(service)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1d232e] via-[#2c3142] to-[#141922] text-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Coptic Services</h1>
          <p className="mt-3 text-slate-200 max-w-3xl">Explore the main Coptic Orthodox liturgies, prayers, and Agpeya hours in one place. Tap a card to view the service details.</p>
        </div>

        <div className="space-y-10">
          {Object.entries(grouped).map(([category, services]) => (
            <section key={category} className="rounded-3xl bg-white/5 border border-white/10 p-6">
              <h2 className="text-2xl font-semibold mb-4">{category}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {services.map(service => (
                  <Link
                    key={service.id}
                    href={`/coptic-services/${service.id}`}
                    className="block rounded-3xl bg-slate-900/80 p-5 transition hover:bg-slate-900 border border-slate-700"
                  >
                    <h3 className="text-xl font-semibold text-white">{service.title}</h3>
                    <p className="mt-2 text-slate-300 text-sm leading-relaxed">{service.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
