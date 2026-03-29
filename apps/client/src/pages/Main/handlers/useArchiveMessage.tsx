import { chatsState } from "atoms/chats";
import { AES, enc } from "crypto-js";
import usePrivateKey from "hooks/usePrivateKey";
import { util } from "node-forge";
import { useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSetRecoilState } from "recoil";

export default function useArchiveMessage() {

    const privateKey = usePrivateKey();

    const setChats = useSetRecoilState(chatsState)
    const navigate = useNavigate()

    const activeChatIdRef = useRef<string>()
    const { activeChatId } = useParams()

    activeChatIdRef.current = activeChatId

    const archiveMessage = useCallback((encryptedMessage: ReceivedMessage, { showToast = true }) => {

        if (!privateKey) return

        const decryptMedia = (media?: Media) => {
            try {
                if (!media) return
                const encryptionKey = util.decodeUtf8(privateKey.decrypt(util.decode64(media.encryptionKey)))
                return {
                    ...media,
                    encryptionKey,
                    data: AES.decrypt(media.data, encryptionKey).toString(enc.Utf8)
                }
            } catch (error) {
                console.log('error', error)
            }
        }

        const decryptText = (text?: string) => {
            return text ? util.decodeUtf8(privateKey.decrypt(util.decode64(text))) : ""
        }

        const message = {
            ...encryptedMessage,
            content: {
                text: decryptText(encryptedMessage.content.text),
                media: decryptMedia(encryptedMessage.content.media)
            }
        }

        if (encryptedMessage.replyingTo) {
            message.replyingTo = {
                ...encryptedMessage.replyingTo,
                content: {
                    text: decryptText(encryptedMessage.replyingTo.content.text),
                    media: decryptMedia(encryptedMessage.replyingTo.content.media)
                }
            }
        }

        const { chatId } = message

        setChats(chats => {

            if (
                Number.isSafeInteger(chats?.[chatId]?.indexing?.[message.hash]) // optional chaining 'indexing' for retrocompatibility
            ) return chats

            const chatToUpdate = chats?.[chatId]

            return ({
                ...chats,
                [chatId]: !!chatToUpdate
                    ? {
                        ...chatToUpdate,
                        messages: [
                            ...chatToUpdate.messages,
                            message,
                        ],
                        indexing: {
                            ...chatToUpdate.indexing,
                            [message.hash]: chatToUpdate.messages.length, // new index corresponds to old length
                        },
                    }
                    : {
                        id: chatId,
                        members: [...message.to, message.sender],
                        messages: [message],
                        indexing: {
                            [message.hash]: 0,
                        },
                    }
            })

        })

        if (showToast && chatId !== activeChatIdRef.current) {
            toast.info(`${message.sender.nick}: ${message.content.text}`, {
                position: toast.POSITION.TOP_CENTER,
                onClick: () => {
                    navigate(`/${chatId}`)
                },
                icon: <></>
            })
        }

    }, [privateKey, setChats, navigate])

    return archiveMessage
}