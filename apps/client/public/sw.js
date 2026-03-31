// Diskreta Push Notification Service Worker

self.addEventListener("push", (event) => {
    let title = "Diskreta";
    let body = "You have a new message";

    if (event.data) {
        try {
            const data = event.data.json();
            title = data.title || title;
            body = data.body || body;
        } catch {
            // Use defaults
        }
    }

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: "/logo192.png",
            badge: "/logo192.png",
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
            // Focus existing window if available
            for (const client of clients) {
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            return self.clients.openWindow("/");
        })
    );
});
