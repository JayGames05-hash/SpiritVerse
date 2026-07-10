const COPTIC_SERVICES = [
  {
    id: 'liturgy-st-basil',
    title: 'Liturgy of St. Basil',
    category: 'Liturgy',
    description: 'The Divine Liturgy of St. Basil, the primary Sunday and feast-day service in the Coptic Orthodox Church.',
    order: [
      {
        title: 'The Offeratory',
        description: 'The priest prepares the altar and the gifts as the faithful begin in prayer.',
        details: 'Begin with the Offeratory. The priest places the bread and wine on the altar, praying silently for forgiveness and asking God to accept the offering. The faithful join in silent repentance as the liturgy begins.'
      },
      {
        title: 'Hymn of the Blessing',
        description: 'A hymn invoking God’s blessing at the start of the service.',
        details: 'Sing or listen to the hymn of blessing that asks God to sanctify the service, the people, and the gifts about to be offered.'
      },
      {
        title: 'Hail to Mary the Queen',
        description: 'A hymn honoring the Theotokos and her intercession.',
        details: 'The Church honors the Virgin Mary and asks for her intercession. Follow along with the verses praising her as the Mother of God and Protector of the faithful.'
      },
      {
        title: 'O King of Peace',
        description: 'A hymn asking Christ the King of Peace to grant unity and calm.',
        details: 'This hymn invites Christ, the King of Peace, to bring harmony to the congregation, clearing all discord and preparing hearts for the sacred mysteries.'
      },
      {
        title: 'Prayer of Preparation',
        description: 'The priest prepares the gifts and asks God’s grace for the mysteries.',
        details: 'The priest prays over the bread and wine, asking the Holy Spirit to bless and consecrate them, and prays that the faithful may receive worthily.'
      },
      {
        title: 'Prayer After Preparation',
        description: 'A continuation of the preparatory prayers before the procession.',
        details: 'Continue in prayer as the priest offers additional petitions, thanking God and preparing to bring the gifts forward in the procession.'
      },
      {
        title: 'Procession of the Lamb',
        description: 'The consecrated elements are carried forward in solemn procession.',
        details: 'As the bread and wine are carried in procession, remember that Christ is the Lamb of God. The faithful stand with reverence to honor this moment.'
      },
      {
        title: 'Prayer of Thanksgiving',
        description: 'The Church gives thanks for the gift of salvation and the sanctification of the offering.',
        details: 'The congregation gives thanks for Christ’s sacrifice and the sanctification of the gifts. Use this prayer to center your heart on gratitude.'
      },
      {
        title: 'Hymn Nicabeu Tyrou',
        description: 'A hymn proclaiming the victory and glory of God.',
        details: 'Sing the triumphant hymn that proclaims God’s victory and glory, affirming the power of Christ’s resurrection and reign.'
      },
      {
        title: 'Hymn Nefcen',
        description: 'A hymn of praise acknowledging the Lord’s presence among the faithful.',
        details: 'The faithful praise God for His presence, acknowledging that He is in their midst and that the liturgy is His holy assembly.'
      }
    ],
    bookmarks: [
      {
        heading: 'Opening and Preparation',
        description: 'The service begins with the Offeratory, blessings, and the preparation of the gifts.',
        page: 7,
        items: [
          { title: 'The Offeratory', details: 'The priest prepares the altar and the gifts as the faithful begin in prayer.' },
          { title: 'Hymn of the Blessing', details: 'A hymn invoking God’s blessing at the start of the service.' },
          { title: 'Hail to Mary the Queen', details: 'A hymn honoring the Theotokos and her intercession.' },
          { title: 'O King of Peace', details: 'A hymn asking Christ the King of Peace to grant unity and calm.' },
          { title: 'Prayer of Preparation', details: 'The priest prepares the gifts and asks God’s grace for the mysteries.' },
          { title: 'Prayer After Preparation', details: 'A continuation of the preparatory prayers before the procession.' },
          { title: 'Procession of the Lamb', details: 'The consecrated elements are carried forward in solemn procession.' },
          { title: 'Prayer of Thanksgiving', details: 'The Church gives thanks for the gift of salvation and the sanctification of the offering.' }
        ]
      },
      {
        heading: 'The Liturgy of the Word',
        description: 'The Church sings and prays as the service moves toward the Liturgy of the Faithful.',
        page: 28,
        items: [
          { title: 'Hymn Nicabeu Tyrou', details: 'A hymn proclaiming the victory and glory of God.' },
          { title: 'Hymn Nefcen', details: 'A hymn of praise acknowledging the Lord’s presence among the faithful.' },
          { title: 'Absolution of the Servants', details: 'Prayers of forgiveness are offered to prepare the faithful for communion.' },
          { title: 'Let Them Exalt Him', details: 'A hymn of exaltation sung as the service moves deeper into the liturgy.' },
          { title: 'Response to the Gospel', details: 'A liturgical response sung after the reading of the Gospel.' }
        ]
      },
      {
        heading: 'The Liturgy of the Faithful',
        description: 'The heart of the Divine Liturgy, where the Church prays for peace and the faithful prepare for communion.',
        page: 62,
        items: [
          { title: 'Liturgy of the Faithful', details: 'The faithful enter the sacred portion of the service and prepare to receive the Mysteries.' },
          { title: 'Prayer of the Veil', details: 'The priest covers the gifts and invokes the Holy Spirit to sanctify them.' },
          { title: 'Three Long Litanies', details: 'Extended intercessions for peace, the fathers, and the assemblies.' },
          { title: 'The Orthodox Creed', details: 'The congregation professes the Nicene Creed together.' },
          { title: 'Prayer of Reconciliation', details: 'A prayer seeking unity and forgiveness within the Church.' }
        ]
      },
      {
        heading: 'Communion and Dismissal',
        description: 'The Mass reaches its summit in communion and closes with thanksgiving and blessing.',
        page: 79,
        items: [
          { title: 'Rejoice O Mary', details: 'A hymn in praise of the Virgin Mary.' },
          { title: 'Greet One Another', details: 'A hymn inviting the faithful to offer peace to one another.' },
          { title: 'Through the Intercessions of the Theotokos', details: 'A hymn asking for the intercession of the Virgin Mary.' },
          { title: 'Prayer After Our Father', details: 'A prayer that follows the Lord’s Prayer and addresses the Father.' },
          { title: 'Prayer of Submission to the Son', details: 'A humble prayer offered to Christ in submission and love.' },
          { title: 'Prayer of Absolution to the Son', details: 'A prayer asking Christ to forgive and absolve the faithful.' },
          { title: 'Distribution of the Holy Mysteries', details: 'The faithful receive the Body and Blood of Christ.' },
          { title: 'Thanksgiving After Communion', details: 'A prayer of gratitude and devotion after receiving communion.' },
          { title: 'Prayer of the Laying-On of Hands', details: 'A closing blessing that sends the faithful forth in peace.' }
        ]
      }
    ]
  }
]

export default COPTIC_SERVICES
