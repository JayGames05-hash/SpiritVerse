self.addEventListener('push', (event) => {
  let data = { title: 'New notification', body: 'Open the app to see updates.', url: '/' }
  if (event.data) {
    try {
      data = event.data.json()
    } catch (err) {
      console.warn('Invalid push payload', err)
    }
  }

  const options = {
    body: data.body,
    icon: '/logo-192.png',
    badge: '/logo-192.png',
    data: {
      url: data.url || '/'
    }
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
    }),
  )
})
