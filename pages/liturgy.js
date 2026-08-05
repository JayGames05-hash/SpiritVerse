import Head from 'next/head'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import Header from '../components/Header'

const liturgySteps = [
  {
    icon: '🚪',
    title: '1. The Prayer at the Doors and Opening Rites',
    description:
      'The Divine Liturgy begins in prayerful stillness. The clergy prepare the altar and the faithful gather in reverence. This opening is meant to draw the people into a posture of repentance, gratitude, and readiness to worship God with sincerity.',
    notice:
      'Notice how the liturgy begins with stillness, reverence, and preparation before the main mystery of worship begins.',
    subparts: [
      {
        title: 'The Vigil and Preparation',
        detail:
          'Before the service formally begins, the clergy and servers prepare the altar, vessels, and sacred space. The faithful enter in a quiet atmosphere, often meditating on repentance and the need to receive grace. This is the first lesson in the liturgy: worship begins in the heart before it ever reaches the altar.',
      },
      {
        title: 'The Prayer at the Doors',
        detail:
          'The priest or deacon stands at the doors and invites the faithful to enter in prayer, often using the language of the Psalms and the Gospel. This reminds the Church that the Divine Liturgy is not a casual gathering but a sacred passage from ordinary life into the presence of God.',
      },
      {
        title: 'What the Opening Rites Communicate',
        detail:
          'The opening rites teach humility, readiness, and reverence. They break the ordinary rhythm of the day and call the people into the stream of prayer, confession, and thanksgiving that defines the whole service.',
      },
    ],
  },
  {
    icon: '📖',
    title: '2. The Psalms, Synaxarion, and Readings',
    description:
      'The Church then moves into a rhythm of psalms, scriptural readings, and the day’s commemorations. These readings teach the faithful what the feast or fast means in the life of the Church and reveal Christ in the Scriptures.',
    notice:
      'Notice that Scripture and psalmody shape the tone of the service long before the Eucharistic prayer begins.',
    subparts: [
      {
        title: 'The Psalms',
        detail:
          'Psalms have always formed the prayer life of the Church. They express joy, lament, repentance, thanksgiving, and trust. In the liturgy, the Psalms teach the people how to pray before God in every condition of life.',
      },
      {
        title: 'The Synaxarion',
        detail:
          'The Synaxarion recalls the Saint or event commemorated that day. It connects the worshiper to the life of the Church across time, showing that worship is not isolated from the saints and the teachings of the apostolic tradition.',
      },
      {
        title: 'Why the Readings Matter',
        detail:
          'Scripture is not an optional supplement to worship; it is the spiritual food of the faithful. The readings invite the congregation into the story of salvation and help them see how the feast or fast fits into the Church’s whole life.',
      },
    ],
  },
  {
    icon: '✨',
    title: '3. The Gospel and the Sermon',
    description:
      'The Gospel is proclaimed as the central proclamation of Christ’s life, death, and resurrection. In many services, the priest or deacon then explains the reading so the congregation can understand its spiritual meaning and apply it to daily life.',
    notice:
      'Notice how the Gospel stands at the center of the service, giving the faithful the voice of Christ Himself.',
    subparts: [
      {
        title: 'The Gospel Procession',
        detail:
          'The Gospel is carried forward with reverence, often accompanied by the joining of all the faithful in hearing the Word of God. This signifies that the proclamation of Christ is the center of the liturgy and the life of the Church.',
      },
      {
        title: 'The Sermon',
        detail:
          'The sermon is not merely informational; it helps the people understand what the Scriptures mean spiritually and practically. It is meant to guide the mind toward repentance, obedience, and deeper faith.',
      },
      {
        title: 'What the Gospel Calls Us To',
        detail:
          'By hearing the Gospel, the faithful are invited to imitate Christ, receive His mercy, and live according to the kingdom of God. The word of God is meant to form the believer’s life, not simply enrich his knowledge.',
      },
    ],
  },
  {
    icon: '🕊️',
    title: '4. The Creed',
    description:
      'The faithful confess the Church’s faith in one God, the Father, Son, and Holy Spirit; in the incarnation, crucifixion, resurrection, and the life to come. This is the public profession of what the whole assembly believes together.',
    notice:
      'Notice that the Creed gathers the whole congregation into one common confession of faith.',
    subparts: [
      {
        title: 'The Creed as Public Confession',
        detail:
          'The Creed is a common declaration of faith that binds the faithful together in one doctrinal witness. It reveals that worship is not private feeling alone; it is corporate confession grounded in apostolic teaching.',
      },
      {
        title: 'The Incarnation and Resurrection',
        detail:
          'The Creed names the central events of salvation history: Christ’s incarnation, death, and resurrection. These are not separate ideas but the single work of God’s grace in Christ for the world.',
      },
      {
        title: 'Why the Believers Say It Together',
        detail:
          'When the congregation recites the Creed, it witnesses to the same faith that the saints and martyrs have held across history. This strengthens unity and reminds the faithful that they belong to one body of believers.',
      },
    ],
  },
  {
    icon: '🙏',
    title: '5. The Prayer of the Faithful',
    description:
      'The congregation brings before God the needs of the Church, the world, the sick, the poor, and all who are seeking mercy. This prayer shows that the liturgy is not only worship, but also intercession and compassion.',
    notice:
      'Notice how worship expands from personal prayer into the shared intercession of the whole Church.',
    subparts: [
      {
        title: 'Intercession for the Church',
        detail:
          'The Church remembers the needs of the clergy, the bishops, the faithful, and the broader body of Christians. The prayer of the faithful reminds us that worship is never isolated from the life of the community.',
      },
      {
        title: 'Intercession for the World',
        detail:
          'The liturgy lifts up the needs of the world, asking God for peace, protection, and moral transformation. This aspect of worship reveals that the Church is always praying for society, not only for its own internal life.',
      },
      {
        title: 'Compassion and Mercy',
        detail:
          'This prayer invites the faithful to be moved by the suffering of others. In the holy gathering, everyone is taught to pray with compassion and to place their own needs, and the needs of others, before God.',
      },
    ],
  },
  {
    icon: '🍞',
    title: '6. The Great Entrance and Offertory',
    description:
      'Bread and wine are brought forward in the offertory. This act expresses the offering of the whole life of the Church to God. The faithful entrust their prayers, thanksgiving, and hopes to Christ through the sacred gifts.',
    notice:
      'Notice how the gifts are carried forward as a sign that the Church offers its life, gratitude, and prayers to God.',
    subparts: [
      {
        title: 'The Great Entrance',
        detail:
          'The Great Entrance is a visible procession of the gifts to the altar, expressing the offer of the whole Church to Christ. It serves as a sacred movement from the world to the altar, as though the faithful are bringing their lives and prayers to God.',
      },
      {
        title: 'The Bread and Wine',
        detail:
          'The bread and wine symbolize the created world and the human life that are surrendered to God through Christ. In the Eucharistic mystery, these gifts are transformed and made holy for the life of the faithful.',
      },
      {
        title: 'Offertory as Union',
        detail:
          'The offertory is more than a symbolic gesture. It expresses the Christian conviction that worship is the offering of one’s life, work, and gratitude to God in union with Christ.',
      },
    ],
  },
  {
    icon: '🔥',
    title: '7. The Eucharistic Prayer of Saint Basil',
    description:
      'This is the heart of the service. The priest gives thanks, recalls the saving acts of Christ, and lifts up the bread and wine in the Name of the Lord. The congregation responds with “Amen,” joining in the mystery of Christ’s holy sacrifice and real presence.',
    notice:
      'Notice that this is the central mystery of the liturgy, where thanksgiving, remembrance, and sacrifice meet.',
    subparts: [
      {
        title: 'Thanksgiving',
        detail:
          'The Eucharistic Prayer begins with thanksgiving. The Church does not come to God empty-handed; it brings gratitude for creation, redemption, and the gift of Christ’s presence among His people.',
      },
      {
        title: 'The Memorial of Christ',
        detail:
          'The priest recalls Christ’s life, Passion, Resurrection, and Ascension. This remembrance is not merely a mental replay but a sacramental participation in the mystery of salvation.',
      },
      {
        title: 'The Holy Amen',
        detail:
          'The congregation’s response of “Amen” is a sign of full assent and participation. It is the Church saying, “We believe, we receive, and we unite ourselves to this mystery.”',
      },
    ],
  },
  {
    icon: '🧎',
    title: '8. The Lord’s Prayer',
    description:
      'The Church prays the Lord’s Prayer together, emphasizing God’s kingdom, daily bread, forgiveness, and deliverance from evil. It is the prayer of the whole assembly and the prayer that unites the faithful in one heart.',
    notice:
      'Notice how the Lord’s Prayer gathers the whole congregation into one common voice of trust and dependence on God.',
    subparts: [
      {
        title: 'The Kingdom of God',
        detail:
          'The prayer begins with God’s kingdom, reminding the faithful that worship is centered not on the self but on the reign of God in the world and in the heart.',
      },
      {
        title: 'Daily Bread',
        detail:
          'The request for “daily bread” is both physical and spiritual. It expresses dependence on God for all things, including the life of grace that sustains the soul.',
      },
      {
        title: 'Forgiveness and Deliverance',
        detail:
          'The prayer also asks for forgiveness and protection from evil. It shows how worship becomes a training ground for holiness, mercy, and resistance to sin.',
      },
    ],
  },
  {
    icon: '🍽️',
    title: '9. Holy Communion',
    description:
      'The faithful who are prepared receive the Body and Blood of Christ. Communion is the living participation in the life of Christ, uniting the Church in one body and nourishing the soul for the journey of holiness.',
    notice:
      'Notice that Communion is not an ending point but the living participation of the faithful in Christ Himself.',
    subparts: [
      {
        title: 'Preparation and Worthiness',
        detail:
          'Communion is approached with reverence, repentance, and prayer. The Church teaches that Holy Communion is a gift of grace, but it requires a life of repentance and faithfulness.',
      },
      {
        title: 'The Real Presence',
        detail:
          'In the Coptic tradition, the faithful believe that the bread and wine become the very Body and Blood of Christ. This mystery is at the heart of the liturgy and the center of Christian worship.',
      },
      {
        title: 'Life in Christ',
        detail:
          'Holy Communion is not a static symbol; it is a way of entering more deeply into Christ’s life, becoming one body with Him, and being strengthened for daily discipleship.',
      },
    ],
  },
  {
    icon: '🌅',
    title: '10. Dismissal and Benediction',
    description:
      'The service concludes with the blessing of the people and the sending forth of the congregation. The faithful are sent to live the liturgy in their homes, workplaces, and daily relationships.',
    notice:
      'Notice how the liturgy ends with a blessing that sends the faithful back into the world to live out what they have received.',
    subparts: [
      {
        title: 'The Blessing',
        detail:
          'The blessing marks the end of the service but also the beginning of Christian living after worship. The faithful are sent with the peace of Christ into the world.',
      },
      {
        title: 'The Dismissal',
        detail:
          'The dismissal reminds the congregation that the worship service is not complete in itself but continues through the life of the Church in daily action, prayer, and witness.',
      },
      {
        title: 'Living the Liturgy',
        detail:
          'The final blessing teaches that the liturgy is meant to shape how believers work, love, serve, and pray beyond the church walls.',
      },
    ],
  },
]

