import React from 'react'
import AuthButton from './AuthButton'

export default function Header(){
  return (
    <header className="bg-gray-50 border-b">
      <div className="max-w-3xl mx-auto flex items-center justify-between p-3">
        <div className="font-bold">Coptic Daily Readings</div>
        <nav className="flex items-center gap-4">
          <a href="#" className="text-sm">Home</a>
          <a href="#" className="text-sm">Archive</a>
          <a href="#" className="text-sm">Ask a Question</a>
          <AuthButton />
        </nav>
      </div>
    </header>
  )
}
