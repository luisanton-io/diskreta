import { useEffect, useRef } from "react"
import { useAuthStore } from "stores/auth"
import { subscribeToPush, unsubscribeFromPush } from "util/pushNotifications"

/**
 * Subscribes to push notifications when a user logs in with push enabled,
 * and refreshes the subscription on each login.
 */
export default function usePushNotifications() {
    const user = useAuthStore(s => s.user)
    const pushEnabled = user?.settings.pushNotificationsEnabled ?? false
    const isLoggedIn = !!user?.token
    const prevLoggedIn = useRef(false)

    useEffect(() => {
        if (isLoggedIn && pushEnabled && !prevLoggedIn.current) {
            // User just logged in with push enabled — subscribe
            subscribeToPush()
        }
        prevLoggedIn.current = isLoggedIn
    }, [isLoggedIn, pushEnabled])
}
