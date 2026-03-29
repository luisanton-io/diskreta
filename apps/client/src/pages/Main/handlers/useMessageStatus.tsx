import useUpdateMessage from "hooks/useUpdateMessage";
import { useCallback } from "react";
import { isMessageSent } from "util/isMessageSent";

export const SentMessageStatusValues: SentMessageStatusWithoutTime[] = [
    'outgoing', 'error', 'sent', 'delivered', 'read'
]

export const ReceivedMessageStatusValues: ReceivedMessageStatus[] = [
    'new', 'read'
]

export default function useMessageStatus() {

    const updateMessage = useUpdateMessage()

    return useCallback(({ chatId, hash, recipientId, status, timestamp = Date.now() }: MessageStatusUpdate, ack?: Function) => {

        updateMessage({
            chatId, hash, updater: message => {

                if (isMessageSent(message)) {
                    if (SentMessageStatusValues.indexOf(message.status[recipientId].split(' ')[0] as SentMessageStatusWithoutTime) < SentMessageStatusValues.indexOf(status as SentMessageStatusWithoutTime)) {
                        return {
                            ...message,
                            status: {
                                ...message.status,
                                // Changing this to tuple (as it should) would break the app for old users :(
                                [recipientId]: `${status} ${timestamp}` as SentMessageStatus
                            }
                        }
                    }
                } else {
                    if (ReceivedMessageStatusValues.indexOf(message.status) < ReceivedMessageStatusValues.indexOf(status as ReceivedMessageStatus)) {
                        return {
                            ...message,
                            status: status as ReceivedMessageStatus
                        }
                    }
                }

                return message

            }
        })

        ack?.()
    }, [updateMessage])
}