import { useRef, useState } from "react";

export default function useLongPress() {
    const [longPressed, setLongPressed] = useState(false);
    const longPressTimeout = useRef<NodeJS.Timeout>()

    return {
        longPressed,
        setLongPressed,
        longPressTimeout,
        onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => {
            // e.stopPropagation()
            longPressTimeout.current = setTimeout(() => {
                setLongPressed(true)
            }, 500)
        },
        onTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => {
            longPressTimeout.current && clearTimeout(longPressTimeout.current)
        }
    }

}