import { TouchEvent, useState } from "react";

interface SwipeInput {
    onSwipedLeft?: () => void
    onSwipedRight?: () => void
}

interface SwipeOutput {
    deltaX: number,
    vSwipe: boolean,
    onTouchStart: (e: TouchEvent) => void
    onTouchMove: (e: TouchEvent) => void
    onTouchEnd: () => void
}

export default function useSwipe(input?: SwipeInput): SwipeOutput {
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchStartY, setTouchStartY] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [deltaX, setDeltaX] = useState(0)
    const [deltaY, setDeltaY] = useState(0)

    const minSwipeDistance = 50;

    const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(0); // otherwise the swipe is fired even with usual touch events
        setTouchStartX(e.targetTouches[0].clientX);
        setTouchStartY(e.targetTouches[0].clientY);
    }

    const onTouchMove = (e: TouchEvent) => {
        setDeltaX(touchStartX - e.targetTouches[0].clientX)
        setDeltaY(touchStartY - e.targetTouches[0].clientY)
        setTouchEnd(e.targetTouches[0].clientX)
    };

    const onTouchEnd = () => {
        if (!touchStartX || !touchEnd) return;
        const distance = touchStartX - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe) {
            input?.onSwipedLeft?.();
        }
        if (isRightSwipe) {
            input?.onSwipedRight?.();
        }
        setDeltaX(0)
    }

    const yThreshold = 30

    const vSwipe = Math.abs(deltaY) > yThreshold

    return {
        deltaX,
        vSwipe,
        onTouchStart,
        onTouchMove,
        onTouchEnd
    }
}