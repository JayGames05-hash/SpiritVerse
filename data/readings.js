const baseReadings = [
  {
    scripture_ref: 'John 3:16',
    title: 'For God so loved the world',
    reading_text: `For God so loved the world that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.`,
    reflection: `This short reflection invites us to rest in God\'s love and carry compassion into the world.`
  },
  {
    scripture_ref: 'Psalm 23:1',
    title: 'The Lord is my shepherd',
    reading_text: `The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters.`,
    reflection: `Let this verse remind you that rest and guidance are gifts from the shepherd who cares for every step you take.`
  },
  {
    scripture_ref: 'Philippians 4:13',
    title: 'Strength in Christ',
    reading_text: `I can do all things through Christ which strengtheneth me.`,
    reflection: `When the day feels hard, remember that your strength comes from a source greater than yourself.`
  },
  {
    scripture_ref: 'Matthew 5:14',
    title: 'You are the light',
    reading_text: `Ye are the light of the world. A city that is set on an hill cannot be hid.`,
    reflection: `This verse encourages you to shine your faith openly and let God\'s love be visible to everyone around you.`
  },
  {
    scripture_ref: 'Romans 12:12',
    title: 'Be patient in tribulation',
    reading_text: `Rejoicing in hope; patient in tribulation; continuing instant in prayer.`,
    reflection: `Hold on to hope in hard times, stay patient, and remain faithful through prayer.`
  },
  {
    scripture_ref: 'Proverbs 3:5',
    title: 'Trust in the Lord',
    reading_text: `Trust in the Lord with all thine heart; and lean not unto thine own understanding.`,
    reflection: `When the path is unclear, lean on God rather than your own understanding.`
  },
  {
    scripture_ref: 'Isaiah 41:10',
    title: 'Do not fear',
    reading_text: `Fear thou not; for I am with thee: be not dismayed; for I am thy God.`,
    reflection: `Courage comes from knowing that God is with you through every trial.`
  },
  {
    scripture_ref: 'James 1:5',
    title: 'Ask for wisdom',
    reading_text: `If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not.`,
    reflection: `Wisdom is given freely to those who ask with humility.`
  },
  {
    scripture_ref: 'Psalm 119:105',
    title: 'A light to your path',
    reading_text: `Thy word is a lamp unto my feet, and a light unto my path.`,
    reflection: `God\'s word guides you through life\'s darkest moments.`
  },
  {
    scripture_ref: 'Matthew 11:28',
    title: 'Rest for the weary',
    reading_text: `Come unto me, all ye that labour and are heavy laden, and I will give you rest.`,
    reflection: `There is rest available when you bring your burdens to Jesus.`
  }
]

const readings = Array.from({ length: 3000 }, (_, index) => {
  const base = baseReadings[index % baseReadings.length]
  const date = new Date(2026, 5, 10 + Math.floor(index / baseReadings.length))
  return {
    id: `post-${String(index + 1).padStart(4, '0')}`,
    date: date.toISOString().slice(0, 10),
    scripture_ref: base.scripture_ref,
    title: base.title,
    reading_text: base.reading_text,
    reflection: base.reflection,
  }
})

export default readings
