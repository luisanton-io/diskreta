import { useContext, useEffect, useRef, useState, useCallback } from "react"
import { useAuthStore } from "stores/auth"
import { useUIStore } from "stores/ui"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowDown } from "lucide-react"
import { ChatContext } from "./context/ChatCtx"
import useMessageStatus from "../handlers/useMessageStatus"
import MessageBubble from "./MessageBubble"
import Typing from "./Typing"

function formatDateSeparator(timestamp: number): string {
  const messageDate = new Date(timestamp)
  messageDate.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (messageDate.getTime() === today.getTime()) return "Today"
  if (messageDate.getTime() === yesterday.getTime()) return "Yesterday"
  return messageDate.toLocaleDateString("default", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function shouldShowDateSeparator(
  messages: (SentMessage | ReceivedMessage)[],
  index: number
): boolean {
  if (index === 0) return true
  const prev = new Date(messages[index - 1].timestamp)
  const curr = new Date(messages[index].timestamp)
  return (
    prev.getFullYear() !== curr.getFullYear() ||
    prev.getMonth() !== curr.getMonth() ||
    prev.getDate() !== curr.getDate()
  )
}

export default function ChatBody() {
  const user = useAuthStore((s) => s.user)
  const hasFocus = useUIStore((s) => s.focus)
  const { activeChat, socket, connected } = useContext(ChatContext)
  const handleMessageStatus = useMessageStatus()

  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const isNearBottomRef = useRef(true)

  // Get the viewport element from ScrollArea
  const scrollAreaCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const viewport = node.querySelector<HTMLDivElement>(
        '[data-slot="scroll-area-viewport"]'
      )
      viewportRef.current = viewport
    }
  }, [])

  // Track scroll position
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      isNearBottomRef.current = distanceFromBottom < 100
      setShowScrollBtn(distanceFromBottom > 200)
    }

    viewport.addEventListener("scroll", handleScroll)
    return () => viewport.removeEventListener("scroll", handleScroll)
  }, [activeChat.id])

  // Auto-scroll to bottom on new messages (only if near bottom)
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    if (isNearBottomRef.current) {
      viewport.scrollTop = viewport.scrollHeight
    }
  }, [activeChat.messages.length])

  // Scroll to bottom on chat change
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    // Use requestAnimationFrame to ensure DOM is rendered
    requestAnimationFrame(() => {
      viewport.scrollTop = viewport.scrollHeight
    })
  }, [activeChat.id])

  const scrollToBottom = () => {
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: "smooth",
    })
  }

  // Read receipts
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
    <div ref={scrollAreaCallbackRef} className="relative flex-1 min-h-0">
    <ScrollArea className="h-full px-3 pb-2">
      <div className="flex flex-col gap-1 py-2">
        {activeChat.messages.map((message, i) => (
          <div key={`msg-${message.hash || i}`}>
            {shouldShowDateSeparator(activeChat.messages, i) && (
              <div className="my-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  {formatDateSeparator(message.timestamp)}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}
            <MessageBubble
              message={message}
              sent={message.sender._id === user!._id}
            />
          </div>
        ))}
      </div>

      <Typing />

    </ScrollArea>

      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background shadow-md border border-border text-foreground hover:bg-accent transition-colors"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
