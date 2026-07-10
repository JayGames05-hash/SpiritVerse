import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import COPTIC_SERVICES from '../../data/copticServices'

export default function CopticServiceDetail() {
  const router = useRouter()
  const { id } = router.query
  const service = COPTIC_SERVICES.find(item => item.id === id)
  const [activePage, setActivePage] = useState(7)

  useEffect(() => {
    if (service?.bookmarks?.[0]?.page) {
      setActivePage(service.bookmarks[0].page)
    }
  }, [service])

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1d232e] via-[#2c3142] to-[#141922] text-white">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className="rounded-3xl bg-white/5 border border-white/10 p-8">
            <h1 className="text-3xl font-semibold mb-4">Service not found</h1>
            <p className="text-slate-300">The requested Coptic service could not be found.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1d232e] via-[#2c3142] to-[#141922] text-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-3xl bg-white/5 border border-white/10 p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{service.category}</p>
              <h1 className="text-4xl font-bold mt-2">{service.title}</h1>
            </div>
            <div className="text-right">
              <p className="text-slate-300">{service.description}</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="rounded-3xl bg-slate-950/80 p-6 border border-slate-700">
              <h2 className="text-2xl font-semibold mb-4">Bookmarks</h2>
              <div className="space-y-2 text-slate-300 text-sm">
                {(service.bookmarks || []).map((bookmark, index) => (
                  <button
                    key={index}
                    onClick={() => setActivePage(bookmark.page || 7)}
                    className="block w-full text-left rounded-2xl bg-white/5 px-4 py-3 transition hover:bg-white/10"
                  >
                    <span className="font-semibold text-white">{index + 1}.</span> {bookmark.heading}
                  </button>
                ))}
              </div>
              <a
                href="/Rites_Liturgy_Full.pdf"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-500"
              >
                Open full PDF
              </a>
            </aside>

            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-900/80 p-4 border border-slate-700">
                <p className="text-slate-400 text-sm">Showing the actual liturgy PDF from the uploaded mass book.</p>
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-700 bg-white">
                  <iframe
                    key={activePage}
                    src={`/Rites_Liturgy_Full.pdf#page=${activePage}`}
                    className="h-[70vh] w-full"
                    title="St. Basil liturgy PDF"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
