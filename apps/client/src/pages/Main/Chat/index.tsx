import Diskreta from "components/Diskreta";
import useActiveChat from "hooks/useActiveChat";
import useSocket from "hooks/useSocket";
import React, { useState } from "react";
import { Col } from "react-bootstrap";
import ChatBody from "./ChatBody";
import ChatHeader from "./ChatHeader";
import { ChatContext } from "./context/ChatCtx";
import MessageInput from "./MessageInput";
import ServerEcho from "./ServerEcho";
import Spotlight, { SpotlightProps } from "./Spotlight";

export default function Chat() {

    const { socket, connected } = useSocket()

    const { activeChat, recipients } = useActiveChat()

    const [chatWrapperRef, setChatWrapperRef] = useState<HTMLElement | null>(null)
    const [{ media, onReset, isInput, hash }, setSpotlight] = useState<SpotlightProps>({} as SpotlightProps)

    const resetMedia = () => {
        setSpotlight({} as SpotlightProps)
    }

    const handleScrollTo = (hash: string) => (e: React.SyntheticEvent) => {
        e.stopPropagation()

        const message = chatWrapperRef?.querySelector(`#_${hash}`)
        if (!message) return

        const flashOn = () => {
            message.classList.add('flashing')
        }

        const flashOff = () => {
            message.classList.remove('flashing')
            message.removeEventListener('animationend', flashOff)
        }

        message.addEventListener('animationend', flashOff)

        message.scrollIntoView({ behavior: 'smooth' })
        setTimeout(flashOn, 500)
    }

    return <>{
        activeChat && recipients && socket
            ?
            <ChatContext.Provider value={{ socket, connected, activeChat, recipients, setSpotlight, handleScrollTo }}>
                <div className="d-flex flex-column h-100">
                    <ServerEcho />

                    <div className="d-flex flex-column flex-grow-1" ref={setChatWrapperRef} style={{ minHeight: '45vh' }}>
                        <ChatHeader />

                        <hr />

                        <ChatBody />

                        <MessageInput />
                    </div>

                    {
                        media && <Spotlight {...{ media, resetMedia, onReset, isInput, hash }} />
                    }

                </div>
            </ChatContext.Provider>
            :
            <Col className="d-flex align-items-center flex-grow-1">
                <Diskreta />
            </Col>

    }
    </>
}