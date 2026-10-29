self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const target = new URL('/gestion-perfectwoman', self.location.origin).href

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      for (const client of clients) {
        if (client.url.startsWith(self.location.origin)) {
          await client.focus()

          if ('navigate' in client) {
            await client.navigate(target)
          }

          return
        }
      }

      await self.clients.openWindow(target)
    })(),
  )
})
