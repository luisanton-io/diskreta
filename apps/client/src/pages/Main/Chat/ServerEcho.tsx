import useActiveChat from "hooks/useActiveChat";
import { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { JSONTree } from "react-json-tree";
import { ChatContext } from "./context/ChatCtx";
export interface SocketEcho {
    event: string
    payload: Record<string, any>
}

export default function ServerEcho() {

    const { socket } = useContext(ChatContext)
    const [serverView, setServerView] = useState(false)
    const [serverEcho, setServerEcho] = useState<SocketEcho[]>([])

    const { activeChatId } = useActiveChat()

    useEffect(() => {

        const handleEcho = (payload: SocketEcho) => { setServerEcho(echoes => [...echoes, payload]) }

        const handleIncomingMsgLog = (message: ReceivedMessage) => {
            setServerEcho(echoes => [...echoes, {
                event: "in-msg",
                payload: message
            }])
        }

        socket.on('echo', handleEcho)
        socket.on('in-msg', handleIncomingMsgLog)


        return () => {
            socket.off('echo', handleEcho)
            socket.off('in-msg', handleIncomingMsgLog)
        }

    }, [socket])

    useEffect(() => {
        setServerEcho([])
    }, [activeChatId])


    return <div id="server-echo"
        data-server-view={serverView}
    >
        <Button variant="outline-warning" style={{ height: 42 }} className="btn-submit" onClick={() => { setServerView(v => !v) }}>
            {serverView ? "Hide" : "Show"} server logs
        </Button>
        {
            serverView &&
            <JSONTree data={serverEcho.length ? serverEcho : { message: "No activity detected." }} hideRoot />
        }
    </div>
}