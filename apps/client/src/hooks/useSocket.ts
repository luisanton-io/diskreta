import API from "API"
import { refreshToken } from "API/refreshToken"
import useArchiveMessage from "pages/Main/handlers/useArchiveMessage"
import useMessageStatus from "pages/Main/handlers/useMessageStatus"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify"
import { io } from "socket.io-client"
import { useAuthStore } from "stores/auth"
import { useChatsStore } from "stores/chats"
import useUpdateMessage from "./useUpdateMessage"

interface TimeoutMap {
    [key: string]: { // chatid
        [key: string]: NodeJS.Timeout // userid: timeoutRef
    }
}

export default function useSocket() {

    const token = useAuthStore(state => state.user?.token)

    const socket = useMemo(() => {
        return !!token && io(import.meta.env.VITE_BE_DOMAIN || "", { transports: ['websocket'], auth: { token } })
    }, [token])

    const [connected, setConnected] = useState(false)

    const archiveMessage = useArchiveMessage()
    const handleMessageStatus = useMessageStatus()
    const updateMessage = useUpdateMessage()

    // Stable refs so the socket useEffect doesn't re-run on every render
    const archiveMessageRef = useRef(archiveMessage)
    archiveMessageRef.current = archiveMessage
    const handleMessageStatusRef = useRef(handleMessageStatus)
    handleMessageStatusRef.current = handleMessageStatus
    const updateMessageRef = useRef(updateMessage)
    updateMessageRef.current = updateMessage

    const typingTimeouts = useRef<TimeoutMap>({})

    useEffect(() => {
        if (!socket) return

        API.get<Queue>("/queues").then(({ data: queue }) => {
            const { messages = [], status = [], reactions = [] } = queue || {}
            try {
                messages.forEach(msg => archiveMessageRef.current(msg, { showToast: false }))
                status.forEach(msg => handleMessageStatusRef.current(msg))
                reactions.forEach(reaction => handleMessageReaction(reaction))
            } catch (error) {
                console.log("Handle dequeue error:", error)
            }
        })

        const handleArchiveMessage = (message: ReceivedMessage, ack: Function) => {
            try {
                archiveMessageRef.current(message, { showToast: true })
                ack(JSON.stringify({ "hash": message.hash }))
            } catch (error) {
                ack(JSON.stringify({ error: (error as Error) }))
            }
        }

        const handleTyping = (typing: TypingMsg) => {

            const currentTimeout = typingTimeouts.current[typing.chatId]?.[typing.sender._id]

            if (currentTimeout) {
                clearTimeout(currentTimeout)
                delete typingTimeouts.current[typing.chatId]![typing.sender._id]
            } else {
                const { chats, setChats } = useChatsStore.getState()
                if (chats?.[typing.chatId]) {
                    setChats({
                        ...chats,
                        [typing.chatId]: {
                            ...chats[typing.chatId],
                            typing: [...(chats[typing.chatId]?.typing || []), typing.sender._id]
                        }
                    })
                }
            }

            (typingTimeouts.current[typing.chatId] ||= {})[typing.sender._id] = setTimeout(() => {
                delete typingTimeouts.current[typing.chatId]![typing.sender._id]
                const { chats, setChats } = useChatsStore.getState()
                if (chats?.[typing.chatId]) {
                    setChats({
                        ...chats,
                        [typing.chatId]: {
                            ...chats[typing.chatId],
                            typing: chats[typing.chatId].typing?.filter(id => id !== typing.sender._id)
                        }
                    })
                }
            }, 500)

        }

        const handleMessageReaction = ({ chatId, hash, senderId, reaction }: IncomingReaction, ack?: Function) => {

            console.table({ chatId, hash, senderId, reaction })

            const updater = (message: SentMessage | ReceivedMessage) => {
                const updatedReaction = message.reactions?.[senderId] === reaction ? undefined : reaction

                return {
                    ...message,
                    reactions: {
                        ...(message.reactions || {}),
                        [senderId]: updatedReaction
                    }
                }
            }

            updateMessageRef.current({ chatId, hash, updater })
            ack?.()
        }

        const handleRefreshToken = () => {
            socket.disconnect()
            refreshToken()
        }

        const onDisconnect = () => {
            toast.info("Connecting...", { position: toast.POSITION.TOP_CENTER, autoClose: false })
            const { chats, setChats } = useChatsStore.getState()
            if (chats) {
                const cleared = Object.values(chats).reduce((acc, { id }) => ({
                    ...acc,
                    [id]: {
                        ...acc[id],
                        typing: undefined
                    }
                }), chats)
                setChats(cleared)
            }
            refreshToken()
            setConnected(false)
        }

        const onConnect = () => {
            toast.dismiss()
            toast.success("Connected!", { position: toast.POSITION.TOP_CENTER, autoClose: 2000 })
            setConnected(true)
        }

        socket.on('in-msg', handleArchiveMessage)
        socket.on('msg-status', (msg: MessageStatusUpdate) => handleMessageStatusRef.current(msg))
        socket.on('typing', handleTyping)
        socket.on('in-reaction', handleMessageReaction)
        socket.on('connect', onConnect)
        socket.on('disconnect', onDisconnect)
        socket.on('connect_error', handleRefreshToken);

        return () => {
            socket.off('in-msg', handleArchiveMessage)
            socket.off('msg-status')
            socket.off('typing', handleTyping)
            socket.off('in-reaction', handleMessageReaction)
            socket.off('connect', onConnect)
            socket.off('disconnect', onDisconnect)
            socket.off('connect_error', handleRefreshToken);
        }

    }, [socket])

    return { socket, connected }
}