import { useEffect, useState } from "react";
import { ChevronDown } from "react-bootstrap-icons";

interface Props {
    scrollerRef: React.RefObject<HTMLDivElement>
}

export default function ScrollToBottom({ scrollerRef }: Props) {

    const scrollToBottom = () => {
        scrollerRef.current?.scrollTo({
            top: scrollerRef.current.scrollHeight,
            behavior: 'smooth'
        })
    }

    const [isScrolledToBottom, setIsScrolledToBottom] = useState(true)

    useEffect(() => {
        const scroller = scrollerRef.current

        const handleScrolledToBottom = () => {
            setIsScrolledToBottom(Math.abs(scroller!.scrollTop) < 3)
        }

        scroller?.addEventListener('scroll', handleScrolledToBottom)

        return () => {
            scroller?.removeEventListener('scroll', handleScrolledToBottom)
        }
    }, [scrollerRef])

    return (
        <div id="scroll-to-bottom" className="text-white rounded-pill" onClick={scrollToBottom} data-visible={!isScrolledToBottom}>
            <ChevronDown />
        </div>
    )
}