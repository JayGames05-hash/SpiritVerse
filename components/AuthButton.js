import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { auth } from '../lib/apiClient'

export default function AuthButton() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    auth.getUser().then((res) => setUser(res.data.user)).catch(() => {})
    const { data: listener } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener?.subscription?.unsubscribe?.()
  }, [])

  async function signOut() {
    const { error } = await auth.signOut()
    if (error) {
      alert('Sign-out failed: ' + error.message)
      return
    }
    setUser(null)
  }

  function goToAuth() {
    router.push('/signin')
  }

  if (user) {
    const name = user.user_metadata?.saint_name || user.user_metadata?.full_name || user.email
    return (
      <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 14 }}>{name}</span>
        <button onClick={signOut} style={{ padding: '6px 10px' }}>
          Sign out
        </button>
      </div>
    )
  }

  return (
    <button onClick={goToAuth} style={{ padding: '6px 10px' }}>
      Sign in / Register
    </button>
  )
}
