import { useEffect } from "react";
import { useAuthStore } from "stores/auth";
import { useUIStore } from "stores/ui";

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export default function FocusHandler() {
    const setFocus = useUIStore(state => state.setFocus)
    const focus = useUIStore(state => state.focus)
    const sessionTimeout = useAuthStore(state => state.user?.settings.sessionTimeout ?? 15)

    useEffect(() => {
        const focusDaemon = setInterval(() => {
            setFocus(!document.hidden && (isMobile || document.hasFocus()))
        }, 1000)

        return () => {
            clearInterval(focusDaemon)
        }
    }, [setFocus])

    useEffect(() => {
        const logoutTimeout = setTimeout(() => {
            if (!!sessionTimeout && !focus && !['/register', '/login'].includes(window.location.pathname)) {
                window.location.reload()
            }
        }, sessionTimeout * 1000)

        return () => {
            clearTimeout(logoutTimeout)
        }
    }, [focus, sessionTimeout])

    return null
}
