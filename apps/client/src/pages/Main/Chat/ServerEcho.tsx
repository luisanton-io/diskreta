import useActiveChat from "hooks/useActiveChat";
import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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


    return <div>
        <Button variant="outline" className="w-full h-[42px] text-yellow-500 border-yellow-500 hover:bg-yellow-500/10" onClick={() => { setServerView(v => !v) }}>
            {serverView ? "Hide" : "Show"} server logs
        </Button>
        {
            serverView &&
            <pre className="mt-2 max-h-60 overflow-auto rounded bg-muted p-3 text-xs text-foreground">
                {JSON.stringify(serverEcho.length ? serverEcho : { message: "No activity detected." }, null, 2)}
            </pre>
        }
    </div>
}
