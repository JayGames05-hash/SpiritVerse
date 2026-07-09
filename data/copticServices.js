const COPTIC_SERVICES = [
  {
    id: 'liturgy-st-basil',
    title: 'Liturgy of St. Basil',
    category: 'Liturgy',
    description: 'The most common Coptic liturgy used for Sunday and feast-day worship, with prayers, readings, and Holy Communion.',
    order: [
      { title: 'The Offeratory', description: 'The priest prepares himself and the gifts for the divine service.' },
      { title: 'Hymn of the Blessing', description: 'A hymn of blessing opens the liturgy with praise and thanksgiving.' },
      { title: 'Hymn Hail to Mary the Queen', description: 'A hymn honoring the Theotokos and her intercession.' },
      { title: 'Hymn O King of Peace', description: 'A prayerful hymn asking for Christ’s peace to be with the faithful.' },
      { title: 'The Prayer of Preparation', description: 'The priest prepares the gifts and invokes God’s grace.' },
      { title: 'The Prayer After Preparation', description: 'A brief prayer that follows the preparation of the gifts.' },
      { title: 'The Procession of the Lamb', description: 'The consecrated gifts are solemnly brought forward in procession.' },
      { title: 'The Prayer of Thanksgiving', description: 'The Church offers thanks for the sacrifice and the sanctification of the gifts.' },
      { title: 'Hymn Nicabeu tyrou', description: 'A hymn of triumph and praise in the liturgy.' },
      { title: 'Hymn Nefcen]', description: 'A hymn celebrating the Lord and the presence of Christ in the service.' },
      { title: 'The Absolution of the Servants', description: 'Prayers of absolution are offered before communion.' },
      { title: 'Hymn “Let Them Exalt Him”', description: 'A hymn of exaltation and praise of the Lord.' },
      { title: 'Liturgy of the Faithful', description: 'The faithful enter the deepest part of the service and prepare to receive communion.' },
      { title: 'The Prayer of the Veil', description: 'The priest covers the gifts and invokes the Holy Spirit.' },
      { title: 'Annual Response to the Gospel', description: 'A liturgical response sung after the Gospel reading.' },
      { title: 'The Three Long Litanies', description: 'Litanies for peace, the fathers, and the assemblies are offered.' },
      { title: 'The Orthodox Creed', description: 'The faithful profess the Creed together in unity.' },
      { title: 'The Prayer of Reconciliation', description: 'A prayer for unity, forgiveness, and reconciliation among the people.' },
      { title: 'Hymn “Rejoice O Mary”', description: 'A hymn in praise of the Virgin Mary and her holiness.' },
      { title: 'Hymn “Greet One Another”', description: 'A hymn encouraging the faithful to offer peace to one another.' },
      { title: 'Hymn “Through the intercessions of the Theotokos”', description: 'A hymn asking for the Theotokos’s intercessions.' },
      { title: 'The Prayer After “Our Father” Addressed to the Father', description: 'A prayer that continues from the Lord’s Prayer and addresses the Father.' },
      { title: 'The Prayer of Submission to the Son', description: 'A reverent prayer offered to Christ in humility.' },
      { title: 'The Prayer of Absolution to the Son', description: 'A prayer asking Christ to absolve the faithful.' },
      { title: 'The Distribution of the Holy Mysteries', description: 'The faithful receive the Body and Blood of Christ.' },
      { title: 'A Prayer of Thanksgiving After Communion', description: 'A prayer of gratitude after receiving communion.' },
      { title: 'The Prayer of the Laying-On of Hands', description: 'A closing prayer and blessing following communion.' }
    ],
    sections: [
      {
        heading: 'Opening Prayers',
        content: 'The service begins with prayers of praise, repentance, and invocation of the Holy Spirit. The priest calls the faithful to worship and seek mercy.'
      },
      {
        heading: 'Scripture Readings',
        content: 'Selected readings from the Old Testament, Epistles, and Gospel are proclaimed. The Gospel reading is the central proclamation of the liturgy.'
      },
      {
        heading: 'Anaphora',
        content: 'The anaphora is the Eucharistic prayer, including thanksgiving, consecration of the bread and wine, and remembrance of Christ’s sacrifice.'
      },
      {
        heading: 'Communion',
        content: 'The faithful receive the Body and Blood of Christ with hymns of thanksgiving and joyful acclamations.'
      }
    ]
  },
  {
    id: 'liturgy-st-gregory',
    title: 'Liturgy of St. Gregory',
    category: 'Liturgy',
    description: 'A liturgy used for certain Sundays and special occasions, named after St. Gregory the Theologian.',
    order: [
      {
        title: 'Preparation',
        description: 'The priest prepares the gifts while the congregation offers silent prayer and repentance.'
      },
      {
        title: 'Entrance Hymns',
        description: 'Hymns are sung as the Gospel book is carried in procession, welcoming the Word of God into the cathedral.'
      },
      {
        title: 'Scripture Readings',
        description: 'The readings include the Old Testament, Epistle, and Gospel, emphasizing the theological themes of the day.'
      },
      {
        title: 'Eucharistic Prayer',
        description: 'The anaphora gives thanks for salvation history and invokes the Holy Spirit over the bread and wine.'
      },
      {
        title: 'Communion and Blessing',
        description: 'The faithful receive communion, and the service concludes with thanksgiving and blessing.'
      }
    ],
    sections: [
      {
        heading: 'Preparation',
        content: 'The priest prepares the gifts and the congregation offers silent prayer, embracing the stillness before the divine mysteries.'
      },
      {
        heading: 'Gospel Procession',
        content: 'The Gospel is brought in procession and celebrated with incense and the singing of hymns.'
      },
      {
        heading: 'Eucharistic Prayer',
        content: 'The anaphora recalls salvation history from Adam through Christ, thanking God for the mysteries bestowed upon the Church.'
      }
    ]
  },
  {
    id: 'liturgy-st-cyril',
    title: 'Liturgy of St. Cyril',
    category: 'Liturgy',
    description: 'A shorter liturgy used on certain fast days and weekdays, emphasizing humility and mercy.',
    order: [
      {
        title: 'Confession and Forgiveness',
        description: 'The faithful confess their sins and ask for God’s mercy before entering into the mystery of the Eucharist.'
      },
      {
        title: 'Readings and Antiphons',
        description: 'Psalms, Biblical readings, and antiphons prepare the congregation for communion.'
      },
      {
        title: 'Anaphora',
        description: 'A shorter Eucharistic prayer that still gives thanks for Christ’s saving work and consecrates the gifts.'
      },
      {
        title: 'Doxology and Dismissal',
        description: 'The service closes with praise to the Holy Trinity and a blessing for the faithful.'
      }
    ],
    sections: [
      {
        heading: 'Confession and Forgiveness',
        content: 'The congregation confesses sin, asks forgiveness, and receives the blessing to stand worthy before God.'
      },
      {
        heading: 'Readings and Antiphons',
        content: 'Psalms and selected readings are chanted, preparing the hearts of the faithful for communion.'
      },
      {
        heading: 'Doxology',
        content: 'The service concludes with praise to the Father, Son, and Holy Spirit, and a blessing for the week ahead.'
      }
    ]
  },
  {
    id: 'agpeya-midnight-prayer',
    title: 'Midnight Prayer (Agpeya)',
    category: 'Agpeya',
    description: 'The first prayer of the Agpeya, observing the hour of Christ’s resurrection and the descent of the Holy Spirit.',
    sections: [
      {
        heading: 'Introduction',
        content: 'Begin with the Lord’s Prayer and the Trisagion prayers, entrusting the hour to God’s protection.'
      },
      {
        heading: 'Psalmody',
        content: 'Psalms are sung with hymns commemorating the mysterious work of God in the night.'
      },
      {
        heading: 'Gospel Reading',
        content: 'The reading recalls Christ’s passion and glorious resurrection, strengthening faith for the day ahead.'
      }
    ]
  },
  {
    id: 'agpeya-prime-prayer',
    title: 'Prime Prayer (Agpeya)',
    category: 'Agpeya',
    description: 'The prayer of the first hour, asking for God’s blessing on the work of the day and protection from temptation.',
    sections: [
      {
        heading: 'Opening',
        content: 'The faithful gather to thank God for the morning and to ask His guidance throughout the day.'
      },
      {
        heading: 'Meditation',
        content: 'Short verses and prayers focus the heart on Christ’s presence in every moment.'
      }
    ]
  },
  {
    id: 'agpeya-terce-prayer',
    title: 'Terce Prayer (Agpeya)',
    category: 'Agpeya',
    description: 'The prayer of the third hour, commemorating the descent of the Holy Spirit upon the apostles.',
    sections: [
      {
        heading: 'Invocation',
        content: 'The prayer invites the Holy Spirit to dwell within the faithful and strengthen them for service.'
      },
      {
        heading: 'Hymns',
        content: 'Traditional hymns praise the Spirit and recall the apostles’ witness at Pentecost.'
      }
    ]
  },
  {
    id: 'daily-vigil-prayer',
    title: 'Vespers and Vigils',
    category: 'Daily Prayers',
    description: 'Evening prayers and vigils that prepare the faithful for the coming night, with psalms, readings, and thanksgiving.',
    sections: [
      {
        heading: 'Thanksgiving',
        content: 'The service begins with thanks for the day’s blessings and petitions for protection during the night.'
      },
      {
        heading: 'Psalms and Readings',
        content: 'Selected psalms are chanted to calm the spirit and draw the believer closer to God before rest.'
      }
    ]
  }
]

export default COPTIC_SERVICES
