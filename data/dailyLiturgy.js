const DAILY_LITURGY = {
  '01-01': {
    liturgy: 'Liturgy of St. Basil',
    title: 'Circumcision of Christ',
    old_testament: 'Genesis 17:9-14',
    epistle: 'Colossians 2:9-15',
    gospel: 'Luke 2:21-24',
    note: 'A commemoration of the Lord’s circumcision. Verify with the local Coptic calendar for exact liturgical observance.'
  },
  '01-06': {
    liturgy: 'Liturgy of St. Basil',
    title: 'Feast of Theophany',
    old_testament: 'Isaiah 43:1-7',
    epistle: 'Titus 2:11-14',
    gospel: 'Matthew 3:13-17',
    note: 'Based on Coptic Theophany readings. Theophany celebrates the baptism of Christ.'
  },
  '01-07': {
    liturgy: 'Liturgy of St. Basil',
    title: 'The Holy Nativity Feast',
    old_testament: 'Psalm 72:10',
    epistle: 'Hebrews 1:1-4',
    gospel: 'Matthew 2:1-12',
    note: 'Based on the official Coptic Church readings for January 7, 2026 (CopticChurch.net).' 
  },
  '01-14': {
    liturgy: 'Liturgy of St. Basil',
    title: 'Feast of the Circumcision',
    old_testament: 'Psalm 116:16-19',
    epistle: 'Philippians 3:1-12',
    gospel: 'Luke 2:21-39',
    note: 'Based on the official Coptic Church readings for January 14, 2026.'
  },
  '01-19': {
    liturgy: 'Liturgy of St. Basil',
    title: 'Feast of Epiphany (Theophany)',
    old_testament: 'Psalm 42:6,11',
    epistle: 'Titus 2:11-14',
    gospel: 'John 1:18-34',
    note: 'Based on the official Coptic Church readings for January 19, 2026.'
  },
  '02-15': {
    liturgy: 'Liturgy of St. Basil',
    title: 'Presentation of the Lord in the Temple',
    old_testament: 'Psalm 116:16-19',
    epistle: 'Philippians 3:1-12',
    gospel: 'Luke 2:21-39',
    note: 'Based on the official Coptic Church readings for February 15, 2026.'
  },
  '04-05': {
    liturgy: 'Liturgy of St. Basil',
    title: 'Palm Sunday',
    old_testament: 'Psalm 118:26-27',
    epistle: 'Hebrews 9:11-28',
    gospel: 'Matthew 21:1-17',
    note: 'Based on the official Coptic Church readings for April 5, 2026.'
  },
  '04-19': {
    liturgy: 'Liturgy of St. Basil',
    title: 'Thomas Sunday',
    old_testament: 'Psalm 96:1-2',
    epistle: 'Ephesians 4:20-32',
    gospel: 'John 20:19-31',
    note: 'Based on the official Coptic Church readings for April 19, 2026.'
  },
  '05-21': {
    liturgy: 'Liturgy of St. Basil',
    title: 'Ascension of the Lord',
    old_testament: 'Psalm 68:32-34',
    epistle: '1 Timothy 3:13-16',
    gospel: 'Luke 24:36-53',
    note: 'Based on the official Coptic Church readings for May 21, 2026.'
  },
  '05-31': {
    liturgy: 'Liturgy of St. Basil',
    title: 'Pentecost',
    old_testament: 'Psalm 51:12-14',
    epistle: '1 Corinthians 12:1-31',
    gospel: 'John 15:26-16:15',
    note: 'Based on the official Coptic Church readings for May 31, 2026.'
  },
  '07-12': {
    liturgy: 'Liturgy of St. Basil',
    title: 'Feast of the Apostles',
    old_testament: 'Psalm 20:6,9',
    epistle: '1 Corinthians 9:1-27',
    gospel: 'Luke 10:1-20',
    note: 'Based on the official Coptic Church readings for July 12, 2026.'
  },
  '09-11': {
    liturgy: 'Liturgy of St. Basil',
    title: 'Nayrouz / Coptic New Year',
    old_testament: 'Psalm 96:1-2',
    epistle: '2 Corinthians 5:11-6:13',
    gospel: 'Luke 4:14-30',
    note: 'Based on the official Coptic Church readings for September 11, 2026 (Nayrouz).' 
  },
  '12-25': {
    liturgy: 'Liturgy of St. Basil',
    title: 'Nativity of Christ',
    old_testament: 'Isaiah 9:2-7',
    epistle: 'Titus 3:4-7',
    gospel: 'Matthew 1:18-25',
    note: 'The Nativity feast. In many Coptic calendars, the Nativity is celebrated on January 7.'
  }
}

export function getDailyLiturgyForDate(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const key = `${month}-${day}`
  return DAILY_LITURGY[key] || null
}

export default DAILY_LITURGY
