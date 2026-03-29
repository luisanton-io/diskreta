import { useEffect } from "react";
import { useUIStore } from "stores/ui";
import { isMobile } from "react-device-detect";

export default function FocusHandler() {
    const setFocus = useUIStore(state => state.setFocus)
    const focus = useUIStore(state => state.focus)
    const sessionTimeout = useUIStore(state => state.sessionTimeout)

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
