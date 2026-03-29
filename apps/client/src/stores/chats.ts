import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CHATS } from 'constants/localStorage'
import { encryptedStorage } from './middleware/encrypted-storage'

interface ChatsState {
    chats: Record<string, Chat> | null
    setChats: (chats: Record<string, Chat> | null) => void
    updateChat: (chatId: string, chat: Chat) => void
    deleteChat: (chatId: string) => void
    updateMessage: (
        chatId: string,
        hash: string,
        updater: (msg: SentMessage | ReceivedMessage) => SentMessage | ReceivedMessage
    ) => void
    setTyping: (chatId: string, userIds: User['_id'][] | undefined) => void
    hydrate: () => void
}

export const useChatsStore = create<ChatsState>()(
    persist(
        (set, get) => ({
            chats: null,

            setChats: (chats) => set({ chats }),

            updateChat: (chatId, chat) => {
                const chats = get().chats
                if (!chats) return
                set({ chats: { ...chats, [chatId]: chat } })
            },

            deleteChat: (chatId) => {
                const chats = get().chats
                if (!chats) return
                const { [chatId]: _, ...rest } = chats
                set({ chats: rest })
            },

            updateMessage: (chatId, hash, updater) => {
                const chats = get().chats
                if (!chats) return
                const chat = chats[chatId]
                if (!chat) return

                const msgIndex = chat.indexing[hash]
                if (msgIndex === undefined) return

                const messages = [...chat.messages]
                messages[msgIndex] = updater(messages[msgIndex])
                set({
                    chats: {
                        ...chats,
                        [chatId]: { ...chat, messages },
                    },
                })
            },

            setTyping: (chatId, userIds) => {
                const chats = get().chats
                if (!chats) return
                const chat = chats[chatId]
                if (!chat) return
                set({
                    chats: {
                        ...chats,
                        [chatId]: { ...chat, typing: userIds },
                    },
                })
            },

            hydrate: () => {
                useChatsStore.persist.rehydrate()
            },
        }),
        {
            name: CHATS,
            storage: createJSONStorage(() => encryptedStorage),
            partialize: (state) => ({ chats: state.chats }),
            skipHydration: true,
        }
    )
)
