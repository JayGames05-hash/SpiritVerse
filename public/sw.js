const CACHE_NAME = 'coptic-daily-readings-v1'

self.addEventListener('install', (event) => {
  console.log('[SW] Install event starting')
  event.waitUntil(
    Promise.resolve()
      .then(() => {
        console.log('[SW] Install complete, skipping clients')
        return self.skipWaiting()
      })
  )
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event starting')
  event.waitUntil(
    caches.keys().then((keys) => {
      console.log('[SW] Found cache keys:', keys)
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Deleting old cache:', k)
          return caches.delete(k)
        })
      )
    }).then(() => {
      console.log('[SW] Activate complete, claiming all clients')
      return self.clients.claim()
    })
  )
})

self.addEventListener('push', (event) => {
  console.log('[SW] Push event received')
  let data = { title: 'New verse reminder', body: 'Your next verse is ready.', url: '/' }
  if (event.data) {
    try {
      data = event.data.json()
      console.log('[SW] Push data parsed:', data)
    } catch (err) {
      console.warn('[SW] Failed to parse push event data', err)
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
  console.log('[SW] Notification clicked:', event.notification.title)
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
