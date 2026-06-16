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

self.addEventListener('push', (event) => {
  let data = { title: 'New verse reminder', body: 'Your next verse is ready.', url: '/' }
  if (event.data) {
    try {
      data = event.data.json()
    } catch (err) {
      console.warn('Failed to parse push event data', err)
    }
  }

  const options = {
    body: data.body,
    icon: '/logo-192.png',
    badge: '/logo-192.png',
    data: { url: data.url || '/' }
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
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
