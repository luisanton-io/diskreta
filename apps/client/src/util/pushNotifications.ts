import API from "API"

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

let swRegistration: ServiceWorkerRegistration | null = null

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!("serviceWorker" in navigator)) return null
    try {
        swRegistration = await navigator.serviceWorker.register("/sw.js")
        return swRegistration
    } catch {
        return null
    }
}

export async function subscribeToPush(): Promise<boolean> {
    if (!("PushManager" in window)) return false

    try {
        const registration = swRegistration ?? await registerServiceWorker()
        if (!registration) return false

        // Check if already subscribed
        const existing = await registration.pushManager.getSubscription()
        if (existing) {
            // Re-send to server (refresh)
            await API.post("/push/subscribe", existing.toJSON())
            return true
        }

        // Fetch VAPID key
        const { data } = await API.get<{ publicKey: string }>("/push/vapid-public-key")
        const applicationServerKey = urlBase64ToUint8Array(data.publicKey)

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
        })

        await API.post("/push/subscribe", subscription.toJSON())
        return true
    } catch {
        return false
    }
}

export async function unsubscribeFromPush(): Promise<void> {
    try {
        const registration = swRegistration ?? await navigator.serviceWorker?.ready
        if (!registration) return

        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
            await subscription.unsubscribe()
        }

        await API.delete("/push/unsubscribe")
    } catch {
        // Silently fail — user may be offline or already unsubscribed
    }
}
