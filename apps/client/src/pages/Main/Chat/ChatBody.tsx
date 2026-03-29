import { useContext, useEffect } from "react"
import { useAuthStore } from "stores/auth"
import { useUIStore } from "stores/ui"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatContext } from "./context/ChatCtx"
import useMessageStatus from "../handlers/useMessageStatus"
import MessageBubble from "./MessageBubble"

export default function ChatBody() {
  const user = useAuthStore((s) => s.user)
  const hasFocus = useUIStore((s) => s.focus)
  const { activeChat, socket, connected } = useContext(ChatContext)
  const handleMessageStatus = useMessageStatus()

  useEffect(() => {
    const newMessages = activeChat.messages.filter(
      (msg) => msg.sender._id !== user?._id && msg.status === "new"
    ) as ReceivedMessage[]

    if (hasFocus && connected && user?._id && newMessages.length) {
      newMessages.forEach((msg) => {
        handleMessageStatus({
          chatId: activeChat.id,
          hash: msg.hash,
          status: "read",
          recipientId: user._id,
        })

        socket.emit("read-msg", {
          ...msg,
          content: {},
        })
      })
    }
  }, [hasFocus, socket, connected, user?._id, activeChat, handleMessageStatus])

  return (
    <ScrollArea className="relative flex-1 px-3 pb-2">
      <div className="flex flex-col gap-1 py-2">
        {activeChat.messages.map((message, i) => (
          <MessageBubble
            key={`msg-${message.hash || i}`}
            message={message}
            sent={message.sender._id === user!._id}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
