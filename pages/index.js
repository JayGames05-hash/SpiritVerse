import React from 'react'
import Header from '../components/Header'
import ReadingCard from '../components/ReadingCard'
import readings from '../data/readings'

export default function Home() {
  const today = readings[0]

  return (
    <div>
      <Header />
      <main style={{maxWidth:900,margin:'24px auto',padding:'0 16px'}}>
        <ReadingCard post={today} />
      </main>
    </div>
  )
}
