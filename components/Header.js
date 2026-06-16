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
    <header className="church-header">
      <div className="max-w-6xl mx-auto p-3 sm:p-4">
        <div className="flex flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <img src="/logo.png" alt="Coptic Daily Readings" className="h-18 w-auto" />
            <span className="font-bold text-lg text-white tracking-wide hidden sm:inline">Coptic Daily Readings</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-3 sm:gap-6 text-sm text-white/90">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/archive" className="hover:text-white">Archive</Link>
            <Link href="/search" className="hover:text-white">Search</Link>
            <Link href="/saints" className="hover:text-white">Saints</Link>
            <Link href="/calendar" className="hover:text-white">Feast Calendar</Link>
            <Link href="/verse-suggestions" className="hover:text-white">Suggest a Verse</Link>
            {isLoggedIn && (
              <>
                <Link href="/favorites" className="hover:text-white">Favorites</Link>
                <Link href="/profile" className="hover:text-white font-semibold">Profile</Link>
              </>
            )}
            <AuthButton />
          </nav>
        </div>
      </div>
    </header>
  )
}
