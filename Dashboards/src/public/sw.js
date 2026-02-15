// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'New Update', body: 'Check your dashboard.' };

  const options = {
    body: data.body,
    icon: '/icon.png', // Replace with your logo
    badge: '/badge.png',  // Small icon for mobile bars
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Open the dashboard when the user clicks the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/notifications')
  );
});