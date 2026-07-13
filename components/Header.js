import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import AuthButton from './AuthButton'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/user', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setIsLoggedIn(!!data.user))
      .catch(() => setIsLoggedIn(false))
  }, [])

  const navLinks = (
    <>
      <Link href="/" className="block px-4 py-3 text-white hover:text-gray-100 rounded" aria-label="Home">Home</Link>
      <Link href="/bible" className="block px-4 py-3 text-white hover:text-gray-100 rounded" aria-label="Bible">Bible</Link>
      <Link href="/archive" className="block px-4 py-3 text-white hover:text-gray-100 rounded" aria-label="Archive">Archive</Link>
      <Link href="/search" className="block px-4 py-3 text-white hover:text-gray-100 rounded" aria-label="Search">Search</Link>
      <Link href="/saints" className="block px-4 py-3 text-white hover:text-gray-100 rounded" aria-label="Saints">Saints</Link>
      <Link href="/calendar" className="block px-4 py-3 text-white hover:text-gray-100 rounded" aria-label="Feast Calendar">Feast Calendar</Link>
      <Link href="/verse-suggestions" className="block px-4 py-3 text-white hover:text-gray-100 rounded" aria-label="Suggest a Verse">Suggest a Verse</Link>
      {isLoggedIn && (
        <>
          <Link href="/favorites" className="block px-4 py-3 text-white hover:text-gray-100 rounded" aria-label="Favorites">Favorites</Link>
          <Link href="/profile" className="block px-4 py-3 text-white font-semibold hover:text-gray-100 rounded" aria-label="Profile">Profile</Link>
        </>
      )}
      <div className="block px-3 py-2">
        <AuthButton />
      </div>
    </>
  )

  return (
    <header className="church-header relative z-10">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 p-3 sm:p-4">
        {/* Left: logo */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Coptic Daily Readings" className="h-[6rem] w-auto" />
          </Link>
        </div>

        {/* Center: title */}
        <div className="flex-1 text-center pointer-events-none">
          <Link href="/" className="inline-block pointer-events-auto">
            <span className="font-bold text-2xl sm:text-3xl text-white tracking-wide">Coptic Daily Readings</span>
          </Link>
        </div>

        {/* Right: nav (desktop) + hamburger (mobile) */}
        <div className="flex items-center gap-3">
          <nav className="hidden sm:flex items-center gap-3 text-sm text-white/90" role="navigation" aria-label="Main navigation">{navLinks}</nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden inline-flex items-center justify-center p-3 rounded-md text-white/90 hover:text-white"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div id="mobile-menu" className="sm:hidden absolute left-0 right-0 top-full bg-[#0f0a09] border-t border-white/10">
          <div className="max-w-4xl mx-auto p-4 flex flex-col gap-1">{navLinks}</div>
        </div>
      )}
    </header>
  )
}
