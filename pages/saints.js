import saints from '../data/saints'
import Header from '../components/Header'

const getEntryType = (entry) => {
  if (entry.id.startsWith('fast-')) return 'fast'
  if (entry.id.startsWith('feast-')) return 'feast'
  return 'saint'
}

const entryStyles = {
  fast: {
    border: 'border-cyan-200',
    badge: 'bg-cyan-100 text-cyan-900',
  },
  feast: {
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-900',
  },
  saint: {
    border: 'border-[#c89f5d]',
    badge: 'bg-[#f7e8d5] text-[#7a4a35]',
  },
}

export default function SaintsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
      <Header />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#4b2d23] mb-4">Saints & Feasts</h1>
          <p className="text-gray-600">Explore a curated list of saints, feast days, and notes for daily reflection.</p>
        </div>

        <div className="grid gap-6">
          {saints.map((saint) => {
            const type = getEntryType(saint)
            const styles = entryStyles[type]
            return (
              <div key={saint.id} className={`bg-white rounded-3xl shadow-xl p-6 border ${styles.border}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#4b2d23]">{saint.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <p className="text-sm text-gray-500">Feast Day: {saint.feast_date}</p>
                      {(type === 'fast' || type === 'feast') && (
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}>
                          {type === 'fast' ? 'Fast' : 'Feast'}
                        </span>
                      )}
                    </div>
                    {saint.scripture_ref && <p className="text-sm text-gray-500">Scripture: {saint.scripture_ref}</p>}
                  </div>
                </div>
                <div className="mt-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
                  <p>{saint.note}</p>
                  {saint.reflection && <p className="mt-3 italic text-gray-600">{saint.reflection}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
