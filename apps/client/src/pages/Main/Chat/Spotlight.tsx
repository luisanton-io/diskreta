import { Close } from "@mui/icons-material";
import { MEDIA_PLACEHOLDER } from "constants/mediaPlaceholder";
import useActiveChat from "hooks/useActiveChat";
import usePrevious from "hooks/usePrevious";
import useUpdateMessage from "hooks/useUpdateMessage";
import { useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

export interface SpotlightProps {
    media: Media,
    hash: string,
    resetMedia: () => void
    onReset?: () => void
    isInput?: boolean
}

export default function Spotlight({ media, resetMedia, onReset, isInput = false, hash }: SpotlightProps) {
    const previousMedia = usePrevious(media)
    const [fading, setFading] = useState<'in' | 'out'>('in')

    const chatId = useActiveChat().activeChatId!
    const updateMessage = useUpdateMessage()

    const handleAnimationEnd = () => {
        resetMedia()
        onReset?.()

        !isInput && updateMessage({
            chatId,
            hash,
            updater: message => ({
                ...message,
                content: {
                    ...message.content,
                    media: message.content.media && ({
                        ...message.content.media,
                        data: MEDIA_PLACEHOLDER
                    })
                }
            })
        })
    }


    return <div id="spotlight" data-input-media={isInput}>
        <Close className="close-btn" onClick={() => setFading('out')} />
        <TransformWrapper>
            <TransformComponent>

                <img src={fading === 'out' ? previousMedia!.data : media.data}
                    className={`slide-${fading}-blurred-bottom`}
                    onAnimationEnd={() => fading === 'out' && handleAnimationEnd()}
                    alt="Spotlight"
                />
            </TransformComponent>
        </TransformWrapper>
    </div >
}