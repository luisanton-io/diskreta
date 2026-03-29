import { useContext } from "react"
import { useAuthStore } from "stores/auth"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatContext } from "./context/ChatCtx"
import MessageBubble from "./MessageBubble"

export default function ChatBody() {
  const user = useAuthStore((s) => s.user)
  const { activeChat } = useContext(ChatContext)

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
