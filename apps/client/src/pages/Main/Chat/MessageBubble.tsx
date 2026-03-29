import { cn } from "@/lib/utils"
import { Clock, Check, CheckCheck } from "lucide-react"
import { isMessageSent } from "util/isMessageSent"

interface Props {
  message: SentMessage | ReceivedMessage
  sent: boolean
}

function StatusIcon({ message }: { message: SentMessage }) {
  const statusStr = message.status?.[message.to[0]._id]?.split(" ")[0] as
    | SentMessageStatusWithoutTime
    | undefined

  switch (statusStr) {
    case "outgoing":
      return <Clock className="inline-block h-3 w-3" />
    case "sent":
      return <Check className="inline-block h-3 w-3" />
    case "delivered":
      return <CheckCheck className="inline-block h-3 w-3" />
    case "read":
      return <CheckCheck className="inline-block h-3 w-3 text-blue-500" />
    default:
      return null
  }
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
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[0.65rem] leading-none",
            sent ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          <span>{messageTime}</span>
          {sent && isMessageSent(message) && (
            <StatusIcon message={message} />
          )}
        </div>
      </div>
    </div>
  )
}
