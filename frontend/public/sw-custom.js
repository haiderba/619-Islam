// Custom Service Worker logic for Push Notifications & Background Sync

// 1. Handle notification clicks on Mobile & Desktop
self.addEventListener('notificationclick', (event) => {
  // Immediately dismiss the notification from notification center / tray
  event.notification.close();

  const data = event.notification.data || {};
  const targetUrl = data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If an existing window/tab of the app is already open, focus it and navigate
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if ('focus' in client) {
          return client.focus().then((focusedClient) => {
            if (focusedClient && 'navigate' in focusedClient && targetUrl && targetUrl !== '/') {
              return focusedClient.navigate(targetUrl);
            }
            return focusedClient;
          });
        }
      }
      // If no window is open, launch a new window/PWA instance
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 2. Handle notification dismiss / close event
self.addEventListener('notificationclose', (event) => {
  // Clean up any temporary states if needed
});

// 3. Handle instant activation message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

