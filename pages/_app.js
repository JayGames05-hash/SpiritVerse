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
