import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import AuthButton from './AuthButton'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/auth/user')
      .then(res => res.json())
      .then(data => setIsLoggedIn(!!data.user))
      .catch(() => setIsLoggedIn(false))
  }, [])

  return (
    <header className="bg-gray-50 border-b">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-3 sm:gap-0 p-3">
        <Link href="/" className="font-bold text-lg">Coptic Daily Readings</Link>
        <nav className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto">
          <Link href="/" className="text-sm hover:text-purple-600">Home</Link>
          <Link href="/archive" className="text-sm hover:text-purple-600">Archive</Link>
          <Link href="/ask" className="text-sm hover:text-purple-600">Ask a Question</Link>
          <Link href="/verse-suggestions" className="text-sm hover:text-purple-600">Suggest a Verse</Link>
          {isLoggedIn && (
            <Link href="/profile" className="text-sm hover:text-purple-600 font-semibold">Profile</Link>
          )}
          <AuthButton />
        </nav>
      </div>
    </header>
  )
}
