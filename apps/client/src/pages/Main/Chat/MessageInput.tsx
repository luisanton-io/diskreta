import { Close } from "@mui/icons-material";
import { refreshToken } from "API/refreshToken";
import { chatsState } from "atoms/chats";
import { replyingToState } from "atoms/replyingTo";
import { userState } from "atoms/user";
import imageCompression from 'browser-image-compression';
import { MEDIA_PLACEHOLDER } from "constants/mediaPlaceholder";
import { AES, SHA256 } from "crypto-js";
import heic2any from "heic2any";
import { pki, random, util } from "node-forge";
import { useContext, useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Camera, Send } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Socket } from "socket.io-client";
import convertFileToBase64 from "util/convertFileToBase64";
import maskUser from "util/maskUser";
import useMessageStatus from "../handlers/useMessageStatus";
import { ChatContext } from "./context/ChatCtx";
import { SpotlightProps } from "./Spotlight";
import Typing from "./Typing";

export default function MessageInput() {

    const setChats = useSetRecoilState(chatsState)
    const user = useRecoilValue(userState)

    const handleMessageStatus = useMessageStatus()

    const { socket, connected, recipients, activeChat, setSpotlight, handleScrollTo } = useContext(ChatContext)
    const socketRef = useRef<Socket>(socket)

    useEffect(() => {
        socketRef.current = socket
    }, [socket])

    const [text, setText] = useState('')

    const [media, setMedia] = useState<Media>()

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault()

        console.log('sending msg')

        if (!socketRef.current?.connected) try {
            await refreshToken()
        } catch {
            return toast.error('Cannot connect. Try again later.')
        }

        if (!text && !media) return

        const payload: Omit<SentMessage, "hash" | "status"> = {
            sender: maskUser(user)!,
            to: recipients,
            chatId: activeChat.id,
            content: { text, media },
            timestamp: Date.now(),
            replyingTo
        }

        const message = {
            ...payload,
            hash: SHA256(JSON.stringify(payload)).toString(),
        }

        const sentMessage: SentMessage = {
            ...message,
            content: {
                text: message.content.text,
                media: message.content.media && {
                    ...message.content.media,
                    data: MEDIA_PLACEHOLDER
                }
            },
            status: recipients.reduce((all, { _id }) => ({
                ...all,
                [_id]: 'outgoing'
            }), {})
        }

        setChats(chats => ({
            ...chats,
            [activeChat.id]: {
                ...activeChat,
                messages: [
                    ...activeChat.messages,
                    sentMessage
                ],
                indexing: {
                    ...(activeChat.indexing || {}),
                    [sentMessage.hash]: activeChat.messages.length
                }
            }
        }))

        for (const recipient of recipients) {

            const publicKey = pki.publicKeyFromPem(recipient.publicKey)

            const encryptionKey = media && util.encode64(publicKey.encrypt(util.encodeUtf8(media.encryptionKey)))

            const outgoingMessage: OutgoingMessage = {
                ...message,
                to: recipients,
                for: recipient._id,
                content: {
                    text: text && util.encode64(publicKey.encrypt(util.encodeUtf8(text))),
                    media: media && {
                        type: media.type,
                        encryptionKey: encryptionKey!,
                        data: AES.encrypt(media.data, media.encryptionKey).toString()
                    }
                },
                replyingTo: replyingTo && {
                    ...replyingTo,
                    content: {
                        text: util.encode64(publicKey.encrypt(util.encodeUtf8(
                            replyingTo.content.text || '📷' // either text or media
                        )))
                    }
                }
            }

            delete outgoingMessage.sender;

            (async () => {
                try {
                    let sent = false
                    do {
                        sent = await new Promise(resolve => {
                            socketRef.current?.emit("out-msg", outgoingMessage, (recipientId: string) => {
                                if (!recipientId) return setTimeout(() => {
                                    resolve(false)
                                }, 1000)

                                handleMessageStatus({
                                    chatId: activeChat.id,
                                    hash: message.hash,
                                    recipientId,
                                    status: 'sent'
                                })
                                resolve(true)
                            })

                            setTimeout(() => {
                                resolve(false)
                            }, 3000) // retry - maybe jwt expired

                        })
                    } while (!sent)

                    console.log("Message sent: ", sent)
                } catch (error) {
                    console.log(error)
                }
            })()
        }

        setMedia(undefined)
        setText('')
        setReplyingTo(undefined)
        setSpotlight({} as SpotlightProps)
    }

    const handleFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
        try {

            const selectedFile = await (async () => {
                const file = e.target.files![0] as File

                if (!file.name.toLowerCase().endsWith('heic')) {
                    return file
                }

                const pngBlob = await heic2any({
                    blob: new Blob([file], { type: file.type }),
                    toType: "image/png",
                }) as Blob

                return new File([pngBlob], "name", { type: pngBlob.type })
            })()

            const compressedFile = await imageCompression(
                selectedFile,
                {
                    maxWidthOrHeight: 1000,
                    maxSizeMB: 0.8,
                    useWebWorker: true
                }
            )

            const media: Media = {
                type: 'image',
                data: await convertFileToBase64(compressedFile),
                encryptionKey: util.bytesToHex(random.getBytesSync(32))
            }

            setMedia(media)
        } catch (error) {
            console.error(error)
            toast.error((error as Error).message)
        }

    }

    useEffect(() => {
        media && setSpotlight(s => ({
            ...s,
            media,
            isInput: true,
            onReset: () => {
                setMedia(undefined)
            },
        }))
    }, [media, setSpotlight])

    const [replyingTo, setReplyingTo] = useRecoilState(replyingToState)

    useEffect(() => {
        setReplyingTo(undefined)
    }, [activeChat.id, setReplyingTo])

    const [isTyping, setIsTyping] = useState(false)

    useEffect(() => {
        setIsTyping(!!text)

        const timeout = !!text && setTimeout(() => {
            console.log('stopped typing')
            setIsTyping(false)
        }, 2000)

        return () => {
            timeout && clearTimeout(timeout)
        }
    }, [text])

    useEffect(() => {
        const interval = isTyping && setInterval(() => {
            for (const recipient of recipients) {
                console.log('typing')
                socket.emit('typing', {
                    chatId: activeChat.id,
                    recipient,
                    sender: maskUser(user)!
                })
            }
        }, 400)

        return () => {
            interval && clearInterval(interval)
        }
    }, [isTyping, recipients, socket, activeChat.id, user])

    return <Form onSubmit={handleSendMessage} className="cursor-pointer position-relative d-flex flex-column pt-4" style={{ zIndex: Number(!!media) }}>
        {
            !!activeChat.typing?.length && <Typing />
        }
        {
            replyingTo &&
            <div id="reply" className="d-flex align-items-center" onClick={handleScrollTo(replyingTo.hash)}>
                <div className="col">
                    <p>{replyingTo.sender.nick}</p>
                    <p>{replyingTo.content.text}</p>
                </div>
                <Close
                    onClick={e => {
                        e.stopPropagation()
                        setReplyingTo(undefined)
                    }}
                    style={{ transform: 'scale(0.7)' }}
                />
            </div>
        }
        <div className="d-flex">
            {
                !media && (
                    <Button variant="outline-light" className="rounded-0" style={{ borderRight: 'transparent' }}>
                        <label htmlFor="media-input">
                            <Camera />
                        </label>
                        <input type="file" id="media-input" className="d-none" onChange={handleFile} />
                    </Button>
                )
            }
            <textarea id="msg-input" autoComplete="off"
                className="rounded-0 text-white p-3 bg-transparent flex-grow-1 border-light"
                placeholder="Type a message..."
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage(e)}
            />
            <Button type="submit" className="btn-submit ms-2" variant="outline-info" disabled={(!text && !media) || !connected}>
                <Send />
            </Button>

        </div>
    </Form>
}