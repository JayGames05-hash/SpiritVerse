import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'

const liturgySteps = [
  {
    title: '1. The Prayer at the Doors and Opening Rites',
    description:
      'The Divine Liturgy begins in prayerful stillness. The clergy prepare the altar and the faithful gather in reverence. This opening is meant to draw the people into a posture of repentance, gratitude, and readiness to worship God with sincerity.',
  },
  {
    title: '2. The Psalms, Synaxarion, and Readings',
    description:
      'The Church then moves into a rhythm of psalms, scriptural readings, and the day’s commemorations. These readings teach the faithful what the feast or fast means in the life of the Church and reveal Christ in the Scriptures.',
  },
  {
    title: '3. The Gospel and the Sermon',
    description:
      'The Gospel is proclaimed as the central proclamation of Christ’s life, death, and resurrection. In many services, the priest or deacon then explains the reading so the congregation can understand its spiritual meaning and apply it to daily life.',
  },
  {
    title: '4. The Creed',
    description:
      'The faithful confess the Church’s faith in one God, the Father, Son, and Holy Spirit; in the incarnation, crucifixion, resurrection, and the life to come. This is the public profession of what the whole assembly believes together.',
  },
  {
    title: '5. The Prayer of the Faithful',
    description:
      'The congregation brings before God the needs of the Church, the world, the sick, the poor, and all who are seeking mercy. This prayer shows that the liturgy is not only worship, but also intercession and compassion.',
  },
  {
    title: '6. The Great Entrance and Offertory',
    description:
      'Bread and wine are brought forward in the offertory. This act expresses the offering of the whole life of the Church to God. The faithful entrust their prayers, thanksgiving, and hopes to Christ through the sacred gifts.',
  },
  {
    title: '7. The Eucharistic Prayer of Saint Basil',
    description:
      'This is the heart of the service. The priest gives thanks, recalls the saving acts of Christ, and lifts up the bread and wine in the Name of the Lord. The congregation responds with “Amen,” joining in the mystery of Christ’s holy sacrifice and real presence.',
  },
  {
    title: '8. The Lord’s Prayer',
    description:
      'The Church prays the Lord’s Prayer together, emphasizing God’s kingdom, daily bread, forgiveness, and deliverance from evil. It is the prayer of the whole assembly and the prayer that unites the faithful in one heart.',
  },
  {
    title: '9. Holy Communion',
    description:
      'The faithful who are prepared receive the Body and Blood of Christ. Communion is the living participation in the life of Christ, uniting the Church in one body and nourishing the soul for the journey of holiness.',
  },
  {
    title: '10. Dismissal and Benediction',
    description:
      'The service concludes with the blessing of the people and the sending forth of the congregation. The faithful are sent to live the liturgy in their homes, workplaces, and daily relationships.',
  },
]

const keyIdeas = [
  'The Divine Liturgy is the Church’s central worship service and the primary place where the faithful gather in prayer.',
  'It is a full movement from Scripture and psalmody to thanksgiving, offering, consecration, communion, and dismissal.',
  'St. Basil’s Liturgy emphasizes the mystery of Christ’s sacrifice, the holiness of the Eucharist, and the unity of the Church.',
  'The liturgy is meant to shape the believer’s life, not just fill the mind with information.',
]

export default function LiturgyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
      <Head>
        <title>Coptic Liturgy Explained</title>
        <meta
          name="description"
          content="A simple overview of the structure and meaning of the Coptic Divine Liturgy."
        />
      </Head>

      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <section className="church-panel rounded-[28px] p-5 sm:p-8 md:p-10">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-[#7c4a40]">Coptic Worship</p>
            <h1 className="church-title mt-4 text-4xl sm:text-5xl text-[#5b1a18] font-bold">The Divine Liturgy Explained</h1>
            <p className="mt-4 text-lg text-[#5a4035] max-w-3xl mx-auto">
              This page offers a simple explanation of the structure of the Coptic Divine Liturgy, especially the order associated with St. Basil. It is meant to help readers understand the flow of worship, prayer, Scripture, and sacramental life in the Church.
            </p>
            <p className="mt-3 text-sm text-[#6d4e43] max-w-3xl mx-auto">
              Reference: <a href="https://www.copticchurch.net/pdf/liturgy/liturgy_of_st_basil.pdf" target="_blank" rel="noreferrer" className="underline">The Liturgy of Saint Basil</a>
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {keyIdeas.map((idea) => (
              <div key={idea} className="rounded-2xl border border-[#d1b282]/70 bg-white/75 p-4 text-[#50302a]">
                <p className="text-base leading-7">{idea}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {liturgySteps.map((step) => (
              <article
                key={step.title}
                className="rounded-2xl border border-[#d8b98b]/80 bg-[#fff8f0]/80 p-5 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-[#6a1a16]">{step.title}</h2>
                <p className="mt-2 text-lg leading-8 text-[#58372f]">{step.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-[#6c1d18] p-5 text-[#f8eee1]">
            <h2 className="text-2xl font-bold">Why it matters</h2>
            <p className="mt-2 text-lg leading-8">
              The Coptic liturgy is not only a ceremony; it is a living participation in the mystery of Christ.
              Through prayer, Scripture, and communion, the faithful are formed in holiness, unity, and love.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="church-button inline-flex rounded-full px-5 py-3 font-semibold">
              Back to Home
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
