const CACHE_NAME = 'coptic-daily-readings-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/logo-192.svg',
  '/logo-512.svg',
  '/logo.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((resp) => {
      // Optionally cache new requests
      return resp
    })).catch(() => caches.match('/'))
  )
})
