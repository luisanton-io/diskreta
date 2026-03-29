import { chatsState } from "atoms/chats";
import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
interface UpdateMessage {
    chatId: string,
    hash: string,
    updater: (message: SentMessage | ReceivedMessage) => SentMessage | ReceivedMessage
}

export default function useUpdateMessage() {
    const setChats = useSetRecoilState(chatsState)

    return useCallback(({ chatId, hash, updater }: UpdateMessage) => {
        setChats(chats => {
            if (!chats?.[chatId]) return chats

            const indexToUpdate = chats[chatId].indexing[hash]
            const messages = [...chats[chatId].messages]

            messages[indexToUpdate] = updater({ ...messages[indexToUpdate] })

            return ({
                ...chats,
                [chatId]: { ...chats[chatId], messages }
            })
        })
    }, [setChats])
}