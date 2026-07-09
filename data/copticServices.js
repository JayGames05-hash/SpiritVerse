const COPTIC_SERVICES = [
  {
    id: 'liturgy-st-basil',
    title: 'Liturgy of St. Basil',
    category: 'Liturgy',
    description: 'The most common Coptic liturgy used for Sunday and feast-day worship, with prayers, readings, and Holy Communion.',
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
