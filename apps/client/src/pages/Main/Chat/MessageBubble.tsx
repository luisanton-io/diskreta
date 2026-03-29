import { cn } from "@/lib/utils"

interface Props {
  message: SentMessage | ReceivedMessage
  sent: boolean
}

export default function MessageBubble({ message, sent }: Props) {
  const messageTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className={cn("flex", sent ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3 py-2",
          sent
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {message.content.text && (
          <p className="m-0 whitespace-pre-wrap break-words text-sm">
            {message.content.text}
          </p>
        )}
        {message.content.media && !message.content.text && (
          <p className="m-0 text-sm">📷 Photo</p>
        )}
        <p
          className={cn(
            "m-0 mt-1 text-right text-[0.65rem] leading-none",
            sent ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {messageTime}
        </p>
      </div>
    </div>
  )
}
