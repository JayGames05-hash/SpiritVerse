import React, { useEffect } from 'react'
import Head from 'next/head'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          console.log('✓ Service Worker registered:', reg.scope)
        }).catch((err) => {
          console.error('✗ Service worker registration failed:', err.message, err)
        })
      })
    } else {
      console.warn('ServiceWorker not supported in this browser')
    }
  }, [])

  useEffect(() => {
    // Periodic verse notification: poll the verse endpoint every 2 hours
    if (typeof window === 'undefined' || !('Notification' in window)) return

    let timer = null
    const POLL_MS = 1000 * 60 * 60 * 2 // 2 hours
    const storageKey = 'lastNotifiedVerse'

    async function requestPermissionAndStart() {
      if (Notification.permission === 'default') {
        await Notification.requestPermission()
      }
      if (Notification.permission !== 'granted') return

      // initial check immediately
      checkAndNotify()
      timer = setInterval(checkAndNotify, POLL_MS)
    }

    async function checkAndNotify() {
      try {
        const res = await fetch('/api/bible?book=John&chapter=3')
        if (!res.ok) return
        const json = await res.json()
        // pick a simple identifier for the chapter (reference + first verse text)
        const id = `${json.reference}::${json.verses?.[0]?.text?.slice(0,120) || ''}`
        const last = localStorage.getItem(storageKey)
        if (id && id !== last) {
          // show a notification about the new verse/chapter
          const title = `New verse: ${json.reference}`
          const body = json.verses?.[0]?.text ? json.verses[0].text.slice(0,200) : 'A new verse is available.'
          try {
            new Notification(title, { body, icon: '/logo-192.png' })
          } catch (e) {
            console.warn('Notification failed:', e)
          }
          localStorage.setItem(storageKey, id)
        }
      } catch (e) {
        console.debug('Verse poll failed', e)
      }
    }

    // Start when page is visible to user
    function onVisibility() {
      if (document.visibilityState === 'visible') requestPermissionAndStart()
      else if (timer) { clearInterval(timer); timer = null }
    }

    document.addEventListener('visibilitychange', onVisibility)
    // start now if visible
    if (document.visibilityState === 'visible') requestPermissionAndStart()

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      if (timer) clearInterval(timer)
    }
  }, [])

  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b1e1e" />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/logo-192.png" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
