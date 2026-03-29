import useActiveChat from "hooks/useActiveChat";
import { useContext, useEffect, useState } from "react";
import { ChatContext } from "./context/ChatCtx";

export default function Typing() {

    const [dots, setDots] = useState('')

    const { activeChat } = useActiveChat()
    const { recipients } = useContext(ChatContext)

    const typingUsers = recipients.filter(user => activeChat && activeChat.typing?.includes(user._id))

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(dots => dots === '...' ? '' : dots + '.')
        }, 300)

        return () => {
            clearInterval(interval)
        }
    }, [])


    return <div className="position-absolute top-0 start-0 end-0 d-flex justify-content-start">
        <span style={{ opacity: 0.75 }}>{typingUsers.map(user => user.nick).join(', ')} typing{dots}</span>
    </div>
}