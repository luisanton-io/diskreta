import useActiveChat from "hooks/useActiveChat"
import { useContext, useEffect, useState } from "react"
import { ChatContext } from "./context/ChatCtx"

export default function Typing() {
  const [dots, setDots] = useState("")

  const { activeChat } = useActiveChat()
  const { recipients } = useContext(ChatContext)

  const typingUsers = recipients.filter(
    (user) => activeChat && activeChat.typing?.includes(user._id)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((dots) => (dots === "..." ? "" : dots + "."))
    }, 300)

    return () => {
      clearInterval(interval)
    }
  }, [])

  if (!typingUsers.length) return null

  return (
    <div className="px-4 py-1 text-sm text-muted-foreground">
      <span className="italic">
        {typingUsers.map((user) => user.nick).join(", ")} is typing
        <span className="inline-block w-4">{dots}</span>
      </span>
    </div>
  )
}