const keyIdeas = [
  'The Divine Liturgy is the Church’s central worship service and the primary place where the faithful gather in prayer.',
  'It is a full movement from Scripture and psalmody to thanksgiving, offering, consecration, communion, and dismissal.',
  'St. Basil’s Liturgy emphasizes the mystery of Christ’s sacrifice, the holiness of the Eucharist, and the unity of the Church.',
  'The liturgy is meant to shape the believer’s life, not just fill the mind with information.',
]

export default function LiturgyPage() {
  const [openSection, setOpenSection] = useState(liturgySteps[0].title)
  const [openSubpart, setOpenSubpart] = useState(liturgySteps[0].subparts[0].title)

  const activeStep = useMemo(
    () => liturgySteps.find((step) => step.title === openSection) ?? liturgySteps[0],
    [openSection],
  )

  const handleSectionClick = (title) => {
    setOpenSection(title)
    const nextStep = liturgySteps.find((step) => step.title === title)
    if (nextStep?.subparts?.[0]) {
      setOpenSubpart(nextStep.subparts[0].title)
    }
  }

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

          <div className="mb-6 flex flex-wrap gap-2">
            {liturgySteps.map((step) => {
              const isActive = step.title === openSection

              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => handleSectionClick(step.title)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[#6c1d18] text-[#fff6ea] shadow-lg'
                      : 'border border-[#d4b58b] bg-white/80 text-[#5b1a18] hover:bg-[#f8ead8]'
                  }`}
                >
                  {step.title.split('. ')[0]}
                </button>
              )
            })}
          </div>

          <article className="rounded-[26px] border border-[#d8b98b]/80 bg-[#fff8f0]/90 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6c1d18] text-2xl text-[#fff6ea] shadow-sm">
                {activeStep.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#6a1a16]">{activeStep.title}</h2>
                <p className="mt-1 text-sm font-medium uppercase tracking-[0.25em] text-[#7b4a3a]">What to notice</p>
              </div>
            </div>
            <p className="mt-3 text-lg leading-8 text-[#58372f]">{activeStep.description}</p>
            <div className="mt-4 rounded-2xl bg-[#fdf3e3] p-4 text-[#5b1a18] border border-[#e4be85]">
              <p className="text-base leading-7"><span className="font-bold">Mini summary:</span> {activeStep.notice}</p>
            </div>

            <div className="mt-6 space-y-3">
              {activeStep.subparts.map((subpart) => {
                const isExpanded = openSubpart === subpart.title

                return (
                  <div key={subpart.title} className="rounded-2xl border border-[#ddb47d]/80 bg-white/80 p-4">
                    <button
                      type="button"
                      onClick={() => setOpenSubpart(isExpanded ? '' : subpart.title)}
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <span className="text-lg font-semibold text-[#6a1a16]">{subpart.title}</span>
                      <span className="flex items-center gap-2 text-sm text-[#7b4a3a]">
                        <span className={`inline-block transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>⌄</span>
                        {isExpanded ? 'Hide' : 'Show more'}
                      </span>
                    </button>
                    <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <p className="text-base leading-7 text-[#50302a]">{subpart.detail}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </article>

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
