import { useChatsStore } from "stores/chats";
import { useCallback } from "react";

interface UpdateMessage {
    chatId: string,
    hash: string,
    updater: (message: SentMessage | ReceivedMessage) => SentMessage | ReceivedMessage
}

export default function useUpdateMessage() {
    const updateMessage = useChatsStore(state => state.updateMessage)

    return useCallback(({ chatId, hash, updater }: UpdateMessage) => {
        updateMessage(chatId, hash, updater)
    }, [updateMessage])
}