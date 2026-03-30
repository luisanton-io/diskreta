import { MEDIA_PLACEHOLDER } from "constants/mediaPlaceholder"
import useActiveChat from "hooks/useActiveChat"
import useUpdateMessage from "hooks/useUpdateMessage"
import { X } from "lucide-react"
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog"

export interface SpotlightProps {
  media: Media
  hash: string
  resetMedia: () => void
  onReset?: () => void
  isInput?: boolean
}

export default function Spotlight({
  media,
  resetMedia,
  onReset,
  isInput = false,
  hash,
}: SpotlightProps) {
  const chatId = useActiveChat().activeChatId!
  const updateMessage = useUpdateMessage()

  const handleClose = () => {
    resetMedia()
    onReset?.()

    if (!isInput) {
      updateMessage({
        chatId,
        hash,
        updater: (message) => ({
          ...message,
          content: {
            ...message.content,
            media: message.content.media && {
              ...message.content.media,
              data: MEDIA_PLACEHOLDER,
            },
          },
        }),
      })
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <DialogTitle className="sr-only">Media viewer</DialogTitle>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white transition-opacity hover:opacity-80"
          >
            <X className="size-5" />
          </button>

          <div className="h-full w-full animate-in fade-in zoom-in-95 duration-200">
            <TransformWrapper>
              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={media.data}
                  alt="Spotlight"
                  className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  )
}
