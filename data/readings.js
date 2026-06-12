const books = [
  { name: 'Genesis', chapters: 50 },
  { name: 'Exodus', chapters: 40 },
  { name: 'Leviticus', chapters: 27 },
  { name: 'Numbers', chapters: 36 },
  { name: 'Deuteronomy', chapters: 34 },
  { name: 'Joshua', chapters: 24 },
  { name: 'Judges', chapters: 21 },
  { name: 'Ruth', chapters: 4 },
  { name: '1 Samuel', chapters: 31 },
  { name: '2 Samuel', chapters: 24 },
  { name: '1 Kings', chapters: 22 },
  { name: '2 Kings', chapters: 25 },
  { name: '1 Chronicles', chapters: 29 },
  { name: '2 Chronicles', chapters: 36 },
  { name: 'Ezra', chapters: 10 },
  { name: 'Nehemiah', chapters: 13 },
  { name: 'Esther', chapters: 10 },
  { name: 'Job', chapters: 42 },
  { name: 'Psalm', chapters: 150 },
  { name: 'Proverbs', chapters: 31 },
  { name: 'Ecclesiastes', chapters: 12 },
  { name: 'Song of Solomon', chapters: 8 },
  { name: 'Isaiah', chapters: 66 },
  { name: 'Jeremiah', chapters: 52 },
  { name: 'Lamentations', chapters: 5 },
  { name: 'Ezekiel', chapters: 48 },
  { name: 'Daniel', chapters: 12 },
  { name: 'Hosea', chapters: 14 },
  { name: 'Joel', chapters: 3 },
  { name: 'Amos', chapters: 9 },
  { name: 'Obadiah', chapters: 1 },
  { name: 'Jonah', chapters: 4 },
  { name: 'Micah', chapters: 7 },
  { name: 'Nahum', chapters: 3 },
  { name: 'Habakkuk', chapters: 3 },
  { name: 'Zephaniah', chapters: 3 },
  { name: 'Haggai', chapters: 2 },
  { name: 'Zechariah', chapters: 14 },
  { name: 'Malachi', chapters: 4 },
  { name: 'Matthew', chapters: 28 },
  { name: 'Mark', chapters: 16 },
  { name: 'Luke', chapters: 24 },
  { name: 'John', chapters: 21 },
  { name: 'Acts', chapters: 28 },
  { name: 'Romans', chapters: 16 },
  { name: '1 Corinthians', chapters: 16 },
  { name: '2 Corinthians', chapters: 13 },
  { name: 'Galatians', chapters: 6 },
  { name: 'Ephesians', chapters: 6 },
  { name: 'Philippians', chapters: 4 },
  { name: 'Colossians', chapters: 4 },
  { name: '1 Thessalonians', chapters: 5 },
  { name: '2 Thessalonians', chapters: 3 },
  { name: '1 Timothy', chapters: 6 },
  { name: '2 Timothy', chapters: 4 },
  { name: 'Titus', chapters: 3 },
  { name: 'Philemon', chapters: 1 },
  { name: 'Hebrews', chapters: 13 },
  { name: 'James', chapters: 5 },
  { name: '1 Peter', chapters: 5 },
  { name: '2 Peter', chapters: 3 },
  { name: '1 John', chapters: 5 },
  { name: '2 John', chapters: 1 },
  { name: '3 John', chapters: 1 },
  { name: 'Jude', chapters: 1 },
  { name: 'Revelation', chapters: 22 },
]

const themes = [
  'Grace',
  'Hope',
  'Faith',
  'Peace',
  'Forgiveness',
  'Strength',
  'Joy',
  'Mercy',
  'Wisdom',
  'Patience',
  'Love',
  'Trust',
  'Courage',
  'Rest',
  'Light',
  'Truth',
  'Kindness',
  'Humility',
  'Prayer',
  'Comfort',
]

const actions = [
  'trust in God',
  'seek peace',
  'walk in faith',
  'remain steadfast',
  'share love',
  'choose hope',
  'pray without ceasing',
  'extend mercy',
  'receive grace',
  'keep your heart humble',
  'rest in the Lord',
  'shine your light',
  'grow in patience',
  'live with courage',
  'hold fast to truth',
  'embrace forgiveness',
  'serve with joy',
  'be still and listen',
  'rely on divine wisdom',
  'offer compassion',
]

const reflections = [
  'Let this verse guide your heart today and remind you of God’s presence.',
  'Take this message into your relationships and share it with others.',
  'Allow this scripture to bring calm in moments of uncertainty.',
  'Reflect on this truth and let it shape your next step.',
  'Hold this promise in your mind and return to it when you need strength.',
  'Use this as a reminder that grace meets us in every season.',
  'Let the theme of this verse renew your hope and purpose.',
  'Allow it to deepen your trust and soften your fear.',
  'Invite this scripture to anchor your prayer life.',
  'Let this reading encourage you to act in love today.',
]

const references = []
for (const book of books) {
  for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
    for (let verse = 1; verse <= 30; verse += 1) {
      references.push({ book: book.name, chapter, verse })
      if (references.length === 3000) break
    }
    if (references.length === 3000) break
  }
  if (references.length === 3000) break
}

const readings = references.map((ref, index) => {
  const scripture_ref = `${ref.book} ${ref.chapter}:${ref.verse}`
  const theme = themes[index % themes.length]
  const action = actions[index % actions.length]
  const reflection = reflections[index % reflections.length]
  const title = `${theme} from ${ref.book}`
  const reading_text = `In ${scripture_ref}, remember to ${action} and let ${theme.toLowerCase()} shape your day.`
  const date = new Date(2026, 0, 1 + index)

  return {
    id: `post-${String(index + 1).padStart(4, '0')}`,
    date: date.toISOString().slice(0, 10),
    scripture_ref,
    title,
    reading_text,
    reflection,
  }
})

export default readings
