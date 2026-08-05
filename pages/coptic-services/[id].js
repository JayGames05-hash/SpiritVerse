import { useRouter } from 'next/router'
import Header from '../../components/Header'
import COPTIC_SERVICES from '../../data/copticServices'

export default function CopticServiceDetail() {
  const router = useRouter()
  const { id } = router.query
  const service = COPTIC_SERVICES.find(item => item.id === id)

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
                  <a
                    key={index}
                    href={`#bookmark-${index}`}
                    className="block rounded-2xl bg-white/5 px-4 py-3 transition hover:bg-white/10"
                  >
                    <span className="font-semibold text-white">{index + 1}.</span> {bookmark.heading}
                  </a>
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

            <div className="space-y-6">
              {(service.bookmarks || []).map((bookmark, index) => (
                <section key={index} id={`bookmark-${index}`} className="rounded-3xl bg-slate-900/80 p-6 border border-slate-700">
                  <div className="mb-6">
                    <p className="text-slate-400 text-sm">Bookmark {index + 1}</p>
                    <h3 className="text-2xl font-semibold text-white mt-1">{bookmark.heading}</h3>
                    <p className="text-slate-300 mt-2 text-sm leading-relaxed">{bookmark.description}</p>
                  </div>
                  <div className="space-y-4">
                    {(bookmark.items || []).map((item, itemIndex) => (
                      <div key={itemIndex} className="rounded-2xl bg-white/5 p-4 border border-white/10">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-white">{itemIndex + 1}. {item.title}</p>
                            <p className="text-slate-400 mt-1 text-sm">{item.details}</p>
                          </div>
                          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-300">
                            Page {bookmark.page}
                          </span>
                        </div>
                        {item.text && (
                          <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm leading-7 text-slate-200">
                            {Array.isArray(item.text) ? item.text.map((line, lineIndex) => (
                              <p key={lineIndex} className="mb-3 last:mb-0">{line}</p>
                            )) : <p>{item.text}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
