import { cn } from "@/lib/utils"
import { MEDIA_PLACEHOLDER } from "constants/mediaPlaceholder"
import { Clock, Check, CheckCheck } from "lucide-react"
import { useContext } from "react"
import { isMessageSent } from "util/isMessageSent"
import { ChatContext } from "./context/ChatCtx"
import { SpotlightProps } from "./Spotlight"

interface Props {
  message: SentMessage | ReceivedMessage
  sent: boolean
}

const urlRegexp =
  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/

const emojiRegex =
  /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){1,2}|(?:\ud83d[\udc00-\ude4f]){1,2}|(?:\ud83d[\ude80-\udeff]){1,2}|(?:\ud83e[\udd00-\udfff]){1,2}|[\u0023-\u0039]\u20e3|[\u200d\u2934-\u2935\u2b05-\u2b07\u2b1b\u2b1c\u2b50\u2b55\u3030\u303d\u3297\u3299]\ufe0f?)+$/

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

function renderTextWithLinks(text: string) {
  const words = text.split(/(\s+)/)
  return words.map((word, i) => {
    if (urlRegexp.test(word.trim())) {
      const href = word.trim().startsWith("http") ? word.trim() : `https://${word.trim()}`
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline break-all"
        >
          {word}
        </a>
      )
    }
    return word
  })
}

function isEmojiOnly(text: string): boolean {
  return emojiRegex.test(text.trim())
}

export default function MessageBubble({ message, sent }: Props) {
  const { setSpotlight } = useContext(ChatContext)

  const messageTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  const text = message.content.text
  const media = message.content.media
  const emojiOnly = text ? isEmojiOnly(text) : false

  const hasMediaData = media && media.data !== MEDIA_PLACEHOLDER

  const handleMediaClick = () => {
    if (!hasMediaData) return
    setSpotlight({
      media: media,
      hash: message.hash,
      resetMedia: () => {},
    } as SpotlightProps)
  }

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
        {media && (
          hasMediaData ? (
            <button
              type="button"
              onClick={handleMediaClick}
              className="mb-1 block overflow-hidden rounded-lg"
            >
              <img
                src={media.data}
                alt="Media"
                className="max-h-60 max-w-full rounded-lg object-contain"
              />
            </button>
          ) : (
            <p className="m-0 text-sm">
              📷 <span className="opacity-60">{sent ? "Sent" : "Opened"}</span>
            </p>
          )
        )}
        {text && (
          <p
            className={cn(
              "m-0 whitespace-pre-wrap break-words",
              emojiOnly ? "text-3xl leading-snug" : "text-sm"
            )}
          >
            {emojiOnly ? text : renderTextWithLinks(text)}
          </p>
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
